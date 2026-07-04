"""
Chat history storage for AccessAI.

Persists conversation metadata to a JSON file on disk so history survives
server restarts. Supports listing, searching, and deleting entries.
"""

import json
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.models.response import (
    ChatResponse,
    DeleteHistoryResponse,
    HistoryItem,
    HistoryListResponse,
)
from app.services.formatter import derive_history_title
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Default path for history JSON — relative to backend working directory
DEFAULT_HISTORY_PATH = Path("data") / "history.json"


class HistoryNotFoundError(Exception):
    """Raised when a history entry ID does not exist."""

    def __init__(self, entry_id: str):
        self.entry_id = entry_id
        super().__init__(f"History entry not found: {entry_id}")


class HistoryService:
    """
    File-backed chat history store.

    Each entry stores the user message, AI response metadata, and full
    markdown for replay when a user reopens a past conversation.
    """

    def __init__(self, storage_path: Optional[Path] = None):
        """
        Initialize the history service.

        Args:
            storage_path: Path to JSON file; defaults to data/history.json.
        """
        self.storage_path = storage_path or DEFAULT_HISTORY_PATH
        self._lock = threading.Lock()
        self._ensure_storage()

    def _ensure_storage(self) -> None:
        """Create data directory and empty history file if they do not exist."""
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.storage_path.exists():
            self._write_entries([])
            logger.info("Created empty history file at %s", self.storage_path)

    def _read_entries(self) -> List[Dict[str, Any]]:
        """Load all entries from disk."""
        try:
            raw = self.storage_path.read_text(encoding="utf-8")
            data = json.loads(raw) if raw.strip() else []
            return data if isinstance(data, list) else []
        except json.JSONDecodeError:
            logger.warning("Corrupt history file — resetting to empty list")
            return []

    def _write_entries(self, entries: List[Dict[str, Any]]) -> None:
        """Persist entries list to disk."""
        self.storage_path.write_text(
            json.dumps(entries, indent=2, default=str),
            encoding="utf-8",
        )

    def _to_history_item(self, entry: Dict[str, Any]) -> HistoryItem:
        """Convert a stored dict to a HistoryItem response model."""
        return HistoryItem(
            id=entry["id"],
            title=entry["title"],
            message=entry["message"],
            response_summary=entry["response_summary"],
            template=entry.get("template"),
            user_id=entry.get("user_id"),
            created_at=datetime.fromisoformat(entry["created_at"]),
        )

    def add_entry(
        self,
        user_message: str,
        chat_response: ChatResponse,
        template: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> HistoryItem:
        """
        Save a new chat exchange to history.

        Args:
            user_message: Original user prompt text.
            chat_response: Structured AI response from OpenAI.
            template: Optional prompt template key.
            user_id: Optional owner identifier.

        Returns:
            The created HistoryItem (without full markdown in the list view).
        """
        entry = {
            "id": chat_response.id,
            "title": derive_history_title(user_message),
            "message": user_message.strip(),
            "response_summary": chat_response.summary,
            "template": template,
            "user_id": user_id,
            "created_at": chat_response.created_at.isoformat(),
            "markdown": chat_response.markdown,
            "recommendations": chat_response.recommendations,
            "useful_links": [link.model_dump() for link in chat_response.useful_links],
            "action_plan": chat_response.action_plan,
        }

        with self._lock:
            entries = self._read_entries()
            entries.insert(0, entry)  # Newest first
            self._write_entries(entries)

        logger.info("History entry saved id=%s", entry["id"])
        return self._to_history_item(entry)

    def list_entries(
        self,
        query: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> HistoryListResponse:
        """
        Return history entries, optionally filtered by search query and user.

        Search matches against title, message, and response summary (case-insensitive).

        Args:
            query: Optional search string.
            user_id: Optional filter by user ID.

        Returns:
            HistoryListResponse with matching items, newest first.
        """
        with self._lock:
            entries = self._read_entries()

        if user_id:
            entries = [e for e in entries if e.get("user_id") == user_id]

        if query:
            needle = query.lower()
            entries = [
                e
                for e in entries
                if needle in e.get("title", "").lower()
                or needle in e.get("message", "").lower()
                or needle in e.get("response_summary", "").lower()
            ]

        items = [self._to_history_item(e) for e in entries]
        return HistoryListResponse(items=items, total=len(items))

    def get_entry(self, entry_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a full history entry including markdown and structured fields.

        Args:
            entry_id: Unique history entry ID.

        Returns:
            Full entry dict or None if not found.
        """
        with self._lock:
            entries = self._read_entries()

        for entry in entries:
            if entry.get("id") == entry_id:
                return entry
        return None

    def delete_entry(self, entry_id: str) -> DeleteHistoryResponse:
        """
        Remove a history entry by ID.

        Args:
            entry_id: ID of the entry to delete.

        Returns:
            DeleteHistoryResponse confirming removal.

        Raises:
            HistoryNotFoundError: If no entry matches the given ID.
        """
        with self._lock:
            entries = self._read_entries()
            new_entries = [e for e in entries if e.get("id") != entry_id]

            if len(new_entries) == len(entries):
                raise HistoryNotFoundError(entry_id)

            self._write_entries(new_entries)

        logger.info("History entry deleted id=%s", entry_id)
        return DeleteHistoryResponse(
            success=True,
            message="Chat history entry deleted successfully.",
            deleted_id=entry_id,
        )


# Module-level singleton for route handlers
_history_service: Optional[HistoryService] = None


def get_history_service() -> HistoryService:
    """Return a shared HistoryService instance for dependency injection."""
    global _history_service
    if _history_service is None:
        _history_service = HistoryService()
    return _history_service
