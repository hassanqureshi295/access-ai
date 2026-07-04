"""
Authentication service for AccessAI.

Provides user registration, login, and JWT token management with
password hashing and JSON file persistence.
"""

import json
import threading
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import jwt
from passlib.context import CryptContext

from app.config import Settings, get_settings
from app.models.response import AuthResponse, UserProfile
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Password hashing context — bcrypt with automatic deprecation handling
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Default path for user records JSON
DEFAULT_USERS_PATH = Path("data") / "users.json"

# JWT algorithm
JWT_ALGORITHM = "HS256"


class AuthError(Exception):
    """Base class for authentication errors."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class UserAlreadyExistsError(AuthError):
    """Raised when signup email is already registered."""

    def __init__(self, email: str):
        super().__init__(
            f"An account with email '{email}' already exists.",
            status_code=409,
        )


class InvalidCredentialsError(AuthError):
    """Raised when login email or password is incorrect."""

    def __init__(self):
        super().__init__(
            "Invalid email or password.",
            status_code=401,
        )


class InvalidTokenError(AuthError):
    """Raised when a JWT is missing, expired, or tampered with."""

    def __init__(self, message: str = "Invalid or expired authentication token."):
        super().__init__(message, status_code=401)


class AuthService:
    """
    File-backed user authentication with JWT access tokens.

    Users are stored in data/users.json with bcrypt-hashed passwords.
    """

    def __init__(
        self,
        settings: Optional[Settings] = None,
        storage_path: Optional[Path] = None,
    ):
        """
        Initialize the auth service.

        Args:
            settings: Application settings for JWT secret and expiry.
            storage_path: Path to users JSON file.
        """
        self.settings = settings or get_settings()
        self.storage_path = storage_path or DEFAULT_USERS_PATH
        self._lock = threading.Lock()
        self._ensure_storage()

    def _ensure_storage(self) -> None:
        """Create data directory and empty users file if missing."""
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.storage_path.exists():
            self._write_users([])
            logger.info("Created empty users file at %s", self.storage_path)

    def _read_users(self) -> List[Dict[str, Any]]:
        """Load all user records from disk."""
        try:
            raw = self.storage_path.read_text(encoding="utf-8")
            data = json.loads(raw) if raw.strip() else []
            return data if isinstance(data, list) else []
        except json.JSONDecodeError:
            logger.warning("Corrupt users file — resetting to empty list")
            return []

    def _write_users(self, users: List[Dict[str, Any]]) -> None:
        """Persist users list to disk."""
        self.storage_path.write_text(
            json.dumps(users, indent=2, default=str),
            encoding="utf-8",
        )

    def _hash_password(self, password: str) -> str:
        """Return a bcrypt hash for the given plain-text password."""
        return pwd_context.hash(password)

    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Check plain password against stored bcrypt hash."""
        return pwd_context.verify(plain_password, hashed_password)

    def _create_access_token(self, user: Dict[str, Any]) -> str:
        """
        Build a signed JWT for the authenticated user.

        Payload includes user id (sub), name, email, and expiration.
        """
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=self.settings.jwt_expire_minutes
        )
        payload = {
            "sub": user["id"],
            "name": user["name"],
            "email": user["email"],
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }
        return jwt.encode(
            payload,
            self.settings.jwt_secret,
            algorithm=JWT_ALGORITHM,
        )

    def _to_user_profile(self, user: Dict[str, Any]) -> UserProfile:
        """Convert stored user dict to public UserProfile (no password)."""
        return UserProfile(
            id=user["id"],
            name=user["name"],
            email=user["email"],
        )

    def _build_auth_response(self, user: Dict[str, Any]) -> AuthResponse:
        """Create AuthResponse with JWT and user profile."""
        token = self._create_access_token(user)
        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user=self._to_user_profile(user),
        )

    def _find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Look up a user record by email (case-insensitive)."""
        normalized = email.strip().lower()
        for user in self._read_users():
            if user.get("email", "").lower() == normalized:
                return user
        return None

    def signup(self, name: str, email: str, password: str) -> AuthResponse:
        """
        Register a new user account.

        Args:
            name: Display name.
            email: Unique email address.
            password: Plain-text password (hashed before storage).

        Returns:
            AuthResponse with JWT and new user profile.

        Raises:
            UserAlreadyExistsError: If email is already taken.
        """
        normalized_email = email.strip().lower()

        with self._lock:
            users = self._read_users()

            if any(u.get("email", "").lower() == normalized_email for u in users):
                raise UserAlreadyExistsError(normalized_email)

            user = {
                "id": str(uuid.uuid4()),
                "name": name.strip(),
                "email": normalized_email,
                "password_hash": self._hash_password(password),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            users.append(user)
            self._write_users(users)

        logger.info("New user registered id=%s email=%s", user["id"], normalized_email)
        return self._build_auth_response(user)

    def login(self, email: str, password: str) -> AuthResponse:
        """
        Authenticate an existing user.

        Args:
            email: Registered email address.
            password: Plain-text password.

        Returns:
            AuthResponse with JWT and user profile.

        Raises:
            InvalidCredentialsError: If email or password is wrong.
        """
        user = self._find_user_by_email(email)

        if not user or not self._verify_password(password, user["password_hash"]):
            logger.warning("Failed login attempt for email=%s", email)
            raise InvalidCredentialsError()

        logger.info("User logged in id=%s", user["id"])
        return self._build_auth_response(user)

    def verify_token(self, token: str) -> UserProfile:
        """
        Decode and validate a JWT access token.

        Args:
            token: Bearer token string (without 'Bearer ' prefix).

        Returns:
            UserProfile for the authenticated user.

        Raises:
            InvalidTokenError: If token is invalid or expired.
        """
        try:
            payload = jwt.decode(
                token,
                self.settings.jwt_secret,
                algorithms=[JWT_ALGORITHM],
            )
            user_id = payload.get("sub")
            if not user_id:
                raise InvalidTokenError()

            # Confirm user still exists in storage
            with self._lock:
                users = self._read_users()

            for user in users:
                if user.get("id") == user_id:
                    return self._to_user_profile(user)

            raise InvalidTokenError("User account no longer exists.")

        except jwt.ExpiredSignatureError as exc:
            raise InvalidTokenError("Authentication token has expired.") from exc
        except jwt.InvalidTokenError as exc:
            raise InvalidTokenError() from exc

    def get_user_by_id(self, user_id: str) -> Optional[UserProfile]:
        """
        Look up a user profile by ID.

        Args:
            user_id: Unique user identifier.

        Returns:
            UserProfile or None if not found.
        """
        with self._lock:
            users = self._read_users()

        for user in users:
            if user.get("id") == user_id:
                return self._to_user_profile(user)
        return None


# Module-level singleton for route handlers
_auth_service: Optional[AuthService] = None


def get_auth_service() -> AuthService:
    """Return a shared AuthService instance for dependency injection."""
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service
