from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.verification import VerificationAnalyzeRequest, VerificationRequestCreate
from app.services.multilingual_service import MultilingualExplanationService
from app.services.ocr_service import ocr_processing_service
from app.services.verification_service import VerificationService, verification_service
from app.utils.exceptions import AppException
from app.utils.file_handler import (
    ensure_upload_directory,
    generate_safe_filename,
    remove_temporary_file,
    validate_file_extension,
    validate_file_size,
)

router = APIRouter(prefix="/verification", tags=["Verification"])


@router.post(
    "/analyze",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Analyze scheme text or claims for fraud and duplicate detection",
    description="Performs scheme verification analysis using the local AI/NLP engine against database catalog schemes.",
)
def analyze_scheme(
    payload: VerificationAnalyzeRequest,
    lang: Optional[str] = Query(None, description="Language code for user-facing explanations: 'en', 'hi', or 'mr'"),
    language: Optional[str] = Query(None, description="Alternative alias for language parameter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> APIResponse[dict]:
    selected_lang = MultilingualExplanationService.resolve_language(lang, language)
    resolved_title = (
        payload.title.strip()
        if payload.title and payload.title.strip()
        else payload.content.strip().splitlines()[0][:80]
    )

    req_payload = VerificationRequestCreate(
        scheme_name=resolved_title,
        description=payload.content.strip(),
        input_type="text",
    )
    record = VerificationService.create_verification_request(
        db=db,
        user_id=current_user.id,
        payload=req_payload,
    )
    processed = verification_service.process_verification(db=db, request=record)
    bundle_data = MultilingualExplanationService.get_or_create_explanation_bundle(processed)
    trilingual_bundle = bundle_data["trilingual_explanations"]
    localized_res = trilingual_bundle.get(selected_lang, trilingual_bundle.get("en"))

    return APIResponse(
        success=True,
        message="Scheme verification analysis completed successfully.",
        data={
            "id": processed.id,
            "scheme_name": processed.scheme_name,
            "status": processed.status,
            "risk_score": processed.risk_score,
            "confidence_score": processed.confidence_score,
            "result_label": processed.result_label,
            "scoring_policy_version": bundle_data["scoring_policy_version"],
            "evidence_coverage": bundle_data["evidence_coverage"],
            "matched_scheme_id": getattr(processed, "matched_scheme_id", None),
            "category": getattr(processed, "category", None),
            "localization_completeness": getattr(processed, "localization_completeness", None) or bundle_data.get("localization_completeness", "complete"),
            "selected_language": selected_lang,
            "explanation": localized_res["summary"] if localized_res else processed.explanation,
            "localized_result": localized_res,
            "score_breakdown": bundle_data["score_breakdown"],
            "trilingual_explanations": trilingual_bundle,
            "evidence": processed.evidence,
        },
    )


@router.post(
    "/upload",
    response_model=APIResponse[dict],
    status_code=status.HTTP_201_CREATED,
    summary="Upload document (PDF/Image) for OCR extraction and scheme verification",
    description="Processes uploaded flyer/document via local OCR and evaluates scheme claims against the verification database.",
)
async def upload_scheme_document(
    file: UploadFile = File(..., description="Uploaded scheme document or flyer"),
    lang: Optional[str] = Query(None, description="Language code for user-facing explanations: 'en', 'hi', or 'mr'"),
    language: Optional[str] = Query(None, description="Alternative alias for language parameter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> APIResponse[dict]:
    selected_lang = MultilingualExplanationService.resolve_language(lang, language)
    ext = validate_file_extension(file.filename or "unknown")
    upload_dir = ensure_upload_directory()
    safe_filename = generate_safe_filename(file.filename or "unknown")
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

    first_line = extracted_text.splitlines()[0].strip()
    resolved_name = (
        first_line[:80] if len(first_line) >= 3 else f"Document: {Path(file.filename or 'unknown').stem[:40]}"
    )

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

    processed = verification_service.process_verification(
        db=db,
        request=record,
        extra_evidence_signal=doc_signal,
    )
    bundle_data = MultilingualExplanationService.get_or_create_explanation_bundle(processed)
    trilingual_bundle = bundle_data["trilingual_explanations"]
    localized_res = trilingual_bundle.get(selected_lang, trilingual_bundle.get("en"))

    return APIResponse(
        success=True,
        message="Document uploaded, text extracted, and scheme verification completed successfully.",
        data={
            "id": processed.id,
            "filename": file.filename,
            "extraction_method": extraction["extraction_method"],
            "scheme_name": processed.scheme_name,
            "status": processed.status,
            "risk_score": processed.risk_score,
            "confidence_score": processed.confidence_score,
            "result_label": processed.result_label,
            "scoring_policy_version": bundle_data["scoring_policy_version"],
            "evidence_coverage": bundle_data["evidence_coverage"],
            "matched_scheme_id": getattr(processed, "matched_scheme_id", None),
            "category": getattr(processed, "category", None),
            "localization_completeness": getattr(processed, "localization_completeness", None) or bundle_data.get("localization_completeness", "complete"),
            "selected_language": selected_lang,
            "explanation": localized_res["summary"] if localized_res else processed.explanation,
            "localized_result": localized_res,
            "score_breakdown": bundle_data["score_breakdown"],
            "trilingual_explanations": trilingual_bundle,
            "evidence": processed.evidence,
        },
    )


@router.get(
    "/{verification_id}/explain",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Retrieve detailed explainable verification breakdown by ID",
    description="Returns itemized score justifications, trilingual evidence, localized checks, recommendations, and evidence coverage.",
)
def explain_verification_legacy(
    verification_id: int,
    lang: Optional[str] = Query(None, description="Language code for user-facing explanations: 'en', 'hi', or 'mr'"),
    language: Optional[str] = Query(None, description="Alternative alias for language parameter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> APIResponse[dict]:
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

    return APIResponse(
        success=True,
        message="Verification explanation retrieved successfully.",
        data={
            "verification_id": record.id,
            "scheme_name": record.scheme_name,
            "status": record.status,
            "risk_score": record.risk_score if record.risk_score is not None else 20.0,
            "confidence_score": record.confidence_score if record.confidence_score is not None else 50.0,
            "result_label": record.result_label or "unable_to_verify",
            "scoring_policy_version": bundle_data["scoring_policy_version"],
            "evidence_coverage": bundle_data["evidence_coverage"],
            "matched_scheme_id": getattr(record, "matched_scheme_id", None),
            "category": getattr(record, "category", None),
            "localization_completeness": getattr(record, "localization_completeness", None) or bundle_data.get("localization_completeness", "complete"),
            "selected_language": selected_lang,
            "explanation": localized_res,
            "score_breakdown": score_breakdown,
            "created_at": record.created_at.isoformat() if record.created_at else None,
        },
    )


@router.get(
    "/{verification_id}",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Retrieve verification result and evidence by ID",
    description="Retrieves a specific verification request record from the database. Enforces strict user ownership.",
)
def get_verification_by_id(
    verification_id: int,
    lang: Optional[str] = Query(None, description="Language code for user-facing explanations: 'en', 'hi', or 'mr'"),
    language: Optional[str] = Query(None, description="Alternative alias for language parameter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> APIResponse[dict]:
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

    return APIResponse(
        success=True,
        message="Verification record retrieved successfully.",
        data={
            "id": record.id,
            "user_id": record.user_id,
            "input_type": record.input_type,
            "scheme_name": record.scheme_name,
            "description": record.description,
            "submitted_url": record.submitted_url,
            "status": record.status,
            "risk_score": record.risk_score,
            "confidence_score": record.confidence_score,
            "result_label": record.result_label,
            "scoring_policy_version": bundle_data["scoring_policy_version"],
            "evidence_coverage": bundle_data["evidence_coverage"],
            "matched_scheme_id": getattr(record, "matched_scheme_id", None),
            "category": getattr(record, "category", None),
            "localization_completeness": getattr(record, "localization_completeness", None) or bundle_data.get("localization_completeness", "complete"),
            "selected_language": selected_lang,
            "explanation": localized_res["summary"] if localized_res else record.explanation,
            "localized_result": localized_res,
            "score_breakdown": score_breakdown,
            "trilingual_explanations": trilingual_bundle,
            "evidence": record.evidence,
            "created_at": record.created_at.isoformat() if record.created_at else None,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None,
        },
    )
