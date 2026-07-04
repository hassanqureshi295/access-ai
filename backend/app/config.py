"""
Application configuration loaded from environment variables.

Uses Pydantic Settings to validate and type-coerce values from `.env`
and the process environment at startup.
"""

from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the AccessAI FastAPI backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # OpenAI
    openai_api_key: str = Field(
        default="",
        description="API key for OpenAI chat completions",
    )
    openai_model: str = Field(
        default="gpt-4o-mini",
        description="OpenAI model identifier",
    )

    # Server
    host: str = Field(default="0.0.0.0", description="Uvicorn bind host")
    port: int = Field(default=8000, ge=1, le=65535, description="Uvicorn bind port")

    # CORS — stored as comma-separated string, exposed as list via property
    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        description="Comma-separated allowed frontend origins",
    )

    # Authentication
    jwt_secret: str = Field(
        default="change-this-to-a-secure-random-secret-in-production",
        min_length=16,
        description="Secret used to sign JWT access tokens",
    )
    jwt_expire_minutes: int = Field(
        default=1440,
        ge=5,
        description="JWT lifetime in minutes",
    )

    # Runtime
    app_env: str = Field(default="development", description="development | production")
    debug: bool = Field(default=True, description="Enable verbose debug logging")

    @field_validator("app_env")
    @classmethod
    def normalize_app_env(cls, value: str) -> str:
        """Normalize environment name to lowercase."""
        normalized = value.strip().lower()
        if normalized not in {"development", "production"}:
            raise ValueError("APP_ENV must be 'development' or 'production'")
        return normalized

    @property
    def cors_origin_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a clean list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        """True when running in production mode."""
        return self.app_env == "production"

    @property
    def is_development(self) -> bool:
        """True when running in development mode."""
        return self.app_env == "development"

    def validate_openai_key(self) -> None:
        """
        Ensure OpenAI API key is configured before chat routes run.

        Raises:
            ValueError: If the key is missing or still a placeholder.
        """
        key = self.openai_api_key.strip()
        if not key or key.startswith("sk-your-"):
            raise ValueError(
                "OPENAI_API_KEY is not configured. "
                "Copy backend/.env.example to backend/.env and set a valid key."
            )


@lru_cache
def get_settings() -> Settings:
    """
    Return a cached Settings instance (singleton per process).

    Cached so repeated dependency injections do not re-read `.env`.
    """
    return Settings()
