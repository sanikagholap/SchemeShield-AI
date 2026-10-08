from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

# Strict standard email regex pattern: username@domain.tld
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"


class UserRegisterRequest(BaseModel):
    """Payload for citizen registration."""
    email: str = Field(
        ...,
        pattern=EMAIL_REGEX,
        description="Valid email address for registration",
        examples=["citizen@example.com"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password must contain at least 8 characters",
        examples=["SecurePass123!"],
    )
    full_name: Optional[str] = Field(
        None,
        max_length=255,
        description="Citizen's full name",
        examples=["Aarav Sharma"],
    )


class UserLoginRequest(BaseModel):
    """Payload for citizen login."""
    email: str = Field(
        ...,
        pattern=EMAIL_REGEX,
        description="Registered email address",
        examples=["citizen@example.com"],
    )
    password: str = Field(
        ...,
        min_length=1,
        description="Account password",
        examples=["SecurePass123!"],
    )


class UserResponse(BaseModel):
    """Safe citizen profile payload excluding sensitive password fields."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool = False
    created_at: datetime


class UserRegisterResponse(BaseModel):
    """Successful registration response envelope."""
    message: str = "User registered successfully."
    user: UserResponse


class TokenResponse(BaseModel):
    """JWT Bearer token and user session data."""
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserResponse


class CurrentUserResponse(BaseModel):
    """Response returned by GET /api/v1/auth/me."""
    user: UserResponse
