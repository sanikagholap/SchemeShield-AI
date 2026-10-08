from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings
from app.database.base import Base
from app.utils.logger import logger

settings = get_settings()

# Configure engine with SQLite-specific settings when using SQLite
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a SQLAlchemy database session.
    Guarantees session cleanup upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initializes database schema.
    Creates all defined tables if they do not already exist.
    """
    # Import all models to ensure they are registered on Base.metadata
    import app.models  # noqa: F401

    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")


def check_db_connection() -> bool:
    """
    Verifies that the database connection is live and healthy.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error(f"Database health check failed: {exc}")
        return False
