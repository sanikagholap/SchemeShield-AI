from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class VerificationHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    verification_id: int
    action: str
    notes: Optional[str] = None
    created_at: datetime
