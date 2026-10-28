from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional, TYPE_CHECKING

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.verification import Verification, VerificationEvidence, VerificationHistory, VerificationRequest
    from app.models.scheme import BeneficiaryCategory, SavedScheme
    from app.models.conversation import AIConversation


# Many-to-Many association table linking Users and Beneficiary Categories
user_category_association = Table(
    "user_category_association",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", Integer, ForeignKey("beneficiary_categories.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base, TimestampMixin):
    """
    User model for citizens and administrators of SchemeShield AI.
    Beneficiary categories and profile attributes are kept strictly separate
    from administrative and verification roles.
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Citizen profile attributes for eligibility recommendations
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    annual_income: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    caste_category: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    is_disabled: Mapped[Optional[bool]] = mapped_column(Boolean, default=False, nullable=True)

    @property
    def hashed_password(self) -> str:
        return self.password_hash

    @hashed_password.setter
    def hashed_password(self, value: str) -> None:
        self.password_hash = value

    # Relationships for future features
    verifications: Mapped[List["Verification"]] = relationship(
        "Verification", back_populates="user", cascade="all, delete-orphan"
    )
    verification_requests: Mapped[List["VerificationRequest"]] = relationship(
        "VerificationRequest", back_populates="user", cascade="all, delete-orphan"
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
    beneficiary_categories: Mapped[List["BeneficiaryCategory"]] = relationship(
        "BeneficiaryCategory", secondary=user_category_association, back_populates="users"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', is_active={self.is_active})>"
