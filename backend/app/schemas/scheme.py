from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SchemeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scheme_name: str
    scheme_code: Optional[str] = None
    ministry: Optional[str] = None
    official_portal_url: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    verified_official: bool
    created_at: datetime


class SavedSchemeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    scheme_id: int
    notes: Optional[str] = None
    scheme: Optional[SchemeResponse] = None
    created_at: datetime
