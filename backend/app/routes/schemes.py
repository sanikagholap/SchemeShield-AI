from typing import List, Optional
from fastapi import APIRouter, Query, status
from app.schemas.common import APIResponse

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


@router.get(
    "",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="List official verified government schemes",
    description="Endpoint structure prepared for browsing, filtering, and searching government schemes.",
)
def list_schemes(
    category: Optional[str] = Query(None, description="Filter by scheme category"),
    ministry: Optional[str] = Query(None, description="Filter by government ministry"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> APIResponse[dict]:
    return APIResponse(
        success=True,
        message="Endpoint scaffold ready. Government schemes list will be queried from database here.",
        data={"schemes": [], "page": page, "page_size": page_size, "total": 0},
    )


@router.get(
    "/{scheme_id}",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Get official government scheme details by ID",
    description="Endpoint structure prepared for retrieving detailed verified scheme data.",
)
def get_scheme_by_id(scheme_id: int) -> APIResponse[dict]:
    return APIResponse(
        success=True,
        message="Endpoint scaffold ready. Detailed scheme record will be returned from database here.",
        data={"scheme_id": scheme_id, "status": "scaffold_ready"},
    )
