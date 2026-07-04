"""
AccessAI FastAPI application entry point.

Initializes the API server with CORS, logging, global exception handlers,
and mounts all REST routes from app.api.routes.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator, List

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.config import get_settings
from app.models.response import ErrorDetail, ErrorResponse
from app.utils.logger import get_logger, setup_logging

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan — runs setup on startup and cleanup on shutdown.

    Configures logging and logs environment info when the server starts.
    """
    settings = get_settings()
    setup_logging(debug=settings.debug)
    logger.info(
        "AccessAI backend starting — env=%s debug=%s",
        settings.app_env,
        settings.debug,
    )
    yield
    logger.info("AccessAI backend shutting down")


def create_app() -> FastAPI:
    """
    Build and configure the FastAPI application instance.

    Returns:
        Fully configured FastAPI app ready for uvicorn.
    """
    settings = get_settings()

    app = FastAPI(
        title="AccessAI API",
        description=(
            "AI-powered career and education assistant API. "
            "Helps students discover scholarships, internships, roadmaps, "
            "and career opportunities."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # CORS — allow configured frontend origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount all API routes at root (e.g. /chat, /health, /login)
    app.include_router(router)

    # Register global exception handlers
    register_exception_handlers(app)

    return app


def register_exception_handlers(app: FastAPI) -> None:
    """Attach consistent JSON error handlers to the application."""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        """Return 422 with field-level validation details."""
        details: List[ErrorDetail] = []
        for error in exc.errors():
            field_path = ".".join(str(part) for part in error.get("loc", []) if part != "body")
            details.append(
                ErrorDetail(
                    field=field_path or None,
                    message=error.get("msg", "Validation error"),
                )
            )

        body = ErrorResponse(
            error="validation_error",
            message="Request validation failed.",
            details=details,
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=body.model_dump(),
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request,
        exc: HTTPException,
    ) -> JSONResponse:
        """Normalize HTTPException responses to the standard error envelope."""
        detail = exc.detail
        message = detail if isinstance(detail, str) else "An error occurred."
        body = ErrorResponse(
            error="http_error",
            message=message,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=body.model_dump(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        """Catch unexpected errors and return a safe 500 response."""
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        body = ErrorResponse(
            error="internal_server_error",
            message="An unexpected error occurred. Please try again later.",
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=body.model_dump(),
        )


# Application instance used by uvicorn: uvicorn app.main:app
app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_development,
    )
