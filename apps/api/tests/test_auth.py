import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from api.main import app
from api.models.user import UserCreate

client = TestClient(app)

class TestAuth:
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data

    @patch('api.services.database_service.db_service.get_user_by_email')
    @patch('api.services.database_service.db_service.create_user')
    def test_register_success(self, mock_create_user, mock_get_user):
        """Test successful user registration"""
        # Mock no existing user
        mock_get_user.return_value = None
        
        # Mock successful user creation
        mock_create_user.return_value = {
            "id": 1,
            "email": "test@example.com",
            "full_name": "Test User",
            "is_active": True,
            "created_at": "2024-01-01T00:00:00"
        }
        
        user_data = {
            "email": "test@example.com",
            "password": "TestPassword123",
            "full_name": "Test User"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"
        assert "id" in data
        assert "hashed_password" not in data

    @patch('api.services.database_service.db_service.get_user_by_email')
    def test_register_duplicate_email(self, mock_get_user):
        """Test registration with duplicate email"""
        # Mock existing user
        mock_get_user.return_value = {
            "id": 1,
            "email": "test@example.com",
            "full_name": "Existing User",
            "is_active": True,
            "created_at": "2024-01-01T00:00:00"
        }
        
        user_data = {
            "email": "test@example.com",
            "password": "TestPassword123",
            "full_name": "Test User"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_register_invalid_data(self):
        """Test registration with invalid data"""
        invalid_data = {
            "email": "invalid-email",
            "password": "weak",
            "full_name": "Test User"
        }
        
        response = client.post("/auth/register", json=invalid_data)
        assert response.status_code == 422

    @patch('api.services.database_service.db_service.get_user_by_email')
    def test_login_success(self, mock_get_user):
        """Test successful login"""
        # Mock user exists with hashed password
        mock_get_user.return_value = {
            "id": 1,
            "email": "test@example.com",
            "full_name": "Test User",
            "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HSbK8m2",  # bcrypt hash for 'admin123'
            "is_active": True,
            "created_at": "2024-01-01T00:00:00"
        }
        
        login_data = {
            "username": "test@example.com",
            "password": "admin123"
        }
        
        response = client.post("/auth/token", data=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @patch('api.services.database_service.db_service.get_user_by_email')
    def test_login_invalid_credentials(self, mock_get_user):
        """Test login with invalid credentials"""
        # Mock no user found
        mock_get_user.return_value = None
        
        login_data = {
            "username": "test@example.com",
            "password": "wrongpassword"
        }
        
        response = client.post("/auth/token", data=login_data)
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
