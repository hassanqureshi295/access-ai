"""
Parse structured markdown from OpenAI into AccessAI response fields.

The system prompt instructs the model to return four sections; this module
extracts them into typed data for the ChatResponse model.
"""

import re
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from app.models.response import ChatResponse, UsefulLink

# Section headers the model is instructed to produce
SECTION_HEADERS = {
    "summary": r"##\s*Summary",
    "recommendations": r"##\s*Recommendations",
    "useful_links": r"##\s*Useful\s*Links",
    "action_plan": r"##\s*Action\s*Plan",
}

# Markdown link pattern: [Title](https://example.com)
LINK_PATTERN = re.compile(
    r"\[([^\]]+)\]\((https?://[^)\s]+)\)"
)

# Bullet or numbered list item at line start
LIST_ITEM_PATTERN = re.compile(
    r"^\s*(?:[-*•]|\d+[.)])\s+(.+)$",
    re.MULTILINE,
)


def _split_sections(markdown: str) -> Dict[str, str]:
    """
    Split markdown into sections keyed by summary, recommendations, etc.

    Uses header positions to slice content between ## headings.
    """
    text = markdown.strip()
    if not text:
        return {}

    # Find all section header positions
    header_pattern = re.compile(
        r"^##\s*(Summary|Recommendations|Useful\s*Links|Action\s*Plan)\s*$",
        re.MULTILINE | re.IGNORECASE,
    )
    matches = list(header_pattern.finditer(text))
    if not matches:
        return {"summary": text}

    sections: Dict[str, str] = {}
    key_map = {
        "summary": "summary",
        "recommendations": "recommendations",
        "useful links": "useful_links",
        "action plan": "action_plan",
    }

    for index, match in enumerate(matches):
        raw_name = match.group(1).lower().strip()
        key = key_map.get(raw_name, raw_name.replace(" ", "_"))
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        sections[key] = text[start:end].strip()

    return sections


def _extract_list_items(section_text: str) -> List[str]:
    """Extract bullet or numbered list items from a section body."""
    if not section_text:
        return []

    items = LIST_ITEM_PATTERN.findall(section_text)
    cleaned = [item.strip() for item in items if item.strip()]

    # If no list markers found, treat non-empty lines as items
    if not cleaned:
        lines = [line.strip() for line in section_text.splitlines() if line.strip()]
        cleaned = [line.lstrip("-*• ").strip() for line in lines if not line.startswith("#")]

    return cleaned


def _parse_useful_links(section_text: str) -> List[UsefulLink]:
    """
    Parse Useful Links section into UsefulLink objects.

    Supports formats:
      - [Title](url) — description
      - [Title](url) - description
      - [Title](url)
    """
    links: List[UsefulLink] = []
    items = _extract_list_items(section_text)

    for item in items:
        match = LINK_PATTERN.search(item)
        if not match:
            continue

        title = match.group(1).strip()
        url = match.group(2).strip()

        # Description after the link: em dash, hyphen, or colon
        remainder = item[match.end():].strip()
        description: Optional[str] = None
        if remainder:
            remainder = re.sub(r"^[\s—–\-:]+\s*", "", remainder)
            description = remainder if remainder else None

        links.append(UsefulLink(title=title, url=url, description=description))

    return links


def _fallback_summary(markdown: str, sections: Dict[str, str]) -> str:
    """Use Summary section or first paragraph when parsing fails."""
    if sections.get("summary"):
        summary = sections["summary"].strip()
        # Use first paragraph if summary is very long
        first_para = summary.split("\n\n")[0].strip()
        return first_para or summary

    # First non-header paragraph from full markdown
    for line in markdown.splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            return stripped[:500]

    return "Here is guidance based on your question."


def parse_markdown_response(markdown: str) -> Tuple[str, List[str], List[UsefulLink], List[str]]:
    """
    Parse raw OpenAI markdown into structured chat fields.

    Args:
        markdown: Full model response text.

    Returns:
        Tuple of (summary, recommendations, useful_links, action_plan).
    """
    sections = _split_sections(markdown)
    summary = _fallback_summary(markdown, sections)
    recommendations = _extract_list_items(sections.get("recommendations", ""))
    useful_links = _parse_useful_links(sections.get("useful_links", ""))
    action_plan = _extract_list_items(sections.get("action_plan", ""))

    return summary, recommendations, useful_links, action_plan


def build_chat_response(
    markdown: str,
    chat_id: Optional[str] = None,
    created_at: Optional[datetime] = None,
) -> ChatResponse:
    """
    Build a complete ChatResponse from raw OpenAI markdown.

    Args:
        markdown: Full model response text.
        chat_id: Optional pre-assigned ID; generated if omitted.
        created_at: Optional timestamp; defaults to UTC now.

    Returns:
        Populated ChatResponse ready for API serialization.
    """
    summary, recommendations, useful_links, action_plan = parse_markdown_response(markdown)

    return ChatResponse(
        id=chat_id or str(uuid.uuid4()),
        summary=summary,
        recommendations=recommendations,
        useful_links=useful_links,
        action_plan=action_plan,
        markdown=markdown.strip(),
        created_at=created_at or datetime.now(timezone.utc),
    )


def derive_history_title(user_message: str, max_length: int = 60) -> str:
    """
    Create a short title for a history entry from the user's message.

    Args:
        user_message: Original chat input.
        max_length: Maximum characters before truncation with ellipsis.

    Returns:
        Single-line title string.
    """
    title = " ".join(user_message.strip().split())
    if len(title) <= max_length:
        return title
    return title[: max_length - 3].rstrip() + "..."
