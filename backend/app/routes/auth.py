from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    UserRegisterRequest,
    UserRegisterResponse,
    UserLoginRequest,
    TokenResponse,
    CurrentUserResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.utils.security import create_access_token

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new citizen account",
    description="Registers a citizen using email, password, and optional full name. Password is securely hashed using bcrypt.",
)
def register(
    payload: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> UserRegisterResponse:
    """
    Registers a new citizen account.
    Returns safe user information excluding any password fields.
    """
    user = AuthService.register_user(db=db, payload=payload)
    return UserRegisterResponse(
        message="User registered successfully.",
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate citizen and receive JWT access token",
    description="Verifies citizen credentials and issues a cryptographically signed JWT bearer token.",
)
def login(
    payload: UserLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Authenticates email and password.
    Returns JWT access token with user details on success.
    """
    user = AuthService.authenticate_user(db=db, payload=payload)
    
    # Generate JWT access token with subject (user ID) claim
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated citizen profile",
    description="Returns the currently authenticated citizen's profile. Requires a valid JWT Bearer token.",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> CurrentUserResponse:
    """
    Returns the authenticated user's profile details.
    Protected route requiring 'Authorization: Bearer <token>' header.
    """
    return CurrentUserResponse(
        user=UserResponse.model_validate(current_user)
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout citizen session",
    description="Client clears stored JWT token. Endpoint is ready for future token blacklisting.",
)
def logout(
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Logout-ready architectural endpoint.
    Notifies client of session termination.
    """
    return {
        "success": True,
        "message": "User session closed successfully.",
    }
