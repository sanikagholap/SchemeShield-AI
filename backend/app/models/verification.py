from typing import Any, Dict, List, Optional, TYPE_CHECKING
from sqlalchemy import Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class VerificationRequest(Base, TimestampMixin):
    """
    Model storing a citizen's scheme verification requests and subsequent analysis results.
    """
    __tablename__ = "verification_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    input_type: Mapped[str] = mapped_column(
        String(32), default="text", nullable=False
    )  # text, url, document
    scheme_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    submitted_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), default="pending", nullable=False, index=True
    )  # pending, processing, completed, failed
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    result_label: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True
    )  # genuine, suspicious, duplicate, potentially_fake, unable_to_verify
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evidence: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="verification_requests")

    def __repr__(self) -> str:
        return f"<VerificationRequest(id={self.id}, scheme='{self.scheme_name}', status='{self.status}')>"


class Verification(Base, TimestampMixin):
    """
    Verification record for user-submitted scheme text, links, or documents.
    """
    __tablename__ = "verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    submitted_content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)  # pending, completed, failed
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 0.0 (safe) to 1.0 (scam)
    ai_confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 0.0 to 1.0
    verdict: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # genuine, suspicious, fake, unknown

    user: Mapped[Optional["User"]] = relationship("User", back_populates="verifications")
    evidences: Mapped[List["VerificationEvidence"]] = relationship(
        "VerificationEvidence", back_populates="verification", cascade="all, delete-orphan"
    )
    histories: Mapped[List["VerificationHistory"]] = relationship(
        "VerificationHistory", back_populates="verification", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Verification(id={self.id}, verdict='{self.verdict}', risk_score={self.risk_score})>"


class VerificationEvidence(Base, TimestampMixin):
    """
    Evidence generated during verification (NLP matches, domain checks, OCR clues).
    """
    __tablename__ = "verification_evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    verification_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("verifications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    evidence_type: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g., url_mismatch, duplicate_claim, nlp_sentiment
    description: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    reliability_score: Mapped[Optional[float]] = mapped_column(Float, default=1.0, nullable=True)

    verification: Mapped["Verification"] = relationship("Verification", back_populates="evidences")

    def __repr__(self) -> str:
        return f"<VerificationEvidence(id={self.id}, type='{self.evidence_type}')>"


class VerificationHistory(Base, TimestampMixin):
    """
    Audit log / user activity history of verification events.
    """
    __tablename__ = "verification_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    verification_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("verifications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g., created, viewed, shared, flagged
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="histories")
    verification: Mapped["Verification"] = relationship("Verification", back_populates="histories")

    def __repr__(self) -> str:
        return f"<VerificationHistory(id={self.id}, action='{self.action}')>"
