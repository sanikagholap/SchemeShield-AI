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
            "detail": exc.message,
            "message": exc.message,
            "error": {
                "message": exc.message,
                "status_code": exc.status_code,
                "details": exc.details,
            },
        },
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handles standard HTTP exceptions."""
    msg = str(exc.detail)
    logger.info(f"HTTPException on {request.method} {request.url.path} (status {exc.status_code}): {msg}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "detail": msg,
            "message": msg,
            "error": {
                "message": msg,
                "status_code": exc.status_code,
                "details": {},
            },
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handles Pydantic request validation errors."""
    logger.info(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    formatted_errors = []
    messages = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        msg = err.get("msg", "")
        formatted_errors.append(
            {
                "loc": err.get("loc", []),
                "msg": msg,
                "type": err.get("type", ""),
            }
        )
        messages.append(f"{field}: {msg}" if field else msg)

    combined_msg = "; ".join(messages) or "Input validation failed. Please check submitted payload."

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "detail": combined_msg,
            "message": combined_msg,
            "error": {
                "message": combined_msg,
                "status_code": 422,
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
    fallback_msg = "An unexpected server error occurred. Please try again later."
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": fallback_msg,
            "message": fallback_msg,
            "error": {
                "message": fallback_msg,
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "details": {},
            },
        },
    )
