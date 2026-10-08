import math
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.verification import (
    VerificationHistoryResponse,
    VerificationRequestCreate,
    VerificationResponse,
)
from app.services.verification_service import VerificationService, verification_service

router = APIRouter(prefix="/verify", tags=["Scheme Verification"])


@router.post(
    "",
    response_model=VerificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a government scheme for verification",
    description="Submits a scheme for immediate verification using the local AI/NLP analysis pipeline, returning an explainable risk assessment and evidence.",
)
def submit_verification_request(
    payload: VerificationRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationResponse:
    """
    Creates a new verification request record and runs the local AI/NLP verification pipeline
    synchronously, computing risk score, confidence score, result label, and structured evidence.
    """
    record = VerificationService.create_verification_request(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )
    processed_record = verification_service.process_verification(db=db, request=record)
    return VerificationResponse.model_validate(processed_record)


@router.get(
    "/history",
    response_model=VerificationHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated citizen's verification audit history",
    description="Returns a paginated list of all scheme verification requests submitted by the current user, sorted newest first.",
)
def get_verification_history(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationHistoryResponse:
    """
    Retrieves verification history strictly isolated to the authenticated user.
    """
    items, total = VerificationService.list_user_verifications(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return VerificationHistoryResponse(
        items=[VerificationResponse.model_validate(v) for v in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{verification_id}",
    response_model=VerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single verification request by ID",
    description="Retrieves a specific verification request. Enforces strict user ownership: citizens can only access their own records.",
)
def get_verification_by_id(
    verification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationResponse:
    """
    Retrieves a single verification record.
    Returns 404 if not found, or 403 Forbidden if attempted by another citizen.
    """
    record = VerificationService.get_verification_request(
        db=db,
        verification_id=verification_id,
        user_id=current_user.id,
        is_admin=current_user.is_admin,
    )
    return VerificationResponse.model_validate(record)
