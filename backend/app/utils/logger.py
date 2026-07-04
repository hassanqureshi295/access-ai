"""
Structured logging utilities for the AccessAI backend.

Provides a consistent log format across all modules and respects the
DEBUG flag from application settings.
"""

import logging
import sys
from typing import Optional

# Default format: timestamp | level | module | message
LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Track whether root logging has been configured (configure once per process)
_configured = False


def setup_logging(debug: bool = False, log_level: Optional[str] = None) -> None:
    """
    Configure application-wide logging.

    Args:
        debug: When True, sets log level to DEBUG; otherwise INFO.
        log_level: Optional override (e.g. "WARNING"). Takes precedence over debug.
    """
    global _configured

    if _configured:
        return

    level_name = log_level or ("DEBUG" if debug else "INFO")
    level = getattr(logging, level_name.upper(), logging.INFO)

    # Root logger — all child loggers inherit this configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers if setup_logging is called more than once
    if not root_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        formatter = logging.Formatter(LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
        handler.setFormatter(formatter)
        root_logger.addHandler(handler)

    # Quiet noisy third-party loggers in production
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)

    _configured = True


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger for a module.

    Usage:
        from app.utils.logger import get_logger
        logger = get_logger(__name__)
        logger.info("Server started")

    Args:
        name: Typically __name__ of the calling module.

    Returns:
        A standard library logging.Logger instance.
    """
    return logging.getLogger(name)
