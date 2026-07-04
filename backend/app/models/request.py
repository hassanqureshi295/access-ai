"""
Pydantic request models for AccessAI API endpoints.

These schemas validate and document incoming request bodies before
they reach route handlers or service layers.
"""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class ChatRequest(BaseModel):
    """Payload for POST /chat — user question sent to the AI assistant."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="User question or prompt for the AI assistant",
        examples=["I want scholarships in Germany"],
    )
    template: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Optional prompt template key (e.g. scholarships, internships)",
    )
    user_id: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Optional user identifier for associating chat history",
    )

    @field_validator("message")
    @classmethod
    def strip_message(cls, value: str) -> str:
        """Remove leading/trailing whitespace and reject empty strings."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Message cannot be empty or whitespace only")
        return cleaned

    @field_validator("template")
    @classmethod
    def normalize_template(cls, value: Optional[str]) -> Optional[str]:
        """Normalize template key to lowercase snake_case-friendly form."""
        if value is None:
            return None
        cleaned = value.strip().lower()
        return cleaned or None


class LoginRequest(BaseModel):
    """Payload for POST /login — authenticate an existing user."""

    email: EmailStr = Field(
        ...,
        description="Registered email address",
        examples=["student@university.edu"],
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Account password",
    )


class SignupRequest(BaseModel):
    """Payload for POST /signup — register a new user account."""

    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Full name displayed in the profile",
        examples=["Alex Johnson"],
    )
    email: EmailStr = Field(
        ...,
        description="Unique email address for the account",
        examples=["student@university.edu"],
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Account password (minimum 6 characters)",
    )

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        """Trim whitespace and ensure name is not empty after stripping."""
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Name must be at least 2 characters")
        return cleaned


class HistorySearchRequest(BaseModel):
    """Optional query parameters for filtering chat history."""

    query: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Search term to filter history by title or message content",
    )
    user_id: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Filter history entries for a specific user",
    )

    @field_validator("query")
    @classmethod
    def strip_query(cls, value: Optional[str]) -> Optional[str]:
        """Return None for blank search strings."""
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None
