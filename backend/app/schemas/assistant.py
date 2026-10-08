from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class AssistantChatRequest(BaseModel):
    session_id: Optional[str] = Field(None, description="Optional conversation session ID for context continuity")
    message: str = Field(..., min_length=1, max_length=2000, description="Citizen inquiry or scheme verification query")


class AssistantChatResponse(BaseModel):
    session_id: str
    reply: str
    suggested_actions: list[str] = []
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
