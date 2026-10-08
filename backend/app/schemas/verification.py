from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
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
    evidence: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


class VerificationHistoryItem(BaseModel):
    """Lightweight summary of a citizen's verification request for fast list rendering."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    input_type: str
    scheme_name: str
    description: Optional[str] = None
    submitted_url: Optional[str] = None
    status: str
    risk_score: Optional[float] = None
    confidence_score: Optional[float] = None
    result_label: Optional[str] = None
    explanation: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class VerificationHistoryResponse(BaseModel):
    """Paginated user verification history."""
    items: List[VerificationHistoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class VerificationStatsResponse(BaseModel):
    """Aggregated verification statistics for the authenticated citizen."""
    total_verifications: int = 0
    completed_verifications: int = 0
    pending_verifications: int = 0
    failed_verifications: int = 0
    genuine_count: int = 0
    suspicious_count: int = 0
    duplicate_count: int = 0
    potentially_fake_count: int = 0
    unable_to_verify_count: int = 0
    average_risk_score: Optional[float] = None


class URLVerificationRequest(BaseModel):
    """Payload to initiate verification of a scheme web URL."""
    url: str = Field(
        ...,
        min_length=4,
        max_length=1024,
        description="Public HTTP or HTTPS URL to verify",
        examples=["https://myscheme.gov.in/schemes/pmayg"],
    )
    scheme_name: Optional[str] = Field(
        None,
        max_length=255,
        description="Claimed or estimated scheme title (optional)",
        examples=["Pradhan Mantri Awas Yojana"],
    )


class OCRMetadata(BaseModel):
    """Structured metadata describing document parsing and OCR extraction details."""
    extraction_method: str = Field(..., description="Method applied: 'plain_text', 'pdf_text', or 'ocr'")
    text_length: int = Field(..., description="Extracted text character length")
    page_count: Optional[int] = Field(None, description="Page count for multi-page documents")
    file_type: str = Field(..., description="Extension or format of the analyzed document")
    warnings: List[str] = Field(default_factory=list, description="Non-fatal warnings or extraction notices")


class DocumentVerificationResponse(VerificationResponse):
    """Verification response specifically returned for uploaded documents."""
    ocr_metadata: Optional[OCRMetadata] = None


class URLVerificationResponse(VerificationResponse):
    """Verification response specifically returned for URL verification requests."""
    page_fetched: bool = Field(default=False, description="Whether the destination webpage content was retrieved")
    content_analyzed: bool = Field(default=False, description="Whether webpage textual content was fed to the verification engine")


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
