from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SchemeBase(BaseModel):
    """Common baseline properties for government scheme records."""
    name: str = Field(..., min_length=2, max_length=255, description="Official scheme name", examples=["PM Kisan Samman Nidhi"])
    description: Optional[str] = Field(None, description="Detailed overview and scope of the scheme")
    department: Optional[str] = Field(None, max_length=255, description="Governing ministry or department", examples=["Ministry of Agriculture & Farmers Welfare"])
    category: Optional[str] = Field(None, max_length=128, description="Sector or category", examples=["Agriculture"])
    eligibility: Optional[str] = Field(None, description="Key criteria to qualify for benefits")
    benefits: Optional[str] = Field(None, description="Direct financial or service benefits provided")
    application_process: Optional[str] = Field(None, description="Steps and channels to apply")
    official_url: Optional[str] = Field(None, max_length=512, description="Legitimate official portal link", examples=["https://pmkisan.gov.in"])
    source_name: Optional[str] = Field(None, max_length=255, description="Name of catalog or source", examples=["myScheme Portal"])
    source_domain: Optional[str] = Field(None, max_length=255, description="Domain name hosting source info", examples=["pmkisan.gov.in"])
    state: Optional[str] = Field("Central", max_length=128, description="Applicable state or 'Central'", examples=["Central"])
    launch_year: Optional[int] = Field(None, ge=1947, le=2100, description="Year the scheme was officially announced", examples=[2019])
    is_active: bool = Field(True, description="Whether the scheme is currently active")


class SchemeCreate(SchemeBase):
    """Payload to create a new scheme record."""
    pass


class SchemeUpdate(BaseModel):
    """Payload to update an existing scheme record (all fields optional)."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    department: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=128)
    eligibility: Optional[str] = None
    benefits: Optional[str] = None
    application_process: Optional[str] = None
    official_url: Optional[str] = Field(None, max_length=512)
    source_name: Optional[str] = Field(None, max_length=255)
    source_domain: Optional[str] = Field(None, max_length=255)
    state: Optional[str] = Field(None, max_length=128)
    launch_year: Optional[int] = Field(None, ge=1947, le=2100)
    is_active: Optional[bool] = None


class SchemeResponse(BaseModel):
    """Complete serialized representation of a scheme."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    department: Optional[str] = None
    category: Optional[str] = None
    eligibility: Optional[str] = None
    benefits: Optional[str] = None
    application_process: Optional[str] = None
    official_url: Optional[str] = None
    source_name: Optional[str] = None
    source_domain: Optional[str] = None
    state: Optional[str] = None
    launch_year: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class SchemeListResponse(BaseModel):
    """Paginated list of schemes with pagination metadata."""
    items: List[SchemeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SavedSchemeResponse(BaseModel):
    """Saved scheme bookmark payload."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    scheme_id: int
    notes: Optional[str] = None
    scheme: Optional[SchemeResponse] = None
    created_at: datetime
