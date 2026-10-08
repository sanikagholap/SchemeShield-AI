import os
import pytest
from fastapi.testclient import TestClient

# Ensure test configuration before importing application components
os.environ["ENVIRONMENT"] = "testing"
os.environ["DATABASE_URL"] = "sqlite:///./test_schemeshield.db"
os.environ["DEBUG"] = "true"

from app.config import get_settings
# Clear cache to pick up env vars
get_settings.cache_clear()

from app.database.connection import engine, init_db
from app.database.base import Base
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Initializes the database schema for the test session."""
    init_db()
    yield
    # Cleanup test tables and file
    Base.metadata.drop_all(bind=engine)
    test_db_file = "test_schemeshield.db"
    if os.path.exists(test_db_file):
        try:
            os.remove(test_db_file)
        except OSError:
            pass


@pytest.fixture
def client():
    """Provides a TestClient for testing HTTP requests."""
    with TestClient(app) as test_client:
        yield test_client
