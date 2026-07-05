# """
# Google Gemini chat completion service for AccessAI.

# Handles API calls, error translation, and conversion of model output
# into structured ChatResponse objects.
# """

# from typing import Optional

# import google.generativeai as genai
# from google.api_core import exceptions as google_exceptions

# from app.config import Settings, get_settings
# from app.models.response import ChatResponse
# from app.services.formatter import build_chat_response
# from app.services.prompt import build_user_message, get_system_prompt
# from app.utils.logger import get_logger

# logger = get_logger(__name__)


# class GeminiServiceError(Exception):
#     """Raised when the Gemini API returns an error or is misconfigured."""

#     def __init__(self, message: str, status_code: int = 502):
#         self.message = message
#         self.status_code = status_code
#         super().__init__(message)


#         # print(self.settings.gemini_model)

# class GeminiService:
#     """
#     Wrapper around the Google Gemini API for AccessAI chat requests.

#     Uses google-generativeai SDK with async content generation.
#     """

#     def __init__(self, settings: Optional[Settings] = None):
#         self.settings = settings or get_settings()
#         self._configured = False

#     def _ensure_client(self) -> None:
#         """Configure the Gemini SDK with the API key from settings."""
#         self.settings.validate_gemini_key()
#         if not self._configured:
#             genai.configure(api_key=self.settings.gemini_api_key)
#             self._configured = True

#     def is_configured(self) -> bool:
#         """Return True if a non-placeholder Gemini API key is set."""
#         key = self.settings.gemini_api_key.strip()
#         placeholders = ("your-gemini", "gemini-api-key", "paste-your")
#         return bool(key) and not any(p in key.lower() for p in placeholders)

#     async def generate_chat_response(
#         self,
#         user_message: str,
#         template_key: Optional[str] = None,
#         chat_id: Optional[str] = None,
#     ) -> ChatResponse:
#         """
#         Send a user message to Gemini and return a structured ChatResponse.

#         Args:
#             user_message: Raw text from the user chat input.
#             template_key: Optional prompt template category key.
#             chat_id: Optional ID to attach to the response.

#         Returns:
#             Parsed ChatResponse with summary, recommendations, links, and action plan.

#         Raises:
#             GeminiServiceError: On missing API key, auth failure, rate limits, or API errors.
#         """
#         self._ensure_client()

#         system_prompt = get_system_prompt()
#         final_user_message = build_user_message(user_message, template_key)

#         logger.info(
#             "Sending chat request to Gemini model=%s template=%s",
#             self.settings.gemini_model,
#             template_key or "none",
#         )

#         model = genai.GenerativeModel(
#             model_name=self.settings.gemini_model,
#             system_instruction=system_prompt,
#         )

#         generation_config = genai.types.GenerationConfig(
#             temperature=0.7,
#             max_output_tokens=2048,
#         )

#         try:
#             response = await model.generate_content_async(
#                 final_user_message,
#                 generation_config=generation_config,
#             )
#         except google_exceptions.Unauthenticated as exc:
#             logger.error("Gemini authentication failed: %s", exc)
#             raise GeminiServiceError(
#                 "Invalid Gemini API key. Check GEMINI_API_KEY in your .env file.",
#                 status_code=401,
#             ) from exc
#         except google_exceptions.PermissionDenied as exc:
#             logger.error("Gemini permission denied: %s", exc)
#             raise GeminiServiceError(
#                 "Gemini API access denied. Verify your API key and billing.",
#                 status_code=403,
#             ) from exc
#         except google_exceptions.ResourceExhausted as exc:
#             logger.warning("Gemini rate limit exceeded: %s", exc)
#             raise GeminiServiceError(
#                 "Gemini rate limit exceeded. Please try again in a few moments.",
#                 status_code=429,
#             ) from exc
#         except google_exceptions.ServiceUnavailable as exc:
#             logger.error("Gemini service unavailable: %s", exc)
#             raise GeminiServiceError(
#                 "Gemini service is temporarily unavailable. Please try again later.",
#                 status_code=503,
#             ) from exc
#         except google_exceptions.GoogleAPIError as exc:
#             logger.error("Gemini API error: %s", exc)
#             raise GeminiServiceError(
#                 f"Gemini API error: {exc.message}",
#                 status_code=getattr(exc, "code", 502) or 502,
#             ) from exc
#         except Exception as exc:
#             logger.exception("Unexpected Gemini error")
#             raise GeminiServiceError(
#                 "An unexpected error occurred while generating the AI response.",
#                 status_code=500,
#             ) from exc

#         content = response.text if response and hasattr(response, "text") else None

#         if not content or not content.strip():
#             logger.error("Gemini returned empty content")
#             raise GeminiServiceError(
#                 "Gemini returned an empty response. Please try again.",
#                 status_code=502,
#             )

#         logger.info("Gemini response received (%d chars)", len(content))

#         return build_chat_response(
#             markdown=content.strip(),
#             chat_id=chat_id,
#         )


# _gemini_service: Optional[GeminiService] = None


# def get_gemini_service() -> GeminiService:
#     """Return a shared GeminiService instance for dependency injection."""
#     global _gemini_service
#     if _gemini_service is None:
#         _gemini_service = GeminiService()
#     return _gemini_service
