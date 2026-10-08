from sqlalchemy import inspect
from app.database.connection import engine, check_db_connection, get_db
from app.models.user import User


def test_database_connection_live():
    """Confirms database connectivity check succeeds."""
    assert check_db_connection() is True


def test_database_tables_initialized():
    """
    Confirms all foundation tables are created in the SQLite database.
    """
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    expected_tables = {
        "users",
        "government_schemes",
        "verifications",
        "verification_evidence",
        "verification_history",
        "saved_schemes",
        "ai_conversations",
    }

    for table in expected_tables:
        assert table in table_names, f"Table '{table}' should exist in database."


def test_database_session_dependency():
    """Verifies that get_db yields an active SQLAlchemy session."""
    db_gen = get_db()
    session = next(db_gen)
    assert session is not None
    # Verify session can execute a simple query
    result = session.query(User).count()
    assert result >= 0
    # Complete generator
    try:
        next(db_gen)
    except StopIteration:
        pass
