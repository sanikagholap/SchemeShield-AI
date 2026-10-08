import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.scheme import Scheme
from app.models.user import User
from app.schemas.scheme import SchemeCreate, SchemeListResponse, SchemeResponse, SchemeUpdate
from app.utils.exceptions import ConflictException, NotFoundException
from app.utils.logger import logger

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


@router.get(
    "",
    response_model=SchemeListResponse,
    status_code=status.HTTP_200_OK,
    summary="List and filter government scheme records",
    description="Returns a paginated list of schemes with optional filtering by search term, category, state, and department.",
)
def list_schemes(
    search: Optional[str] = Query(None, description="Search keyword in scheme name or description"),
    category: Optional[str] = Query(None, description="Filter by sector category (e.g. Agriculture, Education)"),
    state: Optional[str] = Query(None, description="Filter by state or 'Central'"),
    department: Optional[str] = Query(None, description="Filter by governing ministry or department"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
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

    # Apply categorical filters
    if category:
        stmt = stmt.where(Scheme.category.ilike(category.strip()))
        count_stmt = count_stmt.where(Scheme.category.ilike(category.strip()))

    if state:
        stmt = stmt.where(Scheme.state.ilike(state.strip()))
        count_stmt = count_stmt.where(Scheme.state.ilike(state.strip()))

    if department:
        stmt = stmt.where(Scheme.department.ilike(f"%{department.strip()}%"))
        count_stmt = count_stmt.where(Scheme.department.ilike(f"%{department.strip()}%"))

    if is_active is not None:
        stmt = stmt.where(Scheme.is_active == is_active)
        count_stmt = count_stmt.where(Scheme.is_active == is_active)

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
    """
    existing = db.scalars(select(Scheme).where(Scheme.name == payload.name.strip())).first()
    if existing:
        raise ConflictException(f"A scheme with name '{payload.name}' already exists.")

    new_scheme = Scheme(
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        department=payload.department.strip() if payload.department else None,
        category=payload.category.strip() if payload.category else None,
        eligibility=payload.eligibility.strip() if payload.eligibility else None,
        benefits=payload.benefits.strip() if payload.benefits else None,
        application_process=payload.application_process.strip() if payload.application_process else None,
        official_url=payload.official_url.strip() if payload.official_url else None,
        source_name=payload.source_name.strip() if payload.source_name else None,
        source_domain=payload.source_domain.strip() if payload.source_domain else None,
        state=payload.state.strip() if payload.state else "Central",
        launch_year=payload.launch_year,
        is_active=payload.is_active,
    )

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
        if isinstance(value, str):
            value = value.strip()
        setattr(scheme, field, value)

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
