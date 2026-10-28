import json
import math
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user, get_optional_current_user
from app.models.scheme import BeneficiaryCategory, Scheme
from app.models.user import User
from app.schemas.scheme import (
    BeneficiaryCategoryResponse,
    EligibilityRecommendationResponse,
    RecommendationListResponse,
    SchemeCreate,
    SchemeListResponse,
    SchemeResponse,
    SchemeUpdate,
)
from app.services.beneficiary_service import beneficiary_service
from app.utils.exceptions import ConflictException, NotFoundException
from app.utils.logger import logger

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


@router.get(
    "",
    response_model=SchemeListResponse,
    status_code=status.HTTP_200_OK,
    summary="List and filter government scheme records",
    description="Returns a paginated list of schemes with optional filtering by search term, category, beneficiary category, state, and department.",
)
def list_schemes(
    search: Optional[str] = Query(None, description="Search keyword in scheme name or description"),
    category: Optional[str] = Query(None, description="Filter by sector category (e.g. Agriculture, Education)"),
    beneficiary_category: Optional[str] = Query(None, description="Filter by beneficiary category slug (e.g. farmer, student, women, teacher, senior-citizen, entrepreneur, general-welfare)"),
    state: Optional[str] = Query(None, description="Filter by state or 'Central'"),
    department: Optional[str] = Query(None, description="Filter by governing ministry or department"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_official: Optional[bool] = Query(None, description="Filter by official catalog status"),
    needs_category_review: Optional[bool] = Query(None, description="Filter schemes flagged for classification review"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
) -> SchemeListResponse:
    """
    Public listing endpoint for browsing scheme records used as references of truth.
    """
    stmt = select(Scheme)
    count_stmt = select(func.count(Scheme.id))

    # Apply search filter
    if search:
        search_term = f"%{search.strip()}%"
        search_filter = or_(
            Scheme.name.ilike(search_term),
            Scheme.description.ilike(search_term),
        )
        stmt = stmt.where(search_filter)
        count_stmt = count_stmt.where(search_filter)

    # Beneficiary category slug filter
    if beneficiary_category:
        clean_cat = beneficiary_category.strip().lower()
        stmt = stmt.where(Scheme.beneficiary_category_links.any(BeneficiaryCategory.slug == clean_cat))
        count_stmt = count_stmt.where(Scheme.beneficiary_category_links.any(BeneficiaryCategory.slug == clean_cat))

    # General category filter (matches text category or linked beneficiary category)
    if category:
        cat_term = category.strip()
        cat_filter = or_(
            Scheme.category.ilike(f"%{cat_term}%"),
            Scheme.beneficiary_category_links.any(BeneficiaryCategory.slug == cat_term.lower()),
            Scheme.beneficiary_category_links.any(BeneficiaryCategory.name.ilike(f"%{cat_term}%")),
        )
        stmt = stmt.where(cat_filter)
        count_stmt = count_stmt.where(cat_filter)

    if state:
        stmt = stmt.where(Scheme.state.ilike(state.strip()))
        count_stmt = count_stmt.where(Scheme.state.ilike(state.strip()))

    if department:
        stmt = stmt.where(Scheme.department.ilike(f"%{department.strip()}%"))
        count_stmt = count_stmt.where(Scheme.department.ilike(f"%{department.strip()}%"))

    if is_active is not None:
        stmt = stmt.where(Scheme.is_active == is_active)
        count_stmt = count_stmt.where(Scheme.is_active == is_active)

    if is_official is not None:
        stmt = stmt.where(Scheme.is_official == is_official)
        count_stmt = count_stmt.where(Scheme.is_official == is_official)

    if needs_category_review is not None:
        stmt = stmt.where(Scheme.needs_category_review == needs_category_review)
        count_stmt = count_stmt.where(Scheme.needs_category_review == needs_category_review)

    total = db.scalar(count_stmt) or 0
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    offset = (page - 1) * page_size
    items = list(db.scalars(stmt.order_by(Scheme.name.asc()).offset(offset).limit(page_size)).all())

    return SchemeListResponse(
        items=[SchemeResponse.model_validate(s) for s in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/categories",
    response_model=List[BeneficiaryCategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="List all configurable beneficiary categories with real scheme counts",
    description="Returns all active beneficiary categories with genuine scheme counts from the persisted catalogue.",
)
def list_categories(
    db: Session = Depends(get_db),
) -> List[BeneficiaryCategoryResponse]:
    """
    Returns configured beneficiary categories and the real number of cataloged schemes in each.
    Empty categories remain strictly with count=0; no synthetic records are fabricated.
    """
    categories = beneficiary_service.get_all_categories(db)
    return [BeneficiaryCategoryResponse(**c) for c in categories]


@router.get(
    "/categories/{slug}",
    response_model=BeneficiaryCategoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get beneficiary category details by slug",
    description="Returns metadata and active scheme count for a specific category.",
)
def get_category_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> BeneficiaryCategoryResponse:
    """
    Retrieves category details by slug. Returns 404 if the category does not exist.
    """
    cat = beneficiary_service.get_category_by_slug(db, slug)
    if not cat:
        raise NotFoundException(resource="BeneficiaryCategory", identifier=slug)
    return BeneficiaryCategoryResponse(**cat)


@router.get(
    "/recommendations",
    response_model=RecommendationListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get personalized scheme recommendations based on citizen profile",
    description="Evaluates real catalog schemes against the citizen's demographic profile (age, gender, state, income, categories) using strict, deterministic rules.",
)
def get_scheme_recommendations(
    age: Optional[int] = Query(None, ge=0, le=130, description="Citizen age in years"),
    gender: Optional[str] = Query(None, description="Citizen gender (e.g. Female, Male)"),
    state: Optional[str] = Query(None, description="Citizen state of residence (or Central)"),
    annual_income: Optional[float] = Query(None, ge=0, description="Annual household income in INR"),
    category: Optional[str] = Query(None, description="Filter by target beneficiary category slug"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: eligible, potentially_eligible, ineligible, insufficient_information"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
) -> RecommendationListResponse:
    """
    Computes explainable eligibility recommendations from the real scheme catalogue:
    - Never awards automatic eligibility purely based on category membership.
    - Accurately checks income, age, gender, residency, and required certificates.
    - Each recommendation carries explicit status, score, match reasons, missing criteria, and official limitations.
    """
    # 1. Build profile context from current authenticated user or query params
    resolved_age = age if age is not None else (current_user.age if current_user else None)
    resolved_gender = gender.strip() if gender else (current_user.gender if current_user else None)
    resolved_state = state.strip() if state else (current_user.state if current_user else None)
    resolved_income = annual_income if annual_income is not None else (current_user.annual_income if current_user else None)

    user_cat_slugs = [c.slug for c in current_user.beneficiary_categories] if current_user else []
    if category:
        clean_cat = category.strip().lower()
        if clean_cat not in user_cat_slugs:
            user_cat_slugs.append(clean_cat)

    profile = {
        "age": resolved_age,
        "gender": resolved_gender,
        "state": resolved_state,
        "annual_income": resolved_income,
        "beneficiary_categories": user_cat_slugs,
    }

    # 2. Query candidate schemes from real database catalogue
    stmt = select(Scheme).where(Scheme.is_active == True)
    if category:
        clean_cat = category.strip().lower()
        stmt = stmt.where(Scheme.beneficiary_category_links.any(BeneficiaryCategory.slug == clean_cat))
    elif user_cat_slugs:
        stmt = stmt.where(Scheme.beneficiary_category_links.any(BeneficiaryCategory.slug.in_(user_cat_slugs)))

    candidate_schemes = list(db.scalars(stmt).all())

    # Fallback to general active schemes if filter yields no candidates
    if not candidate_schemes:
        candidate_schemes = list(db.scalars(select(Scheme).where(Scheme.is_active == True).limit(200)).all())

    # 3. Deterministically evaluate each scheme
    evaluated_items = []
    status_rank = {
        "eligible": 1,
        "potentially_eligible": 2,
        "insufficient_information": 3,
        "ineligible": 4,
    }

    for scheme in candidate_schemes:
        result = beneficiary_service.evaluate_scheme_eligibility(scheme, profile)
        if status_filter and result["status"] != status_filter.strip().lower():
            continue

        item = EligibilityRecommendationResponse(
            scheme=SchemeResponse.model_validate(scheme),
            eligibility_status=result["status"],
            eligibility_score=result["score"],
            match_reasons=result["match_reasons"],
            missing_criteria=result["missing_criteria"],
            limitations=result["limitations"],
        )
        evaluated_items.append((status_rank.get(result["status"], 5), -result["score"], scheme.name, item))

    # 4. Sort: highest rank status, highest score, then name
    evaluated_items.sort(key=lambda x: (x[0], x[1], x[2]))
    total = len(evaluated_items)
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    offset = (page - 1) * page_size
    paged_items = [x[3] for x in evaluated_items[offset : offset + page_size]]

    return RecommendationListResponse(
        items=paged_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        applied_profile=profile,
    )


@router.get(
    "/{scheme_id}",
    response_model=SchemeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get scheme details by ID",
    description="Returns detailed reference information for a single government scheme.",
)
def get_scheme_by_id(
    scheme_id: int,
    db: Session = Depends(get_db),
) -> SchemeResponse:
    """
    Retrieves a single scheme. Returns 404 if the scheme does not exist.
    """
    scheme = db.get(Scheme, scheme_id)
    if not scheme:
        raise NotFoundException(resource="Scheme", identifier=scheme_id)

    return SchemeResponse.model_validate(scheme)


@router.post(
    "",
    response_model=SchemeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new government scheme record",
    description="Protected endpoint for creating a scheme reference record. Requires an authenticated user session.",
)
def create_scheme(
    payload: SchemeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SchemeResponse:
    """
    Creates a new scheme record in the database.
    Rejects duplicate scheme names with 409 Conflict.
    Automatically classifies scheme into persistent beneficiary categories.
    """
    existing = db.scalars(select(Scheme).where(Scheme.name == payload.name.strip())).first()
    if existing:
        raise ConflictException(f"A scheme with name '{payload.name}' already exists.")

    # Perform automated classification and review check
    scheme_dict = payload.model_dump()
    cat_slugs, is_ambiguous, ambiguity_reason = beneficiary_service.classify_scheme_with_details(scheme_dict)
    if payload.beneficiary_categories:
        for c in payload.beneficiary_categories:
            if c not in cat_slugs:
                cat_slugs.append(c)

    beneficiary_service.seed_default_categories(db)
    cat_lookup = {c.slug: c for c in db.scalars(select(BeneficiaryCategory)).all()}
    matched_categories = [cat_lookup[s] for s in cat_slugs if s in cat_lookup]

    new_scheme = Scheme(
        name=payload.name.strip(),
        slug=payload.slug.strip() if payload.slug else None,
        description=payload.description.strip() if payload.description else None,
        department=payload.department.strip() if payload.department else None,
        category=payload.category.strip() if payload.category else None,
        beneficiary_categories=json.dumps(cat_slugs),
        eligibility=payload.eligibility.strip() if payload.eligibility else None,
        benefits=payload.benefits.strip() if payload.benefits else None,
        application_process=payload.application_process.strip() if payload.application_process else None,
        official_url=payload.official_url.strip() if payload.official_url else None,
        source_name=payload.source_name.strip() if payload.source_name else None,
        source_domain=payload.source_domain.strip() if payload.source_domain else None,
        source_type=payload.source_type or "official_portal",
        state=payload.state.strip() if payload.state else "Central",
        jurisdiction=payload.jurisdiction or "Central",
        launch_year=payload.launch_year,
        valid_from=payload.valid_from,
        valid_to=payload.valid_to,
        last_checked_at=payload.last_checked_at,
        keywords=json.dumps(payload.keywords) if payload.keywords else None,
        alternative_names=json.dumps(payload.alternative_names) if payload.alternative_names else None,
        is_active=payload.is_active,
        is_official=payload.is_official,
        provenance=payload.provenance.strip() if payload.provenance else None,
        needs_category_review=is_ambiguous,
        category_review_reason=ambiguity_reason,
    )
    new_scheme.beneficiary_category_links = matched_categories

    db.add(new_scheme)
    db.commit()
    db.refresh(new_scheme)

    logger.info(f"Scheme created: id={new_scheme.id}, name='{new_scheme.name}' by user id={current_user.id}")
    return SchemeResponse.model_validate(new_scheme)


@router.patch(
    "/{scheme_id}",
    response_model=SchemeResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing government scheme record",
    description="Protected endpoint for updating scheme fields. Requires an authenticated user session.",
)
def update_scheme(
    scheme_id: int,
    payload: SchemeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SchemeResponse:
    """
    Updates specific fields of a scheme. Returns 404 if not found.
    Reclassifies and synchronizes categories if classification fields changed.
    """
    scheme = db.get(Scheme, scheme_id)
    if not scheme:
        raise NotFoundException(resource="Scheme", identifier=scheme_id)

    update_data = payload.model_dump(exclude_unset=True)

    # If updating name, ensure no collision with another scheme
    if "name" in update_data and update_data["name"] != scheme.name:
        collision = db.scalars(
            select(Scheme).where(Scheme.name == update_data["name"].strip(), Scheme.id != scheme_id)
        ).first()
        if collision:
            raise ConflictException(f"Another scheme with name '{update_data['name']}' already exists.")

    for field, value in update_data.items():
        if field in ("keywords", "alternative_names") and isinstance(value, list):
            value = json.dumps(value)
        elif field == "beneficiary_categories" and isinstance(value, list):
            value = json.dumps(value)
        elif isinstance(value, str):
            value = value.strip()
        setattr(scheme, field, value)

    # If category or classification fields updated, refresh beneficiary category links
    classification_fields = {"name", "description", "department", "category", "eligibility", "beneficiary_categories"}
    if any(k in update_data for k in classification_fields):
        info = {
            "name": scheme.name,
            "description": scheme.description,
            "department": scheme.department,
            "category": scheme.category,
            "eligibility": scheme.eligibility,
        }
        slugs, is_ambiguous, reason = beneficiary_service.classify_scheme_with_details(info)
        if payload.beneficiary_categories:
            for c in payload.beneficiary_categories:
                if c not in slugs:
                    slugs.append(c)

        beneficiary_service.seed_default_categories(db)
        cat_lookup = {c.slug: c for c in db.scalars(select(BeneficiaryCategory)).all()}
        scheme.beneficiary_categories = json.dumps(slugs)
        scheme.beneficiary_category_links = [cat_lookup[s] for s in slugs if s in cat_lookup]
        scheme.needs_category_review = is_ambiguous
        scheme.category_review_reason = reason

    db.commit()
    db.refresh(scheme)

    logger.info(f"Scheme updated: id={scheme.id} by user id={current_user.id}")
    return SchemeResponse.model_validate(scheme)


@router.delete(
    "/{scheme_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a government scheme record",
    description="Protected endpoint for removing a scheme. Requires an authenticated user session.",
)
def delete_scheme(
    scheme_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Deletes a scheme record by ID. Returns 404 if not found.
    """
    scheme = db.get(Scheme, scheme_id)
    if not scheme:
        raise NotFoundException(resource="Scheme", identifier=scheme_id)

    db.delete(scheme)
    db.commit()

    logger.info(f"Scheme deleted: id={scheme_id} by user id={current_user.id}")
    return {
        "success": True,
        "message": f"Scheme '{scheme.name}' (ID {scheme_id}) deleted successfully.",
    }
