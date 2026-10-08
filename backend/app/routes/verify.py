import math
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.verification import (
    DocumentVerificationResponse,
    OCRMetadata,
    URLVerificationRequest,
    URLVerificationResponse,
    VerificationHistoryResponse,
    VerificationRequestCreate,
    VerificationResponse,
)
from app.services.ocr_service import ocr_processing_service
from app.services.url_service import url_inspection_service
from app.services.verification_service import VerificationService, verification_service
from app.utils.exceptions import AppException
from app.utils.file_handler import (
    ensure_upload_directory,
    generate_safe_filename,
    remove_temporary_file,
    validate_file_extension,
    validate_file_size,
)
from app.utils.logger import logger

router = APIRouter(prefix="/verify", tags=["Scheme Verification"])


@router.post(
    "",
    response_model=VerificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a government scheme for verification",
    description="Submits a scheme for immediate verification using the local AI/NLP analysis pipeline, returning an explainable risk assessment and evidence.",
)
def submit_verification_request(
    payload: VerificationRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationResponse:
    """
    Creates a new verification request record and runs the local AI/NLP verification pipeline
    synchronously, computing risk score, confidence score, result label, and structured evidence.
    """
    record = VerificationService.create_verification_request(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )
    processed_record = verification_service.process_verification(db=db, request=record)
    return VerificationResponse.model_validate(processed_record)


@router.post(
    "/document",
    response_model=DocumentVerificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Verify an uploaded scheme document or flyer image",
    description="Accepts document (PDF/TXT) or image (PNG/JPG/WEBP) file uploads, extracts text via local OCR/PDF parsing, and analyzes it against the scheme verification engine.",
)
async def verify_document(
    file: UploadFile = File(..., description="Uploaded scheme document, screenshot, or flyer"),
    scheme_name: Optional[str] = Form(None, description="Optional claimed scheme title"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentVerificationResponse:
    """
    Handles secure multipart/form-data document upload:
    1. Validates extension and file size.
    2. Writes to temporary secure file.
    3. Extracts text using local OCR (images) or PDF text parser.
    4. Cleans up temporary file.
    5. Rejects documents with no usable text.
    6. Executes the local scheme verification pipeline.
    7. Returns complete explainable verification result with OCR metadata.
    """
    ext = validate_file_extension(file.filename)
    upload_dir = ensure_upload_directory()
    safe_filename = generate_safe_filename(file.filename)
    temp_path = upload_dir / safe_filename

    content = await file.read()
    validate_file_size(len(content))

    temp_path.write_bytes(content)

    try:
        extraction = ocr_processing_service.extract_text_from_file(temp_path)
    finally:
        remove_temporary_file(temp_path)

    extracted_text = extraction.get("extracted_text", "").strip()
    if not extracted_text:
        raise AppException(
            message="No readable or usable text could be extracted from the uploaded document.",
            status_code=400,
        )

    # Derive scheme name if omitted
    if scheme_name and scheme_name.strip():
        resolved_name = scheme_name.strip()
    else:
        first_line = extracted_text.splitlines()[0].strip()
        resolved_name = first_line[:80] if len(first_line) >= 3 else f"Document: {Path(file.filename).stem[:40]}"

    req_payload = VerificationRequestCreate(
        scheme_name=resolved_name,
        description=f"Extracted content from uploaded {ext.upper()} document ({file.filename}).",
        extracted_text=extracted_text,
        input_type="document",
    )

    record = VerificationService.create_verification_request(
        db=db,
        user_id=current_user.id,
        payload=req_payload,
    )

    doc_signal = {
        "type": "document",
        "extraction_method": extraction["extraction_method"],
        "text_length": len(extracted_text),
        "page_count": extraction.get("page_count"),
        "warnings": extraction.get("warnings", []),
    }

    processed_record = verification_service.process_verification(
        db=db,
        request=record,
        extra_evidence_signal=doc_signal,
    )

    response = DocumentVerificationResponse.model_validate(processed_record)
    response.ocr_metadata = OCRMetadata(
        extraction_method=extraction["extraction_method"],
        text_length=len(extracted_text),
        page_count=extraction.get("page_count"),
        file_type=ext,
        warnings=extraction.get("warnings", []),
    )
    return response


@router.post(
    "/url",
    response_model=URLVerificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Verify a government scheme announcement URL",
    description="Inspects submitted URL, validates domain authority, checks SSRF protections, extracts webpage text if safe, and executes the verification engine.",
)
def verify_url(
    payload: URLVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> URLVerificationResponse:
    """
    Executes URL verification:
    1. Validates HTTP/HTTPS syntax and rejects dangerous schemes.
    2. Runs SSRF guard against private, link-local, and loopback IPs.
    3. Fetches page content safely with size and timeout caps.
    4. Evaluates official government domain trust.
    5. Runs verification engine using extracted text and URL signals.
    6. Returns structured result and URL inspection evidence.
    """
    is_valid, hostname, syntax_err = url_inspection_service.validate_url_syntax(payload.url)
    if not is_valid:
        raise AppException(syntax_err, status_code=400)

    # Fetch page content with SSRF guard
    fetch_result = url_inspection_service.fetch_and_extract_page(payload.url)
    extracted_text = fetch_result.get("extracted_text") or None

    # Derive scheme title
    if payload.scheme_name and payload.scheme_name.strip():
        resolved_name = payload.scheme_name.strip()
    elif fetch_result.get("page_title"):
        resolved_name = fetch_result["page_title"][:120]
    else:
        resolved_name = f"Web Announcement: {hostname}"

    req_payload = VerificationRequestCreate(
        scheme_name=resolved_name,
        description=f"Online scheme announcement retrieved from {payload.url}",
        submitted_url=payload.url,
        extracted_text=extracted_text,
        input_type="url",
    )

    record = VerificationService.create_verification_request(
        db=db,
        user_id=current_user.id,
        payload=req_payload,
    )

    official_check = verification_service.verify_official_source(payload.url)
    url_signal = {
        "type": "official_source",
        "hostname": hostname,
        "trusted_domain": official_check.get("is_trusted", False),
        "page_fetched": fetch_result.get("page_fetched", False),
        "content_analyzed": fetch_result.get("content_extracted", False),
    }
    if fetch_result.get("warning"):
        url_signal["warning"] = fetch_result["warning"]

    processed_record = verification_service.process_verification(
        db=db,
        request=record,
        extra_evidence_signal=url_signal,
    )

    response = URLVerificationResponse.model_validate(processed_record)
    response.page_fetched = fetch_result.get("page_fetched", False)
    response.content_analyzed = fetch_result.get("content_extracted", False)
    return response


@router.get(
    "/history",
    response_model=VerificationHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated citizen's verification audit history",
    description="Returns a paginated list of all scheme verification requests submitted by the current user, sorted newest first.",
)
def get_verification_history(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationHistoryResponse:
    """
    Retrieves verification history strictly isolated to the authenticated user.
    """
    items, total = VerificationService.list_user_verifications(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return VerificationHistoryResponse(
        items=[VerificationResponse.model_validate(v) for v in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{verification_id}",
    response_model=VerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single verification request by ID",
    description="Retrieves a specific verification request. Enforces strict user ownership: citizens can only access their own records.",
)
def get_verification_by_id(
    verification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationResponse:
    """
    Retrieves a single verification record.
    Returns 404 if not found, or 403 Forbidden if attempted by another citizen.
    """
    record = VerificationService.get_verification_request(
        db=db,
        verification_id=verification_id,
        user_id=current_user.id,
        is_admin=current_user.is_admin,
    )
    return VerificationResponse.model_validate(record)
