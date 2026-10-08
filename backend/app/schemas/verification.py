from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class VerificationRequestCreate(BaseModel):
    """Payload to initiate a new scheme verification request."""
    scheme_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Name or claimed title of the government scheme",
        examples=["Free Laptop Scheme 2026"],
    )
    description: Optional[str] = Field(
        None,
        description="Message content, description, or claims circulating about the scheme",
        examples=["WhatsApp message claiming free laptops for all students registering at bit.ly/freelaptop"],
    )
    submitted_url: Optional[str] = Field(
        None,
        max_length=512,
        description="Associated URL or link found in the scheme announcement",
        examples=["https://freelaptopscheme-online.xyz"],
    )
    extracted_text: Optional[str] = Field(
        None,
        description="Text extracted from document/image attachment or flyer",
    )
    input_type: Literal["text", "url", "document"] = Field(
        default="text",
        description="Input channel type: 'text', 'url', or 'document'",
    )


class VerificationResponse(BaseModel):
    """Complete representation of a verification request and its current status."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    input_type: str
    scheme_name: str
    description: Optional[str] = None
    submitted_url: Optional[str] = None
    extracted_text: Optional[str] = None
    status: str
    risk_score: Optional[float] = None
    confidence_score: Optional[float] = None
    result_label: Optional[str] = None
    explanation: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class VerificationHistoryResponse(BaseModel):
    """Paginated user verification history."""
    items: List[VerificationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Legacy schemas preserved for backwards compatibility with Prompt 1
class VerificationAnalyzeRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: str = Field(..., min_length=10)


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    evidence_type: str
    description: str
    source_url: Optional[str] = None
    reliability_score: Optional[float] = None
    created_at: datetime


class VerificationUploadResponse(BaseModel):
    filename: str
    file_size_bytes: int
    content_type: str
    message: str
