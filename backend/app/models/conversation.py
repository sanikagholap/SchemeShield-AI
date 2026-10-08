from typing import Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class AIConversation(Base, TimestampMixin):
    """
    Persisted chat history between citizens and the SchemeShield AI assistant.
    """
    __tablename__ = "ai_conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    session_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    message_role: Mapped[str] = mapped_column(String(32), nullable=False)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="conversations")

    def __repr__(self) -> str:
        return f"<AIConversation(session='{self.session_id}', role='{self.message_role}')>"
