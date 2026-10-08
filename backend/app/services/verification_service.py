import math
import re
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.scheme import Scheme
from app.models.verification import VerificationRequest
from app.schemas.verification import VerificationRequestCreate
from app.services.duplicate_detection_service import DuplicateDetectionService
from app.services.nlp_service import NLPAnalysisService
from app.services.official_source_service import OfficialSourceVerificationService
from app.services.risk_scoring_service import RiskScoringService
from app.services.suspicious_detector_service import SuspiciousDetectorService
from app.utils.exceptions import AppException, ForbiddenException, NotFoundException
from app.utils.logger import logger


class VerificationService:
    """
    Service layer handling citizen verification requests, status tracking,
    and modular verification pipelines for AI/ML and official-source checks.
    """

    def __init__(self):
        self.nlp_service = NLPAnalysisService()
        self.duplicate_service = DuplicateDetectionService()
        self.suspicious_service = SuspiciousDetectorService()
        self.official_source_service = OfficialSourceVerificationService()
        self.risk_service = RiskScoringService()

    @staticmethod
    def create_verification_request(
        db: Session, user_id: int, payload: VerificationRequestCreate
    ) -> VerificationRequest:
        """
        Creates a new verification request in the database with 'pending' status.
        """
        new_request = VerificationRequest(
            user_id=user_id,
            input_type=payload.input_type,
            scheme_name=payload.scheme_name.strip(),
            description=payload.description.strip() if payload.description else None,
            submitted_url=payload.submitted_url.strip() if payload.submitted_url else None,
            extracted_text=payload.extracted_text.strip() if payload.extracted_text else None,
            status="pending",
            risk_score=None,
            confidence_score=None,
            result_label=None,
            explanation="Verification request registered. Awaiting analysis by verification engine.",
            evidence=None,
        )

        db.add(new_request)
        db.commit()
        db.refresh(new_request)

        logger.info(f"Created verification request id={new_request.id} for user id={user_id}")
        return new_request

    @staticmethod
    def get_verification_request(
        db: Session, verification_id: int, user_id: int, is_admin: bool = False
    ) -> VerificationRequest:
        """
        Retrieves a single verification record. Enforces user data isolation.
        Raises NotFoundException if not found, or ForbiddenException if unauthorized.
        """
        stmt = select(VerificationRequest).where(VerificationRequest.id == verification_id)
        record = db.scalars(stmt).first()

        if record is None:
            raise NotFoundException(resource="Verification request", identifier=verification_id)

        if record.user_id != user_id and not is_admin:
            logger.warning(
                f"Unauthorized access attempt: user id={user_id} tried to read verification id={verification_id} (owner={record.user_id})"
            )
            raise ForbiddenException("You do not have permission to access this verification record.")

        return record

    @staticmethod
    def list_user_verifications(
        db: Session,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        result_label: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[VerificationRequest], int]:
        """
        Lists verification requests belonging to a user, paginated, newest first.
        Supports optional filtering by result_label and status.
        """
        offset = (page - 1) * page_size

        total_stmt = select(func.count(VerificationRequest.id)).where(
            VerificationRequest.user_id == user_id
        )
        items_stmt = (
            select(VerificationRequest)
            .where(VerificationRequest.user_id == user_id)
            .order_by(VerificationRequest.created_at.desc())
        )

        if result_label and result_label.strip():
            total_stmt = total_stmt.where(VerificationRequest.result_label == result_label.strip())
            items_stmt = items_stmt.where(VerificationRequest.result_label == result_label.strip())

        if status and status.strip():
            total_stmt = total_stmt.where(VerificationRequest.status == status.strip())
            items_stmt = items_stmt.where(VerificationRequest.status == status.strip())

        total = db.scalar(total_stmt) or 0
        items = list(db.scalars(items_stmt.offset(offset).limit(page_size)).all())

        return items, total

    @staticmethod
    def get_user_verification_stats(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Computes summary statistics for an authenticated citizen's verifications.
        Strictly isolated to user_id; returns safe zero values if no records exist.
        """
        stmt = select(VerificationRequest).where(VerificationRequest.user_id == user_id)
        records = list(db.scalars(stmt).all())

        total = len(records)
        completed = sum(1 for r in records if r.status == "completed")
        pending = sum(1 for r in records if r.status == "pending")
        failed = sum(1 for r in records if r.status == "failed")

        genuine = sum(1 for r in records if r.result_label == "genuine")
        suspicious = sum(1 for r in records if r.result_label == "suspicious")
        duplicate = sum(1 for r in records if r.result_label == "duplicate")
        potentially_fake = sum(1 for r in records if r.result_label == "potentially_fake")
        unable_to_verify = sum(1 for r in records if r.result_label == "unable_to_verify")

        completed_risks = [
            r.risk_score for r in records if r.risk_score is not None and r.status == "completed"
        ]
        avg_risk = round(sum(completed_risks) / len(completed_risks), 1) if completed_risks else None

        return {
            "total_verifications": total,
            "completed_verifications": completed,
            "pending_verifications": pending,
            "failed_verifications": failed,
            "genuine_count": genuine,
            "suspicious_count": suspicious,
            "duplicate_count": duplicate,
            "potentially_fake_count": potentially_fake,
            "unable_to_verify_count": unable_to_verify,
            "average_risk_score": avg_risk,
        }

    def process_verification(
        self,
        db: Session,
        request: VerificationRequest,
        extra_evidence_signal: Optional[Dict[str, Any]] = None,
    ) -> VerificationRequest:
        """
        Executes the end-to-end local scheme verification pipeline synchronously:
        1. Sets request status = 'processing'.
        2. Retrieves candidate schemes from the database.
        3. Computes TF-IDF duplicate similarity against catalog schemes.
        4. Scans submitted text for heuristic suspicious/fraud indicators.
        5. Validates official-source domain trust for submitted URLs.
        6. Synthesizes risk score, confidence score, and explainable result label.
        7. Persists structured evidence and sets status = 'completed'.
        In case of an unexpected exception, sets status = 'failed' and raises safe error.
        """
        try:
            request.status = "processing"
            db.commit()
            db.refresh(request)

            # 1. Fetch candidate schemes from database for similarity matching
            candidate_schemes = list(db.scalars(select(Scheme)).all())

            # 2. Duplicate / similarity detection
            duplicate_result = self.duplicate_service.compare_schemes(
                submitted_name=request.scheme_name,
                submitted_description=request.description or request.extracted_text,
                candidate_schemes=candidate_schemes,
            )

            # 3. Suspicious pattern scanning
            combined_text = f"{request.scheme_name} {request.description or ''} {request.extracted_text or ''}".strip()
            suspicious_result = self.suspicious_service.scan_for_red_flags(combined_text)

            # 4. Official source domain check
            official_source_result = self.verify_official_source(request.submitted_url)

            # 5. Synthesize risk score, confidence score, and result label
            assessment = self.risk_service.calculate_assessment(
                suspicious_result=suspicious_result,
                similarity_result=duplicate_result,
                official_source_result=official_source_result,
                scheme_name=request.scheme_name,
                description=request.description or request.extracted_text or "",
                submitted_url=request.submitted_url,
            )

            # Inject additional signals (e.g., document OCR metadata or URL network inspection)
            evidence = assessment["evidence"]
            if extra_evidence_signal and "signals" in evidence:
                evidence["signals"].insert(0, extra_evidence_signal)

            # 6. Update verification record
            request.risk_score = assessment["risk_score"]
            request.confidence_score = assessment["confidence_score"]
            request.result_label = assessment["result_label"]
            request.explanation = assessment["explanation"]
            request.evidence = evidence
            request.status = "completed"

            db.commit()
            db.refresh(request)
            logger.info(
                f"Successfully completed verification id={request.id}: label='{request.result_label}', "
                f"risk={request.risk_score}, confidence={request.confidence_score}"
            )
            return request

        except Exception as exc:
            logger.exception(f"Unexpected error processing verification id={request.id}: {exc}")
            db.rollback()
            try:
                request.status = "failed"
                request.explanation = "Verification processing failed due to an unexpected server error."
                db.commit()
                db.refresh(request)
            except Exception as inner_exc:
                logger.error(f"Failed to persist failure status for verification id={request.id}: {inner_exc}")
            raise AppException(
                message="Verification processing failed. Please check submitted input or try again.",
                status_code=500,
            )

    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalizes text by removing non-alphanumeric noise and extra whitespace."""
        return NLPAnalysisService.normalize_text(text)

    def compute_similarity(self, submitted_text: str, candidate_text: str) -> float:
        """Computes TF-IDF cosine similarity between two texts."""
        if not submitted_text or not candidate_text:
            return 0.0
        s1 = self.nlp_service.normalize_text(submitted_text)
        s2 = self.nlp_service.normalize_text(candidate_text)
        if not s1 or not s2:
            return 0.0
        from app.services.duplicate_detection_service import LocalTfidfVectorizer
        vec = LocalTfidfVectorizer(ngram_range=(1, 2))
        vectors = vec.fit_transform([s1, s2])
        return round(vec.cosine_similarity(vectors[0], vectors[1]), 4)

    def detect_duplicates(
        self, scheme_name: str, description: Optional[str] = None, candidate_schemes: Optional[List[Scheme]] = None
    ) -> Dict[str, Any]:
        """Scans catalog schemes for duplicate claims or known cloned schemes."""
        return self.duplicate_service.compare_schemes(
            submitted_name=scheme_name,
            submitted_description=description,
            candidate_schemes=candidate_schemes or [],
        )

    def scan_suspicious_patterns(self, text: str) -> Dict[str, Any]:
        """Scans for deceptive triggers (upfront registration fee, fake helplines)."""
        return self.suspicious_service.scan_for_red_flags(text)

    def verify_official_source(self, url: Optional[str]) -> Dict[str, Any]:
        """Cross-references candidate URL against trusted government sources."""
        if not url:
            return {
                "provided": False,
                "is_trusted": False,
                "notes": "No URL provided for official source validation.",
            }
        return self.official_source_service.evaluate_domain_trust(url)

    def calculate_risk_and_confidence(self, pipeline_signals: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesizes pipeline signals into normalized risk and confidence metrics."""
        return self.risk_service.calculate_assessment(
            suspicious_result=pipeline_signals.get("suspicious", {}),
            similarity_result=pipeline_signals.get("similarity", {}),
            official_source_result=pipeline_signals.get("official_source", {}),
            scheme_name=pipeline_signals.get("scheme_name", ""),
            description=pipeline_signals.get("description", ""),
            submitted_url=pipeline_signals.get("submitted_url"),
        )


verification_service = VerificationService()
