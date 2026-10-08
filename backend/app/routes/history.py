from fastapi import APIRouter, Query, status
from app.schemas.common import APIResponse

router = APIRouter(prefix="/history", tags=["Verification History"])


@router.get(
    "",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="List past verification history for user",
    description="Endpoint structure prepared for retrieving citizen's past verification audits.",
)
def get_user_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> APIResponse[dict]:
    return APIResponse(
        success=True,
        message="Endpoint scaffold ready. User verification history will be returned from database here.",
        data={"items": [], "page": page, "page_size": page_size, "total": 0},
    )
