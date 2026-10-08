from fastapi import APIRouter, File, UploadFile, status
from app.schemas.verification import VerificationAnalyzeRequest
from app.schemas.common import APIResponse
from app.utils.file_handler import validate_file_extension

router = APIRouter(prefix="/verification", tags=["Verification"])


@router.post(
    "/analyze",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Analyze scheme text or URL for fraud and duplicate detection",
    description="Endpoint structure prepared for NLP analysis and risk scoring. Full AI pipeline will be connected here.",
)
def analyze_scheme(payload: VerificationAnalyzeRequest) -> APIResponse[dict]:
    return APIResponse(
        success=True,
        message="Endpoint scaffold ready. Scheme verification analysis will be performed here.",
        data={"content_length": len(payload.content), "title": payload.title, "status": "scaffold_ready"},
    )


@router.post(
    "/upload",
    response_model=APIResponse[dict],
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload document (PDF/Image) for OCR extraction and scheme verification",
    description="Endpoint structure prepared for file upload and upcoming OCR processing.",
)
def upload_scheme_document(file: UploadFile = File(...)) -> APIResponse[dict]:
    # Validate file extension against permitted formats (PDF, PNG, JPG, JPEG)
    ext = validate_file_extension(file.filename or "unknown")
    return APIResponse(
        success=True,
        message="Endpoint scaffold ready. Document received for future OCR processing.",
        data={
            "filename": file.filename,
            "detected_extension": ext,
            "status": "upload_scaffold_ready",
        },
    )


@router.get(
    "/{verification_id}",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Retrieve verification result and evidence by ID",
    description="Endpoint structure prepared to fetch historical verification reports and evidence.",
)
def get_verification_by_id(verification_id: int) -> APIResponse[dict]:
    return APIResponse(
        success=True,
        message="Endpoint scaffold ready. Verification retrieval logic will query database here.",
        data={"verification_id": verification_id, "status": "scaffold_ready"},
    )
