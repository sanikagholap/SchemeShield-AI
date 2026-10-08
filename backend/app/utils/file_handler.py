import os
import re
import uuid
from pathlib import Path
from typing import Set

from app.config import get_settings
from app.utils.exceptions import AppException
from app.utils.logger import logger

settings = get_settings()

ALLOWED_EXTENSIONS: Set[str] = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt"}


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
    if not filename or not filename.strip():
        raise AppException("Uploaded file must have a valid filename.", status_code=400)

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise AppException(
            message=f"File extension '{ext}' is not supported. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
            status_code=400,
        )
    return ext


def validate_file_size(file_size_bytes: int, max_mb: int = None) -> None:
    """
    Validates file size. Rejects empty files and files exceeding maximum configured MB.
    """
    limit_mb = max_mb if max_mb is not None else settings.MAX_UPLOAD_SIZE_MB
    max_bytes = limit_mb * 1024 * 1024

    if file_size_bytes <= 0:
        raise AppException("Uploaded file is empty (0 bytes).", status_code=400)

    if file_size_bytes > max_bytes:
        raise AppException(
            message=f"Uploaded file size ({round(file_size_bytes / (1024 * 1024), 2)} MB) exceeds the maximum allowed limit of {limit_mb} MB.",
            status_code=400,
        )


def generate_safe_filename(original_filename: str) -> str:
    """
    Generates a collision-resistant, sanitized filename preserving extension.
    """
    ext = validate_file_extension(original_filename)
    safe_stem = re.sub(r"[^a-zA-Z0-9_-]", "_", Path(original_filename).stem)[:30]
    unique_token = uuid.uuid4().hex[:12]
    return f"{safe_stem}_{unique_token}{ext}"


def remove_temporary_file(path: Path) -> None:
    """
    Safely deletes a temporary uploaded file.
    Suppresses and logs errors to prevent leaking server details or crashing requests.
    """
    try:
        if path and path.exists():
            path.unlink(missing_ok=True)
            logger.debug(f"Removed temporary file at {path}")
    except Exception as exc:
        logger.warning(f"Failed to remove temporary file {path}: {exc}")
