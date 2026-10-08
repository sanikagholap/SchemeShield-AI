from app.services.auth_service import AuthService
from app.services.official_source_service import OfficialSourceVerificationService
from app.services.verification_service import VerificationService, verification_service
from app.services.nlp_service import NLPAnalysisService
from app.services.duplicate_detection_service import DuplicateDetectionService
from app.services.suspicious_detector_service import SuspiciousDetectorService
from app.services.ocr_service import OCRProcessingService, ocr_processing_service
from app.services.url_service import URLInspectionService, url_inspection_service
from app.services.risk_scoring_service import RiskScoringService

__all__ = [
    "AuthService",
    "OfficialSourceVerificationService",
    "VerificationService",
    "verification_service",
    "NLPAnalysisService",
    "DuplicateDetectionService",
    "SuspiciousDetectorService",
    "OCRProcessingService",
    "ocr_processing_service",
    "URLInspectionService",
    "url_inspection_service",
    "RiskScoringService",
]
