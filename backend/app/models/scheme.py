from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class GovernmentScheme(Base, TimestampMixin):
    """
    Verified Government Scheme repository model used as reference of truth.
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
