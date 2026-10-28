from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

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
    name: Optional[str] = Field(
        None,
        max_length=255,
        description="Citizen's name (alias supported for frontend compatibility)",
        examples=["Aarav Sharma"],
    )

    @model_validator(mode="after")
    def sync_name_fields(self) -> "UserRegisterRequest":
        if not self.full_name and self.name:
            self.full_name = self.name
        elif not self.name and self.full_name:
            self.name = self.full_name
        return self


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
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    caste_category: Optional[str] = None
    is_disabled: Optional[bool] = False
    beneficiary_categories: List[str] = Field(default_factory=list)
    is_active: bool
    is_admin: bool = False
    created_at: datetime

    @field_validator("beneficiary_categories", mode="before")
    @classmethod
    def parse_category_objs(cls, v: Any) -> List[str]:
        if v is None:
            return []
        if isinstance(v, list):
            out = []
            for item in v:
                if hasattr(item, "slug"):
                    out.append(item.slug)
                elif isinstance(item, str):
                    out.append(item.strip())
                elif isinstance(item, dict) and "slug" in item:
                    out.append(item["slug"])
            return out
        return []

    @model_validator(mode="after")
    def ensure_name_fields(self) -> "UserResponse":
        """Ensures both name and full_name are populated string values to prevent frontend .split() crashes."""
        resolved = self.full_name or self.name or (self.email.split("@")[0] if self.email else "User")
        self.full_name = resolved
        self.name = resolved
        return self


class UserProfileUpdate(BaseModel):
    """Payload to update citizen demographic profile and beneficiary categories."""
    full_name: Optional[str] = Field(None, max_length=255)
    age: Optional[int] = Field(None, ge=0, le=130, description="Age in years", examples=[28])
    gender: Optional[str] = Field(None, max_length=32, description="Gender (Female, Male, Other)", examples=["Female"])
    state: Optional[str] = Field(None, max_length=128, description="State of residence", examples=["Maharashtra"])
    annual_income: Optional[float] = Field(None, ge=0, description="Annual household income in INR", examples=[250000.0])
    occupation: Optional[str] = Field(None, max_length=128, description="Current occupation", examples=["Farmer"])
    caste_category: Optional[str] = Field(None, max_length=64, description="Social category (General, OBC, SC, ST, EWS)", examples=["OBC"])
    is_disabled: Optional[bool] = Field(None, description="Whether citizen has a documented disability")
    beneficiary_categories: Optional[List[str]] = Field(None, description="List of chosen category slugs (e.g. ['farmer', 'women'])")


class UserProfileResponse(BaseModel):
    """Citizen preferences and profile representation."""
    user: UserResponse
    available_categories: List[str] = Field(default_factory=list)


class UserRegisterResponse(BaseModel):
    """Successful registration response envelope."""
    message: str = "User registered successfully."
    access_token: Optional[str] = None
    token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse


class TokenResponse(BaseModel):
    """JWT Bearer token and user session data."""
    access_token: str
    token: Optional[str] = None
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserResponse

    @model_validator(mode="after")
    def sync_token(self) -> "TokenResponse":
        if not self.token:
            self.token = self.access_token
        return self


class CurrentUserResponse(BaseModel):
    """Response returned by GET /api/v1/auth/me."""
    user: UserResponse
