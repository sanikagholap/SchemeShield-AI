from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.common import APIResponse
from app.services.verification_service import VerificationService

router = APIRouter(prefix="/history", tags=["Verification History"])


@router.get(
    "",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="List past verification history for authenticated citizen",
    description="Retrieves the authenticated citizen's past verification audits from the database.",
)
def get_user_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    result_label: Optional[str] = Query(None, description="Filter by result label"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by beneficiary category"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> APIResponse[dict]:
    items, total = VerificationService.list_user_verifications(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        result_label=result_label,
        status=status_filter,
        category=category,
    )
    serialized_items = [
        {
            "id": v.id,
            "user_id": v.user_id,
            "input_type": v.input_type,
            "scheme_name": v.scheme_name,
            "description": v.description,
            "submitted_url": v.submitted_url,
            "status": v.status,
            "risk_score": v.risk_score,
            "confidence_score": v.confidence_score,
            "result_label": v.result_label,
            "explanation": v.explanation,
            "scoring_policy_version": getattr(v, "scoring_policy_version", "2.0"),
            "evidence_coverage": getattr(v, "evidence_coverage", "partial"),
            "matched_scheme_id": getattr(v, "matched_scheme_id", None),
            "category": getattr(v, "category", None),
            "localization_completeness": getattr(v, "localization_completeness", "complete"),
            "created_at": v.created_at.isoformat() if v.created_at else None,
            "updated_at": v.updated_at.isoformat() if v.updated_at else None,
        }
        for v in items
    ]
    return APIResponse(
        success=True,
        message="User verification history retrieved successfully.",
        data={"items": serialized_items, "page": page, "page_size": page_size, "total": total},
    )
