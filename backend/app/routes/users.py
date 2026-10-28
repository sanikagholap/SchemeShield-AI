from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.scheme import BeneficiaryCategory
from app.models.user import User
from app.schemas.auth import UserProfileUpdate, UserResponse
from app.services.beneficiary_service import beneficiary_service
from app.utils.logger import logger

router = APIRouter(prefix="/users", tags=["User Profile"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated citizen profile",
    description="Returns safe profile information for the authenticated citizen without sensitive credentials.",
)
def get_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Returns the authenticated user's safe profile details.
    Excludes password hashes, JWTs, and sensitive database internals.
    """
    return UserResponse.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update authenticated citizen profile and preferences",
    description="Updates demographic details, income, state, and selected beneficiary categories.",
)
@router.put(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def update_user_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Updates citizen demographic profile and associated beneficiary categories.
    """
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip() if payload.full_name else None

    if payload.age is not None:
        current_user.age = payload.age

    if payload.gender is not None:
        current_user.gender = payload.gender.strip() if payload.gender else None

    if payload.state is not None:
        current_user.state = payload.state.strip() if payload.state else None

    if payload.annual_income is not None:
        current_user.annual_income = payload.annual_income

    if payload.occupation is not None:
        current_user.occupation = payload.occupation.strip() if payload.occupation else None

    if payload.caste_category is not None:
        current_user.caste_category = payload.caste_category.strip() if payload.caste_category else None

    if payload.is_disabled is not None:
        current_user.is_disabled = payload.is_disabled

    if payload.beneficiary_categories is not None:
        beneficiary_service.seed_default_categories(db)
        slugs = [s.strip().lower() for s in payload.beneficiary_categories if s.strip()]
        if slugs:
            matched = list(db.scalars(
                select(BeneficiaryCategory).where(BeneficiaryCategory.slug.in_(slugs))
            ).all())
            current_user.beneficiary_categories = matched
        else:
            current_user.beneficiary_categories = []

    db.commit()
    db.refresh(current_user)
    logger.info(f"Updated profile for user id={current_user.id}")
    return UserResponse.model_validate(current_user)
