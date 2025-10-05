import pytest
from api.models.user import UserCreate, UserLogin
from pydantic import ValidationError

class TestUserModels:
    def test_user_create_valid(self):
        """Test valid user creation"""
        user_data = {
            "email": "test@example.com",
            "password": "TestPassword123",
            "full_name": "Test User"
        }
        
        user = UserCreate(**user_data)
        assert user.email == "test@example.com"
        assert user.password == "TestPassword123"
        assert user.full_name == "Test User"

    def test_user_create_invalid_email(self):
        """Test user creation with invalid email"""
        user_data = {
            "email": "invalid-email",
            "password": "TestPassword123",
            "full_name": "Test User"
        }
        
        with pytest.raises(ValidationError):
            UserCreate(**user_data)

    def test_user_create_short_password(self):
        """Test user creation with short password"""
        user_data = {
            "email": "test@example.com",
            "password": "short",
            "full_name": "Test User"
        }
        
        with pytest.raises(ValidationError):
            UserCreate(**user_data)

    def test_user_create_long_password(self):
        """Test user creation with long password"""
        user_data = {
            "email": "test@example.com",
            "password": "A" * 130,  # Too long
            "full_name": "Test User"
        }
        
        with pytest.raises(ValidationError):
            UserCreate(**user_data)

    def test_user_create_long_full_name(self):
        """Test user creation with long full name"""
        user_data = {
            "email": "test@example.com",
            "password": "TestPassword123",
            "full_name": "A" * 256  # Too long
        }
        
        with pytest.raises(ValidationError):
            UserCreate(**user_data)

    def test_user_login_valid(self):
        """Test valid user login"""
        login_data = {
            "email": "test@example.com",
            "password": "TestPassword123"
        }
        
        user = UserLogin(**login_data)
        assert user.email == "test@example.com"
        assert user.password == "TestPassword123"

    def test_user_login_invalid_email(self):
        """Test user login with invalid email"""
        login_data = {
            "email": "invalid-email",
            "password": "TestPassword123"
        }
        
        with pytest.raises(ValidationError):
            UserLogin(**login_data)
