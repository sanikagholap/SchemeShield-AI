from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


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
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(128), index=True, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    benefits: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    application_process: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    official_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    source_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_domain: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(128), default="Central", index=True, nullable=True)
    launch_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<Scheme(id={self.id}, name='{self.name}')>"


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
