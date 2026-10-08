from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.config import get_settings
from app.database.connection import check_db_connection
from app.schemas.common import HealthResponse

settings = get_settings()
router = APIRouter(tags=["Health"])


@router.get(
    "/api/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Backend Health Check",
    description="Indicates whether the SchemeShield AI backend service and its SQLite database are operational.",
)
def get_health() -> HealthResponse:
    """
    Returns system status, active version, environment, and database connectivity.
    """
    is_db_connected = check_db_connection()
    return HealthResponse(
        status="healthy",
        app=settings.PROJECT_NAME,
        tagline=settings.PROJECT_TAGLINE,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        database_status="connected" if is_db_connected else "disconnected",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
