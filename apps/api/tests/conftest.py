import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from api.main import app
from api.services.database_service import db_service
from api.services.auth_service import create_access_token
import os

# Test database configuration
TEST_DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'test_local',
    'user': 'postgres',
    'password': 'password'
}

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)

@pytest.fixture
async def async_client():
    """Create async test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def test_user_token():
    """Create a test user token."""
    return create_access_token(data={"sub": "test@example.com"})

@pytest.fixture
def admin_token():
    """Create an admin user token."""
    return create_access_token(data={"sub": "admin@example.com"})

@pytest.fixture(autouse=True)
def setup_test_db():
    """Set up test database before each test."""
    # Override database config for tests
    original_config = db_service.conn_params
    db_service.conn_params = TEST_DB_CONFIG
    yield
    # Restore original config
    db_service.conn_params = original_config
