from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import UserResponse

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
