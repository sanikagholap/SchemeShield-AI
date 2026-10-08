from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class VerificationAnalyzeRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=255, description="Optional title or headline of the scheme")
    content: str = Field(..., min_length=10, description="Text snippet, message, or URL of the scheme to verify")


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    evidence_type: str
    description: str
    source_url: Optional[str] = None
    reliability_score: Optional[float] = None
    created_at: datetime


class VerificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    title: Optional[str] = None
    submitted_content: str
    status: str
    risk_score: Optional[float] = None
    ai_confidence_score: Optional[float] = None
    verdict: Optional[str] = None
    evidences: List[EvidenceResponse] = []
    created_at: datetime


class VerificationUploadResponse(BaseModel):
    filename: str
    file_size_bytes: int
    content_type: str
    message: str
