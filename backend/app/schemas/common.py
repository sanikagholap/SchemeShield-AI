from datetime import datetime, timezone
from typing import Any, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standardized API success response envelope."""
    success: bool = True
    message: str = "Operation completed successfully."
    data: Optional[T] = None


class ErrorDetail(BaseModel):
    message: str
    status_code: int
    details: Dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Standardized API error response envelope."""
    success: bool = False
    error: ErrorDetail


class HealthResponse(BaseModel):
    """Payload for GET /api/health."""
    status: str = "healthy"
    app: str = "SchemeShield AI"
    tagline: str = "Verify Before You Trust."
    version: str = "1.0.0"
    environment: str = "development"
    database_status: str = "connected"
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number, 1-indexed")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")
