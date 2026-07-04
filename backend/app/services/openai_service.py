"""
OpenAI chat completion service for AccessAI.

Handles API calls, error translation, and conversion of model output
into structured ChatResponse objects.
"""

from typing import Optional

from openai import (
    APIConnectionError,
    APIStatusError,
    AsyncOpenAI,
    AuthenticationError,
    RateLimitError,
)

from app.config import Settings, get_settings
from app.models.response import ChatResponse
from app.services.formatter import build_chat_response
from app.services.prompt import build_user_message, get_system_prompt
from app.utils.logger import get_logger

logger = get_logger(__name__)


class OpenAIServiceError(Exception):
    """Raised when the OpenAI API returns an error or is misconfigured."""

    def __init__(self, message: str, status_code: int = 502):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class OpenAIService:
    """
    Wrapper around the OpenAI Python SDK for AccessAI chat requests.

    Instantiates a client from application settings and exposes a single
    generate_chat_response method used by the /chat route.
    """

    def __init__(self, settings: Optional[Settings] = None):
        """
        Initialize the service with optional settings override (for testing).

        Args:
            settings: Application settings; defaults to cached get_settings().
        """
        self.settings = settings or get_settings()
        self._client: Optional[AsyncOpenAI] = None

    @property
    def client(self) -> AsyncOpenAI:
        """Lazy-initialize the async OpenAI client on first use."""
        if self._client is None:
            self.settings.validate_openai_key()
            self._client = AsyncOpenAI(api_key=self.settings.openai_api_key)
        return self._client

    def is_configured(self) -> bool:
        """Return True if a non-placeholder OpenAI API key is set."""
        key = self.settings.openai_api_key.strip()
        return bool(key) and not key.startswith("sk-your-")

    async def generate_chat_response(
        self,
        user_message: str,
        template_key: Optional[str] = None,
        chat_id: Optional[str] = None,
    ) -> ChatResponse:
        """
        Send a user message to OpenAI and return a structured ChatResponse.

        Args:
            user_message: Raw text from the user chat input.
            template_key: Optional prompt template category key.
            chat_id: Optional ID to attach to the response (for history).

        Returns:
            Parsed ChatResponse with summary, recommendations, links, and action plan.

        Raises:
            OpenAIServiceError: On missing API key, auth failure, rate limits, or API errors.
        """
        self.settings.validate_openai_key()

        system_prompt = get_system_prompt()
        final_user_message = build_user_message(user_message, template_key)

        logger.info(
            "Sending chat request to OpenAI model=%s template=%s",
            self.settings.openai_model,
            template_key or "none",
        )

        try:
            completion = await self.client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": final_user_message},
                ],
                temperature=0.7,
                max_tokens=2048,
            )
        except AuthenticationError as exc:
            logger.error("OpenAI authentication failed: %s", exc)
            raise OpenAIServiceError(
                "Invalid OpenAI API key. Check OPENAI_API_KEY in your .env file.",
                status_code=401,
            ) from exc
        except RateLimitError as exc:
            logger.warning("OpenAI rate limit exceeded: %s", exc)
            raise OpenAIServiceError(
                "OpenAI rate limit exceeded. Please try again in a few moments.",
                status_code=429,
            ) from exc
        except APIConnectionError as exc:
            logger.error("OpenAI connection error: %s", exc)
            raise OpenAIServiceError(
                "Could not connect to OpenAI. Check your network connection.",
                status_code=503,
            ) from exc
        except APIStatusError as exc:
            logger.error("OpenAI API status error: %s", exc)
            raise OpenAIServiceError(
                f"OpenAI API error: {exc.message}",
                status_code=exc.status_code or 502,
            ) from exc
        except Exception as exc:
            logger.exception("Unexpected OpenAI error")
            raise OpenAIServiceError(
                "An unexpected error occurred while generating the AI response.",
                status_code=500,
            ) from exc

        # Extract assistant message content from the completion
        choice = completion.choices[0] if completion.choices else None
        content = choice.message.content if choice and choice.message else None

        if not content or not content.strip():
            logger.error("OpenAI returned empty content")
            raise OpenAIServiceError(
                "OpenAI returned an empty response. Please try again.",
                status_code=502,
            )

        logger.info("OpenAI response received (%d chars)", len(content))

        return build_chat_response(
            markdown=content.strip(),
            chat_id=chat_id,
        )


# Module-level singleton for route handlers
_openai_service: Optional[OpenAIService] = None


def get_openai_service() -> OpenAIService:
    """Return a shared OpenAIService instance for dependency injection."""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service
