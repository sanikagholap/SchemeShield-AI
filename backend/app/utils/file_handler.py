import os
import re
import uuid
from pathlib import Path
from typing import Set

from app.config import get_settings
from app.utils.exceptions import AppException

settings = get_settings()

ALLOWED_EXTENSIONS: Set[str] = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}


def ensure_upload_directory() -> Path:
    """Ensures the uploads directory exists on disk."""
    upload_path = settings.upload_path
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path


def validate_file_extension(filename: str) -> str:
    """
    Validates whether the uploaded file has a permissible extension.
    Returns the lowercased extension.
    """
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise AppException(
            message=f"File extension '{ext}' is not supported. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
            status_code=400,
        )
    return ext


def generate_safe_filename(original_filename: str) -> str:
    """
    Generates a collision-resistant, sanitized filename preserving extension.
    """
    ext = validate_file_extension(original_filename)
    safe_stem = re.sub(r"[^a-zA-Z0-9_-]", "_", Path(original_filename).stem)[:30]
    unique_token = uuid.uuid4().hex[:12]
    return f"{safe_stem}_{unique_token}{ext}"
