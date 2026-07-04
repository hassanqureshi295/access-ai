"""
FastAPI route handlers for the AccessAI REST API.

Exposes all endpoints defined in the project specification:
health, chat, history, login, and signup.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.config import get_settings
from app.models.request import ChatRequest, LoginRequest, SignupRequest
from app.models.response import (
    AuthResponse,
    ChatResponse,
    DeleteHistoryResponse,
    HealthResponse,
    HistoryListResponse,
)
from app.services.auth_service import (
    AuthError,
    get_auth_service,
)
from app.services.history_service import HistoryNotFoundError, get_history_service
from app.services.openai_service import OpenAIServiceError, get_openai_service
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Application version returned by /health
APP_VERSION = "1.0.0"

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check() -> HealthResponse:
    """
    Return service health status and configuration summary.

    Used by load balancers, monitoring, and the frontend to verify
    the backend is running and OpenAI is configured.
    """
    settings = get_settings()
    openai_service = get_openai_service()

    return HealthResponse(
        status="ok",
        version=APP_VERSION,
        environment=settings.app_env,
        openai_configured=openai_service.is_configured(),
    )


@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Send a user message to the AI assistant and return a structured response.

    The response includes Summary, Recommendations, Useful Links, and
    Action Plan sections parsed from OpenAI markdown output.
 
    Automatically saves the exchange to chat history.
    """
    openai_service = get_openai_service()
    history_service = get_history_service()

    try:
        response = await openai_service.generate_chat_response(
            user_message=request.message,
            template_key=request.template,
        )
    except OpenAIServiceError as exc:
        logger.error("Chat failed: %s", exc.message)
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    except ValueError as exc:
        logger.error("Chat configuration error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    history_service.add_entry(
        user_message=request.message,
        chat_response=response,
        template=request.template,
        user_id=request.user_id,
    )

    return response


@router.get("/history", response_model=HistoryListResponse, tags=["History"])
async def get_history(
    query: Optional[str] = Query(
        default=None,
        max_length=200,
        description="Search term to filter by title, message, or summary",
    ),
    user_id: Optional[str] = Query(
        default=None,
        max_length=100,
        description="Filter history entries for a specific user",
    ),
) -> HistoryListResponse:
    """
    List chat history entries with optional search and user filters.

    Results are ordered newest first. Search is case-insensitive.
    """
    history_service = get_history_service()
    return history_service.list_entries(query=query, user_id=user_id)


@router.delete(
    "/history/{entry_id}",
    response_model=DeleteHistoryResponse,
    tags=["History"],
)
async def delete_history(entry_id: str) -> DeleteHistoryResponse:
    """
    Delete a single chat history entry by ID.

    Returns 404 if the entry does not exist.
    """
    history_service = get_history_service()

    try:
        return history_service.delete_entry(entry_id)
    except HistoryNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"History entry '{entry_id}' not found.",
        ) from exc


@router.post("/login", response_model=AuthResponse, tags=["Auth"])
async def login(request: LoginRequest) -> AuthResponse:
    """
    Authenticate a user with email and password.

    Returns a JWT access token and user profile on success.
    """
    auth_service = get_auth_service()

    try:
        return auth_service.login(
            email=str(request.email),
            password=request.password,
        )
    except AuthError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/signup", response_model=AuthResponse, tags=["Auth"])
async def signup(request: SignupRequest) -> AuthResponse:
    """
    Register a new user account.

    Returns a JWT access token and user profile on success.
    Email addresses must be unique.
    """
    auth_service = get_auth_service()

    try:
        return auth_service.signup(
            name=request.name,
            email=str(request.email),
            password=request.password,
        )
    except AuthError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
