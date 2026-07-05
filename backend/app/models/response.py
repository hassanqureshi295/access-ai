"""
Pydantic response models for AccessAI API endpoints.

Defines the shape of every JSON response returned by the backend,
including structured AI output and standard error envelopes.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class UsefulLink(BaseModel):
    """A single curated link returned inside an AI chat response."""

    title: str = Field(..., description="Display title for the link")
    url: str = Field(..., description="Full URL to the resource")
    description: Optional[str] = Field(
        default=None,
        description="Short explanation of why this link is relevant",
    )


class ChatResponse(BaseModel):
    """
    Structured AI assistant reply for POST /chat.

    Matches the spec format: Summary, Recommendations, Useful Links, Action Plan.
    """

    id: str = Field(..., description="Unique identifier for this chat entry")
    summary: str = Field(..., description="Brief overview of the AI response")
    recommendations: List[str] = Field(
        default_factory=list,
        description="Bullet-point recommendations tailored to the user",
    )
    useful_links: List[UsefulLink] = Field(
        default_factory=list,
        description="Curated external resources",
    )
    action_plan: List[str] = Field(
        default_factory=list,
        description="Step-by-step actions the user can take next",
    )
    markdown: str = Field(
        ...,
        description="Full response rendered as markdown for the chat UI",
    )
    created_at: datetime = Field(
        ...,
        description="UTC timestamp when the response was generated",
    )


class HistoryItem(BaseModel):
    """A single entry in the user's chat history."""

    id: str = Field(..., description="Unique history entry ID")
    title: str = Field(..., description="Short title derived from the user message")
    message: str = Field(..., description="Original user prompt")
    response_summary: str = Field(
        ...,
        description="First-line summary of the AI reply",
    )
    template: Optional[str] = Field(
        default=None,
        description="Prompt template key used, if any",
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Owner of this history entry",
    )
    created_at: datetime = Field(..., description="When the chat was created")


class HistoryListResponse(BaseModel):
    """Response body for GET /history."""

    items: List[HistoryItem] = Field(
        default_factory=list,
        description="List of chat history entries, newest first",
    )
    total: int = Field(..., description="Total number of matching entries")


class DeleteHistoryResponse(BaseModel):
    """Response body for DELETE /history/{id}."""

    success: bool = Field(..., description="Whether the entry was deleted")
    message: str = Field(..., description="Human-readable result message")
    deleted_id: str = Field(..., description="ID of the removed history entry")


class UserProfile(BaseModel):
    """Public user profile returned after login or signup."""

    id: str = Field(..., description="Unique user identifier")
    name: str = Field(..., description="Display name")
    email: str = Field(..., description="Email address")


class AuthResponse(BaseModel):
    """Response body for POST /login and POST /signup."""

    access_token: str = Field(..., description="JWT bearer token for authenticated requests")
    token_type: str = Field(default="bearer", description="OAuth2 token type")
    user: UserProfile = Field(..., description="Authenticated user profile")


class HealthResponse(BaseModel):
    """Response body for GET /health."""

    status: str = Field(..., description="Service health status, e.g. 'ok'")
    version: str = Field(..., description="Application version string")
    environment: str = Field(..., description="Current APP_ENV value")
    gemini_configured: bool = Field(
        ...,
        description="Whether a valid Gemini API key is present",
    )


class ErrorDetail(BaseModel):
    """Single validation or application error detail."""

    field: Optional[str] = Field(default=None, description="Request field that failed validation")
    message: str = Field(..., description="Human-readable error message")


class ErrorResponse(BaseModel):
    """Standard error envelope returned by exception handlers."""

    success: bool = Field(default=False, description="Always false for errors")
    error: str = Field(..., description="Short error code or category")
    message: str = Field(..., description="Human-readable error description")
    details: Optional[List[ErrorDetail]] = Field(
        default=None,
        description="Optional list of field-level validation errors",
    )
