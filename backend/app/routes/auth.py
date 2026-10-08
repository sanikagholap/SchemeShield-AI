from fastapi import APIRouter, status
from app.schemas.auth import UserRegisterRequest, UserLoginRequest
from app.schemas.common import APIResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=APIResponse[dict],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new citizen account",
    description="Endpoint structure prepared for user registration. Full implementation in upcoming auth module.",
)
def register_user(payload: UserRegisterRequest) -> APIResponse[dict]:
    return APIResponse(
        success=True,
        message="Endpoint scaffold ready. User registration logic will be executed here.",
        data={"email": payload.email, "status": "scaffold_ready"},
    )


@router.post(
    "/login",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT token",
    description="Endpoint structure prepared for user login. Full implementation in upcoming auth module.",
)
def login_user(payload: UserLoginRequest) -> APIResponse[dict]:
    return APIResponse(
        success=True,
        message="Endpoint scaffold ready. Authentication logic will be executed here.",
        data={"email": payload.email, "status": "scaffold_ready"},
    )
