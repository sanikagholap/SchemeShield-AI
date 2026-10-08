from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=1000, description="Citizen inquiry or scheme verification query")
    session_id: Optional[str] = Field(None, description="Optional conversation session ID for context continuity")


class AssistantChatResponse(BaseModel):
    response: str = Field(..., description="Assistant guidance reply")
    suggestions: list[str] = Field(default_factory=list, description="Follow-up question suggestions")
    reply: Optional[str] = Field(None, description="Alias for response for backward compatibility")
    suggested_actions: list[str] = Field(default_factory=list, description="Alias for suggestions")
    session_id: Optional[str] = None
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
