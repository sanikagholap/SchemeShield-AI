import json
from functools import lru_cache
from pathlib import Path
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized application configuration managed via environment variables.
    Adheres to 12-factor application design principles.
    """

    # Project metadata
    PROJECT_NAME: str = "SchemeShield AI"
    PROJECT_TAGLINE: str = "Verify Before You Trust."
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Database configuration (Zero-cost local SQLite default)
    DATABASE_URL: str = "sqlite:///./schemeshield.db"

    # Security & Authentication
    SECRET_KEY: str = "insecure-development-secret-key-change-in-production"
    JWT_SECRET_KEY: str = "insecure-development-jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day (1440 minutes)

    # CORS settings - allows frontend clients to connect cleanly
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
    ]

    # File Upload settings
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # Logging
    LOG_LEVEL: str = "INFO"

    # Official Government Sources Configuration (Configurable trusted domains)
    TRUSTED_GOVERNMENT_DOMAINS: Union[List[str], str] = [
        "myscheme.gov.in",
        "india.gov.in",
        "pib.gov.in",
        "data.gov.in",
        "digitalindia.gov.in",
    ]

    @field_validator("TRUSTED_GOVERNMENT_DOMAINS", mode="before")
    @classmethod
    def assemble_trusted_domains(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_trimmed = v.strip()
            if v_trimmed.startswith("[") and v_trimmed.endswith("]"):
                try:
                    return json.loads(v_trimmed)
                except Exception:
                    pass
            return [domain.strip().lower() for domain in v.split(",") if domain.strip()]
        elif isinstance(v, list):
            return [d.lower() for d in v]
        return []

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_trimmed = v.strip()
            if v_trimmed.startswith("[") and v_trimmed.endswith("]"):
                try:
                    return json.loads(v_trimmed)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    @property
    def upload_path(self) -> Path:
        """Returns the resolved Path object for file uploads."""
        path = Path(self.UPLOAD_DIR)
        return path

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Return a cached instance of application settings."""
    return Settings()
