from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"


class UserRegisterRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX, description="Valid email address for registration")
    password: str = Field(..., min_length=8, description="Password (at least 8 characters)")
    full_name: Optional[str] = Field(None, max_length=255, description="Citizen's full name")


class UserLoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX, description="Registered email address")
    password: str = Field(..., description="User password")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
