import math
from pathlib import Path
from typing import Any, Optional
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.verification import VerificationRequest
from app.schemas.verification import (
    DocumentVerificationResponse,
    OCRMetadata,
    URLVerificationRequest,
    URLVerificationResponse,
    VerificationExplainResponse,
    VerificationHistoryItem,
    VerificationHistoryResponse,
    VerificationRequestCreate,
    VerificationResponse,
    VerificationStatsResponse,
)
from app.services.multilingual_service import MultilingualExplanationService
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


def format_verification_response(
    record: VerificationRequest,
    lang: str = "en",
    response_cls: Any = VerificationResponse,
) -> Any:
    """
    Constructs a localized response model with consistent invariant scores
    and citizen-facing explanations in English, Hindi, or Marathi.
    """
    bundle_data = MultilingualExplanationService.get_or_create_explanation_bundle(record)
    trilingual_bundle = bundle_data["trilingual_explanations"]
    score_breakdown = bundle_data["score_breakdown"]
    localized_res = trilingual_bundle.get(lang, trilingual_bundle.get("en"))

    resp = response_cls.model_validate(record)
    resp.selected_language = lang
    resp.scoring_policy_version = getattr(record, "scoring_policy_version", None) or bundle_data["scoring_policy_version"]
    resp.evidence_coverage = getattr(record, "evidence_coverage", None) or bundle_data["evidence_coverage"]
    resp.matched_scheme_id = getattr(record, "matched_scheme_id", None)
    resp.category = getattr(record, "category", None)
    resp.localization_completeness = getattr(record, "localization_completeness", None) or bundle_data.get("localization_completeness", "complete")
    resp.trilingual_explanations = trilingual_bundle
    resp.score_breakdown = score_breakdown
    resp.localized_result = localized_res
    if localized_res and localized_res.get("summary"):
        resp.explanation = localized_res["summary"]
    return resp


@router.post(
    "",
    response_model=VerificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a government scheme for verification",
    description="Submits a scheme for immediate verification using the local AI/NLP analysis pipeline, returning an explainable risk assessment and evidence in the requested language (en, hi, mr).",
)
def submit_verification_request(
    payload: VerificationRequestCreate,
    lang: Optional[str] = Query(None, description="Language code for user-facing explanations: 'en', 'hi', or 'mr'"),
    language: Optional[str] = Query(None, description="Alternative alias for language parameter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationResponse:
    """
    Creates a new verification request record and runs the local AI/NLP verification pipeline
    synchronously, computing risk score, confidence score, result label, and structured evidence.
    """
    selected_lang = MultilingualExplanationService.resolve_language(lang, language)
    record = VerificationService.create_verification_request(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )
    processed_record = verification_service.process_verification(db=db, request=record)
    return format_verification_response(processed_record, lang=selected_lang, response_cls=VerificationResponse)


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
    lang: Optional[str] = Query(None, description="Language code for user-facing explanations: 'en', 'hi', or 'mr'"),
    language: Optional[str] = Query(None, description="Alternative alias for language parameter"),
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
    selected_lang = MultilingualExplanationService.resolve_language(lang, language)
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

    response = format_verification_response(
        processed_record,
        lang=selected_lang,
        response_cls=DocumentVerificationResponse,
    )
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
    lang: Optional[str] = Query(None, description="Language code for user-facing explanations: 'en', 'hi', or 'mr'"),
    language: Optional[str] = Query(None, description="Alternative alias for language parameter"),
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
    selected_lang = MultilingualExplanationService.resolve_language(lang, language)
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

    response = format_verification_response(
        processed_record,
        lang=selected_lang,
        response_cls=URLVerificationResponse,
    )
    response.page_fetched = fetch_result.get("page_fetched", False)
    response.content_analyzed = fetch_result.get("content_extracted", False)
    return response


@router.get(
    "/history",
    response_model=VerificationHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated citizen's verification audit history",
    description="Returns a paginated list of all scheme verification requests submitted by the current user, sorted newest first with optional result_label, status, and category filters.",
)
def get_verification_history(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    result_label: Optional[str] = Query(None, description="Filter by result label ('genuine', 'suspicious', 'duplicate', etc.)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by verification processing status ('completed', 'pending', 'failed')"),
    category: Optional[str] = Query(None, description="Filter by scheme beneficiary category ('Student', 'Farmer', 'Women', etc.)"),
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
        result_label=result_label,
        status=status_filter,
        category=category,
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return VerificationHistoryResponse(
        items=[VerificationHistoryItem.model_validate(v) for v in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/stats",
    response_model=VerificationStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated citizen's verification summary statistics",
    description="Aggregates completed, pending, failed counts and result label breakdown strictly for the authenticated user.",
)
def get_verification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationStatsResponse:
    """
    Retrieves user-isolated verification metrics. Returns zero-values if user has no records.
    """
    return VerificationService.get_user_verification_stats(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{verification_id}/explain",
    response_model=VerificationExplainResponse,
    status_code=status.HTTP_200_OK,
    summary="Get dedicated explainable verification breakdown",
    description="Returns detailed score justification, itemized point breakdown, localized checks in en/hi/mr, and evidence coverage.",
)
def explain_verification(
    verification_id: int,
    lang: Optional[str] = Query(None, description="Language code for user-facing explanations: 'en', 'hi', or 'mr'"),
    language: Optional[str] = Query(None, description="Alternative alias for language parameter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationExplainResponse:
    """
    Dedicated Explainability Endpoint:
    Provides citizens with fully transparent, reproducible risk scoring justifications,
    dimensional check evaluations, uncertainty impacts, and localized guidance.
    """
    selected_lang = MultilingualExplanationService.resolve_language(lang, language)
    record = VerificationService.get_verification_request(
        db=db,
        verification_id=verification_id,
        user_id=current_user.id,
        is_admin=current_user.is_admin,
    )
    bundle_data = MultilingualExplanationService.get_or_create_explanation_bundle(record)
    trilingual_bundle = bundle_data["trilingual_explanations"]
    score_breakdown = bundle_data["score_breakdown"]
    localized_res = trilingual_bundle.get(selected_lang, trilingual_bundle.get("en"))

    return VerificationExplainResponse(
        verification_id=record.id,
        scheme_name=record.scheme_name,
        status=record.status,
        risk_score=record.risk_score if record.risk_score is not None else 20.0,
        confidence_score=record.confidence_score if record.confidence_score is not None else 50.0,
        result_label=record.result_label or "unable_to_verify",
        scoring_policy_version=bundle_data["scoring_policy_version"],
        evidence_coverage=bundle_data["evidence_coverage"],
        matched_scheme_id=getattr(record, "matched_scheme_id", None),
        category=getattr(record, "category", None),
        localization_completeness=getattr(record, "localization_completeness", None) or bundle_data.get("localization_completeness", "complete"),
        selected_language=selected_lang,
        explanation=localized_res,
        score_breakdown=score_breakdown,
        created_at=record.created_at,
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
    lang: Optional[str] = Query(None, description="Language code for user-facing explanations: 'en', 'hi', or 'mr'"),
    language: Optional[str] = Query(None, description="Alternative alias for language parameter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VerificationResponse:
    """
    Retrieves a single verification record.
    Returns 404 if not found, or 403 Forbidden if attempted by another citizen.
    Accepts 'lang' or 'language' parameter to return localized explanations without changing scores.
    """
    selected_lang = MultilingualExplanationService.resolve_language(lang, language)
    record = VerificationService.get_verification_request(
        db=db,
        verification_id=verification_id,
        user_id=current_user.id,
        is_admin=current_user.is_admin,
    )
    return format_verification_response(record, lang=selected_lang, response_cls=VerificationResponse)
