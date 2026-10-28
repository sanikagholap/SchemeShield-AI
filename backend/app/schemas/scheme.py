import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class BeneficiaryCategoryResponse(BaseModel):
    """Metadata representation of a configurable Beneficiary Category."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str = Field(..., description="Category display name", examples=["Farmer"])
    slug: str = Field(..., description="Unique category slug", examples=["farmer"])
    description: Optional[str] = Field(None, description="Scope and beneficiary definition")
    keywords: List[str] = Field(default_factory=list, description="Targeting and matching keywords")
    icon: Optional[str] = Field(None, description="UI icon name", examples=["Tractor"])
    scheme_count: int = Field(0, description="Number of currently cataloged schemes in this category")
    is_active: bool = Field(True, description="Whether this category is active")


def _parse_list_field(v: Any) -> List[str]:
    """Helper to convert None, list, comma-string, or JSON string into List[str]."""
    if v is None:
        return []
    if isinstance(v, list):
        out = []
        for item in v:
            if hasattr(item, "slug"):
                out.append(item.slug)
            elif isinstance(item, dict) and "slug" in item:
                out.append(item["slug"])
            elif str(item).strip():
                out.append(str(item).strip())
        return out
    if isinstance(v, str):
        v_str = v.strip()
        if not v_str:
            return []
        if v_str.startswith("[") and v_str.endswith("]"):
            try:
                parsed = json.loads(v_str)
                if isinstance(parsed, list):
                    return [str(x).strip() for x in parsed if str(x).strip()]
            except Exception:
                pass
        return [item.strip() for item in v_str.split(",") if item.strip()]
    return []


class SchemeBase(BaseModel):
    """Common baseline properties for government scheme records."""
    name: str = Field(..., min_length=2, max_length=255, description="Official scheme name", examples=["PM Kisan Samman Nidhi"])
    slug: Optional[str] = Field(None, max_length=128, description="Stable unique scheme slug/ID", examples=["pm-kisan"])
    description: Optional[str] = Field(None, description="Detailed overview and scope of the scheme")
    department: Optional[str] = Field(None, max_length=255, description="Governing ministry or department", examples=["Ministry of Agriculture & Farmers Welfare"])
    category: Optional[str] = Field(None, max_length=128, description="Sector category", examples=["Agriculture"])
    beneficiary_categories: Optional[List[str]] = Field(default_factory=list, description="Associated beneficiary category slugs", examples=[["farmer"]])
    eligibility: Optional[str] = Field(None, description="Key criteria to qualify for benefits")
    benefits: Optional[str] = Field(None, description="Direct financial or service benefits provided")
    application_process: Optional[str] = Field(None, description="Steps and channels to apply")
    official_url: Optional[str] = Field(None, max_length=512, description="Legitimate official portal link", examples=["https://pmkisan.gov.in"])
    source_name: Optional[str] = Field(None, max_length=255, description="Name of catalog or source", examples=["myScheme Portal"])
    source_domain: Optional[str] = Field(None, max_length=255, description="Domain name hosting source info", examples=["pmkisan.gov.in"])
    source_type: Optional[str] = Field("official_portal", max_length=64, description="Source classification: official_portal, myscheme_portal, candidate_archive", examples=["official_portal"])
    state: Optional[str] = Field("Central", max_length=128, description="Applicable state or 'Central'", examples=["Central"])
    jurisdiction: Optional[str] = Field("Central", max_length=64, description="Central or State jurisdiction", examples=["Central"])
    launch_year: Optional[int] = Field(None, ge=1947, le=2100, description="Year the scheme was officially announced", examples=[2019])
    valid_from: Optional[str] = Field(None, max_length=64, description="Validity start date or announcement date", examples=["2019-02-01"])
    valid_to: Optional[str] = Field(None, max_length=64, description="Validity end date or sunset date, if applicable")
    last_checked_at: Optional[datetime] = Field(None, description="Timestamp when the official source was last checked")
    keywords: Optional[List[str]] = Field(default_factory=list, description="Search and matching keywords")
    alternative_names: Optional[List[str]] = Field(default_factory=list, description="Alternative names, vernacular aliases, or acronyms")
    is_active: bool = Field(True, description="Whether the scheme is currently active")
    is_official: bool = Field(True, description="Whether the scheme is verified against official government catalogs")
    provenance: Optional[str] = Field(None, description="Catalog or archival provenance of this record")
    needs_category_review: bool = Field(False, description="Flagged for manual category classification review")
    category_review_reason: Optional[str] = Field(None, description="Reason scheme mapping was flagged for review")

    @field_validator("beneficiary_categories", "keywords", "alternative_names", mode="before")
    @classmethod
    def clean_lists(cls, v: Any) -> List[str]:
        return _parse_list_field(v)


class SchemeCreate(SchemeBase):
    """Payload to create a new scheme record."""
    pass


class SchemeUpdate(BaseModel):
    """Payload to update an existing scheme record (all fields optional)."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    slug: Optional[str] = Field(None, max_length=128)
    description: Optional[str] = None
    department: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=128)
    beneficiary_categories: Optional[List[str]] = None
    eligibility: Optional[str] = None
    benefits: Optional[str] = None
    application_process: Optional[str] = None
    official_url: Optional[str] = Field(None, max_length=512)
    source_name: Optional[str] = Field(None, max_length=255)
    source_domain: Optional[str] = Field(None, max_length=255)
    source_type: Optional[str] = Field(None, max_length=64)
    state: Optional[str] = Field(None, max_length=128)
    jurisdiction: Optional[str] = Field(None, max_length=64)
    launch_year: Optional[int] = Field(None, ge=1947, le=2100)
    valid_from: Optional[str] = Field(None, max_length=64)
    valid_to: Optional[str] = Field(None, max_length=64)
    last_checked_at: Optional[datetime] = None
    keywords: Optional[List[str]] = None
    alternative_names: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_official: Optional[bool] = None
    provenance: Optional[str] = None
    needs_category_review: Optional[bool] = None
    category_review_reason: Optional[str] = None

    @field_validator("beneficiary_categories", "keywords", "alternative_names", mode="before")
    @classmethod
    def clean_update_lists(cls, v: Any) -> Optional[List[str]]:
        if v is None:
            return None
        return _parse_list_field(v)


class SchemeResponse(BaseModel):
    """Complete serialized representation of a scheme."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    category: Optional[str] = None
    beneficiary_categories: List[str] = Field(default_factory=list)
    eligibility: Optional[str] = None
    benefits: Optional[str] = None
    application_process: Optional[str] = None
    official_url: Optional[str] = None
    source_name: Optional[str] = None
    source_domain: Optional[str] = None
    source_type: Optional[str] = "official_portal"
    state: Optional[str] = None
    jurisdiction: Optional[str] = "Central"
    launch_year: Optional[int] = None
    valid_from: Optional[str] = None
    valid_to: Optional[str] = None
    last_checked_at: Optional[datetime] = None
    keywords: List[str] = Field(default_factory=list)
    alternative_names: List[str] = Field(default_factory=list)
    is_active: bool
    is_official: bool = True
    provenance: Optional[str] = None
    needs_category_review: bool = False
    category_review_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="before")
    @classmethod
    def populate_categories_from_links(cls, data: Any) -> Any:
        if hasattr(data, "beneficiary_category_links") and data.beneficiary_category_links:
            cat_attr = getattr(data, "beneficiary_categories", None)
            if not cat_attr or cat_attr in ("[]", ""):
                links = [c.slug for c in data.beneficiary_category_links if hasattr(c, "slug")]
                if hasattr(data, "__dict__"):
                    data.beneficiary_categories = json.dumps(links)
        return data

    @field_validator("beneficiary_categories", "keywords", "alternative_names", mode="before")
    @classmethod
    def clean_response_lists(cls, v: Any) -> List[str]:
        return _parse_list_field(v)


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


class EligibilityRecommendationResponse(BaseModel):
    """Individual scheme recommendation with explicit eligibility status."""
    scheme: SchemeResponse
    eligibility_status: str = Field(..., description="Status: 'eligible', 'potentially_eligible', 'ineligible', 'insufficient_information'")
    eligibility_score: float = Field(..., ge=0.0, le=1.0, description="Match score from 0.0 to 1.0")
    match_reasons: List[str] = Field(default_factory=list, description="List of positive criteria met by user profile")
    missing_criteria: List[str] = Field(default_factory=list, description="Unsatisfied or unverified criteria")
    limitations: List[str] = Field(default_factory=list, description="Official constraints and disclaimers")


class RecommendationListResponse(BaseModel):
    """Paginated recommendations with applied profile context."""
    items: List[EligibilityRecommendationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    applied_profile: Dict[str, Any]
