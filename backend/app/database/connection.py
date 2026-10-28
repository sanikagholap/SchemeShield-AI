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


def _ensure_schema_columns() -> None:
    """
    Ensures newly added columns exist in SQLite tables without requiring a full reset.
    """
    if not settings.DATABASE_URL.startswith("sqlite"):
        return
    with engine.begin() as conn:
        try:
            # Schemes table migrations
            result = conn.execute(text("PRAGMA table_info(schemes)"))
            existing_cols = {row[1] for row in result.fetchall()}
            if existing_cols:
                if "is_official" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN is_official BOOLEAN DEFAULT 1 NOT NULL"))
                    logger.info("Migrated column schemes.is_official")
                if "provenance" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN provenance VARCHAR(255)"))
                    logger.info("Migrated column schemes.provenance")
                if "slug" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN slug VARCHAR(128)"))
                    logger.info("Migrated column schemes.slug")
                if "source_type" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN source_type VARCHAR(64) DEFAULT 'official_portal'"))
                    logger.info("Migrated column schemes.source_type")
                if "beneficiary_categories" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN beneficiary_categories TEXT"))
                    logger.info("Migrated column schemes.beneficiary_categories")
                if "jurisdiction" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN jurisdiction VARCHAR(64) DEFAULT 'Central'"))
                    logger.info("Migrated column schemes.jurisdiction")
                if "valid_from" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN valid_from VARCHAR(64)"))
                    logger.info("Migrated column schemes.valid_from")
                if "valid_to" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN valid_to VARCHAR(64)"))
                    logger.info("Migrated column schemes.valid_to")
                if "last_checked_at" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN last_checked_at DATETIME"))
                    logger.info("Migrated column schemes.last_checked_at")
                if "keywords" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN keywords TEXT"))
                    logger.info("Migrated column schemes.keywords")
                if "alternative_names" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN alternative_names TEXT"))
                    logger.info("Migrated column schemes.alternative_names")
                if "needs_category_review" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN needs_category_review BOOLEAN DEFAULT 0 NOT NULL"))
                    logger.info("Migrated column schemes.needs_category_review")
                if "category_review_reason" not in existing_cols:
                    conn.execute(text("ALTER TABLE schemes ADD COLUMN category_review_reason VARCHAR(255)"))
                    logger.info("Migrated column schemes.category_review_reason")

            # Users table migrations
            res_user = conn.execute(text("PRAGMA table_info(users)"))
            user_cols = {row[1] for row in res_user.fetchall()}
            if user_cols:
                if "age" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN age INTEGER"))
                    logger.info("Migrated column users.age")
                if "gender" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR(32)"))
                    logger.info("Migrated column users.gender")
                if "state" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN state VARCHAR(128)"))
                    logger.info("Migrated column users.state")
                if "annual_income" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN annual_income FLOAT"))
                    logger.info("Migrated column users.annual_income")
                if "occupation" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN occupation VARCHAR(128)"))
                    logger.info("Migrated column users.occupation")
                if "caste_category" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN caste_category VARCHAR(64)"))
                    logger.info("Migrated column users.caste_category")
                if "is_disabled" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_disabled BOOLEAN DEFAULT 0"))
                    logger.info("Migrated column users.is_disabled")

            # Verification requests migrations
            res_vr = conn.execute(text("PRAGMA table_info(verification_requests)"))
            vr_cols = {row[1] for row in res_vr.fetchall()}
            if vr_cols:
                if "scoring_policy_version" not in vr_cols:
                    conn.execute(text("ALTER TABLE verification_requests ADD COLUMN scoring_policy_version VARCHAR(32) DEFAULT '2.0'"))
                    logger.info("Migrated column verification_requests.scoring_policy_version")
                if "evidence_coverage" not in vr_cols:
                    conn.execute(text("ALTER TABLE verification_requests ADD COLUMN evidence_coverage VARCHAR(32) DEFAULT 'partial'"))
                    logger.info("Migrated column verification_requests.evidence_coverage")
                if "matched_scheme_id" not in vr_cols:
                    conn.execute(text("ALTER TABLE verification_requests ADD COLUMN matched_scheme_id INTEGER"))
                    logger.info("Migrated column verification_requests.matched_scheme_id")
                if "category" not in vr_cols:
                    conn.execute(text("ALTER TABLE verification_requests ADD COLUMN category VARCHAR(128)"))
                    logger.info("Migrated column verification_requests.category")
                if "localization_completeness" not in vr_cols:
                    conn.execute(text("ALTER TABLE verification_requests ADD COLUMN localization_completeness VARCHAR(32) DEFAULT 'complete'"))
                    logger.info("Migrated column verification_requests.localization_completeness")
        except Exception as exc:
            logger.debug(f"Schema column check skipped or failed: {exc}")


def init_db() -> None:
    """
    Initializes database schema.
    Creates all defined tables if they do not already exist,
    migrates missing columns, and seeds default beneficiary categories.
    """
    # Import all models to ensure they are registered on Base.metadata
    import app.models  # noqa: F401

    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    _ensure_schema_columns()

    # Seed default beneficiary categories and synchronize scheme-category associations
    try:
        from app.services.beneficiary_service import beneficiary_service
        db = SessionLocal()
        try:
            beneficiary_service.seed_default_categories(db)
            beneficiary_service.sync_scheme_category_links(db, force=False)
        finally:
            db.close()
    except Exception as exc:
        logger.debug(f"Beneficiary category seed or scheme sync skipped or deferred: {exc}")

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
