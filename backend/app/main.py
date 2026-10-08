from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.database.connection import init_db
from app.routes.health import router as health_router
from app.routes.api_v1 import api_v1_router
from app.utils.exceptions import (
    AppException,
    app_exception_handler,
    generic_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.utils.file_handler import ensure_upload_directory
from app.utils.logger import logger

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifecycle manager for startup and shutdown procedures.
    """
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    
    # 1. Initialize SQLite database schemas
    init_db()
    
    # 2. Ensure upload directories exist
    upload_dir = ensure_upload_directory()
    logger.info(f"File upload directory verified: {upload_dir.resolve()}")
    
    logger.info("SchemeShield AI backend initialization complete.")
    yield
    logger.info("SchemeShield AI backend shutting down.")


def create_application() -> FastAPI:
    """
    Application factory building and configuring the FastAPI instance.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=(
            f"{settings.PROJECT_TAGLINE}\n\n"
            "Backend REST API for AI/ML verification of government schemes, "
            "duplicate detection, suspicious content analysis, and citizen protection."
        ),
        version=settings.VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Configure CORS for decoupled frontend development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register centralized exception handlers
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    # Register routes
    # Health endpoint accessible directly at /api/health
    app.include_router(health_router)

    # Versioned API routes under /api/v1
    app.include_router(api_v1_router)

    return app


app = create_application()
