from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


# Many-to-Many association table linking Schemes and Beneficiary Categories
scheme_category_association = Table(
    "scheme_category_association",
    Base.metadata,
    Column("scheme_id", Integer, ForeignKey("schemes.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", Integer, ForeignKey("beneficiary_categories.id", ondelete="CASCADE"), primary_key=True),
)


class BeneficiaryCategory(Base, TimestampMixin):
    """
    Configurable beneficiary category (e.g. Student, Teacher, Farmer, Women,
    Senior Citizen, Entrepreneur, General Welfare).
    Separate from administrative and authentication roles.
    """
    __tablename__ = "beneficiary_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    keywords: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    schemes: Mapped[List["Scheme"]] = relationship(
        "Scheme", secondary=scheme_category_association, back_populates="beneficiary_category_links"
    )
    users: Mapped[List["User"]] = relationship(
        "User", secondary="user_category_association", back_populates="beneficiary_categories"
    )

    def __repr__(self) -> str:
        return f"<BeneficiaryCategory(id={self.id}, name='{self.name}', slug='{self.slug}')>"


class Scheme(Base, TimestampMixin):
    """
    Scheme model storing reference records of government schemes
    for comparison, duplicate detection, and verification analysis.
    Note: A record in this database is for comparison and does not constitute
    official governmental endorsement or live verification.
    """
    __tablename__ = "schemes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    slug: Mapped[Optional[str]] = mapped_column(String(128), unique=True, index=True, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(128), index=True, nullable=True)
    beneficiary_categories: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    benefits: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    application_process: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    official_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    source_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_domain: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    source_type: Mapped[Optional[str]] = mapped_column(String(64), default="official_portal", nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(128), default="Central", index=True, nullable=True)
    jurisdiction: Mapped[Optional[str]] = mapped_column(String(64), default="Central", nullable=True)
    launch_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    valid_from: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    valid_to: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    last_checked_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    keywords: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    alternative_names: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_official: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    provenance: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    needs_category_review: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    category_review_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    beneficiary_category_links: Mapped[List["BeneficiaryCategory"]] = relationship(
        "BeneficiaryCategory", secondary=scheme_category_association, back_populates="schemes"
    )

    def __repr__(self) -> str:
        return f"<Scheme(id={self.id}, name='{self.name}', slug='{self.slug}')>"


class GovernmentScheme(Base, TimestampMixin):
    """
    Legacy reference model preserved for backwards compatibility with Prompt 1.
    """
    __tablename__ = "government_schemes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scheme_name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    scheme_code: Mapped[Optional[str]] = mapped_column(String(64), unique=True, index=True, nullable=True)
    ministry: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    official_portal_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(128), index=True, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    verified_official: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    saved_by: Mapped[List["SavedScheme"]] = relationship(
        "SavedScheme", back_populates="scheme", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<GovernmentScheme(id={self.id}, name='{self.scheme_name}')>"


class SavedScheme(Base, TimestampMixin):
    """
    User bookmark / saved scheme association.
    """
    __tablename__ = "saved_schemes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id: Mapped[int] = mapped_column(Integer, ForeignKey("government_schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="saved_schemes")
    scheme: Mapped["GovernmentScheme"] = relationship("GovernmentScheme", back_populates="saved_by")

    def __repr__(self) -> str:
        return f"<SavedScheme(user_id={self.user_id}, scheme_id={self.scheme_id})>"
