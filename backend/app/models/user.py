from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.verification import Verification, VerificationHistory
    from app.models.scheme import SavedScheme
    from app.models.conversation import AIConversation


class User(Base, TimestampMixin):
    """
    User model for citizens and administrators of SchemeShield AI.
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships for future features
    verifications: Mapped[List["Verification"]] = relationship(
        "Verification", back_populates="user", cascade="all, delete-orphan"
    )
    saved_schemes: Mapped[List["SavedScheme"]] = relationship(
        "SavedScheme", back_populates="user", cascade="all, delete-orphan"
    )
    histories: Mapped[List["VerificationHistory"]] = relationship(
        "VerificationHistory", back_populates="user", cascade="all, delete-orphan"
    )
    conversations: Mapped[List["AIConversation"]] = relationship(
        "AIConversation", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', is_active={self.is_active})>"
