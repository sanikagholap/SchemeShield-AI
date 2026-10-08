from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.utils.logger import logger


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundException(AppException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            message=f"{resource} with identifier '{identifier}' not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Could not validate credentials."):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Access forbidden."):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class ConflictException(AppException):
    def __init__(self, message: str = "Resource conflict detected."):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handles custom application exceptions."""
    logger.warning(f"AppException on {request.method} {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.message,
                "status_code": exc.status_code,
                "details": exc.details,
            },
        },
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handles standard HTTP exceptions."""
    logger.info(f"HTTPException on {request.method} {request.url.path} (status {exc.status_code}): {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": str(exc.detail),
                "status_code": exc.status_code,
                "details": {},
            },
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handles Pydantic request validation errors."""
    logger.info(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    formatted_errors = []
    for err in exc.errors():
        formatted_errors.append(
            {
                "loc": err.get("loc", []),
                "msg": err.get("msg", ""),
                "type": err.get("type", ""),
            }
        )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "message": "Input validation failed. Please check submitted payload.",
                "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "details": {"validation_errors": formatted_errors},
            },
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handles unexpected exceptions.
    Prevents database internals and stack traces from leaking to client responses.
    """
    logger.exception(f"Unhandled server error on {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "message": "An unexpected server error occurred. Please try again later.",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "details": {},
            },
        },
    )
