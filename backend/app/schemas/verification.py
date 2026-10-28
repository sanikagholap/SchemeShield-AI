from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union
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
    category: Optional[str] = Field(
        None,
        max_length=128,
        description="Claimed or estimated beneficiary category: Student, Farmer, Women, Senior Citizen, Entrepreneur, General Welfare",
        examples=["Student"],
    )


class CheckExplanation(BaseModel):
    """Structured evidence and explanation for an individual verification check."""
    check_id: str = Field(..., description="Unique check identifier")
    name: str = Field(..., description="Human-readable check title")
    result: Literal["pass", "warning", "fail", "inconclusive"] = Field(..., description="Evaluation outcome: pass, warning, fail, inconclusive")
    finding: str = Field(..., description="Fact-grounded finding summary")
    evidence_url: Optional[str] = Field(None, description="Corroborating URL or official source reference")
    score_contribution: float = Field(0.0, description="Points added or deducted from risk score")
    score_reason: Optional[str] = Field(None, description="Reason for score contribution")
    confidence: Optional[float] = Field(None, description="Calculated confidence level")
    coverage: Literal["complete", "partial", "missing"] = Field("complete", description="Evidence completeness")
    recommended_action: str = Field(..., description="Recommended citizen next action")
    explanation: Dict[str, str] = Field(default_factory=dict, description="Trilingual explanation mapping {'en': ..., 'hi': ..., 'mr': ...}")


class ScoreContributionItem(BaseModel):
    """Transparent itemized contribution to final risk score."""
    component: str = Field(..., description="Scoring rule component")
    points: float = Field(..., description="Points contribution (+/-)")
    direction: Literal["increase", "decrease", "neutral"] = Field(..., description="Impact on risk")
    description: str = Field(..., description="Human-readable English description")
    description_hi: Optional[str] = Field(None, description="Hindi explanation")
    description_mr: Optional[str] = Field(None, description="Marathi explanation")


class ScoreBreakdown(BaseModel):
    """Complete, reproducible breakdown of how the final risk score was calculated."""
    base_score: float = Field(20.0, description="Baseline unverified risk score")
    contributions: List[ScoreContributionItem] = Field(default_factory=list, description="List of transparent point adjustments")
    raw_score: Optional[float] = Field(None, description="Raw unconstrained score calculation")
    final_risk_score: float = Field(..., ge=0.0, le=100.0, description="Final calculated risk score")
    confidence_score: float = Field(..., ge=0.0, le=100.0, description="Observable evidence confidence")
    evidence_coverage: str = Field("partial", description="Coverage rating: complete, partial, or missing")
    scoring_policy_version: str = Field("2.0", description="Scoring rules policy version")
    inconclusive_checks_impact: Optional[str] = Field(
        default="Inconclusive checks contribute 0.0 points to risk score and do not penalize the citizen.",
        description="Audit clarification on neutral impact of missing evidence",
    )


class LocalizedVerificationResult(BaseModel):
    """Complete localized citizen-facing explanation in a single language."""
    language: str = Field(..., description="Language code: en, hi, or mr")
    result_label_localized: str = Field(..., description="Translated result label")
    summary: str = Field(..., description="Overall verification outcome summary")
    score_justification: str = Field(..., description="Detailed narrative explaining why this risk score was assigned")
    status_meaning: str = Field(..., description="Explanation of what this verification status implies")
    checks: List[CheckExplanation] = Field(default_factory=list, description="List of all verification checks with localized text")
    missing_evidence_impact: str = Field(..., description="Explanation of missing evidence and uncertainty")
    recommendations: List[str] = Field(default_factory=list, description="Citizen-friendly recommended steps")
    limitations: List[str] = Field(default_factory=list, description="Official constraints and disclaimers")
    localization_completeness: Optional[str] = Field("complete", description="Completeness status of translations: 'complete' or 'incomplete'")


class VerificationExplainResponse(BaseModel):
    """Dedicated explainable verification response with localized details."""
    verification_id: int
    scheme_name: str
    status: str
    risk_score: float
    confidence_score: float
    result_label: str
    scoring_policy_version: str = "2.0"
    evidence_coverage: str = "partial"
    matched_scheme_id: Optional[int] = None
    category: Optional[str] = None
    localization_completeness: str = "complete"
    selected_language: str = "en"
    explanation: Union[LocalizedVerificationResult, Dict[str, Any]]
    score_breakdown: Union[ScoreBreakdown, Dict[str, Any]]
    created_at: datetime


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
    scoring_policy_version: Optional[str] = "2.0"
    evidence_coverage: Optional[str] = "partial"
    matched_scheme_id: Optional[int] = None
    category: Optional[str] = None
    localization_completeness: Optional[str] = "complete"
    selected_language: str = "en"
    localized_result: Optional[Union[LocalizedVerificationResult, Dict[str, Any]]] = None
    score_breakdown: Optional[Union[ScoreBreakdown, Dict[str, Any]]] = None
    trilingual_explanations: Optional[Dict[str, Union[LocalizedVerificationResult, Dict[str, Any]]]] = None
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
    matched_scheme_id: Optional[int] = None
    category: Optional[str] = None
    scoring_policy_version: Optional[str] = "2.0"
    evidence_coverage: Optional[str] = "partial"
    localization_completeness: Optional[str] = "complete"
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
