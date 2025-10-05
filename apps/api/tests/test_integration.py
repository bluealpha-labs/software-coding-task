import pytest
from fastapi.testclient import TestClient
from api.main import app
from api.services.database_service import db_service
from api.services.auth_service import create_access_token

client = TestClient(app)

class TestIntegration:
    """Integration tests for the API."""
    
    def test_health_endpoint(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
    
    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_register_user(self):
        """Test user registration."""
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 200
        
        user = response.json()
        assert user["email"] == "test@example.com"
        assert user["full_name"] == "Test User"
        assert "id" in user
    
    def test_login_user(self):
        """Test user login."""
        # First register a user
        user_data = {
            "email": "login@example.com",
            "password": "testpassword123",
            "full_name": "Login User"
        }
        client.post("/auth/register", json=user_data)
        
        # Then login
        login_data = {
            "username": "login@example.com",
            "password": "testpassword123"
        }
        
        response = client.post("/auth/token", data=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_protected_endpoint_without_auth(self):
        """Test that protected endpoints require authentication."""
        response = client.get("/api/summary-metrics")
        assert response.status_code == 401
    
    def test_protected_endpoint_with_auth(self):
        """Test protected endpoint with valid authentication."""
        # Register and login
        user_data = {
            "email": "protected@example.com",
            "password": "testpassword123",
            "full_name": "Protected User"
        }
        client.post("/auth/register", json=user_data)
        
        login_data = {
            "username": "protected@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/auth/token", data=login_data)
        token = login_response.json()["access_token"]
        
        # Use token to access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/summary-metrics", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_spend" in data
        assert "total_contribution" in data
        assert "roi" in data
    
    def test_dashboard_endpoints(self):
        """Test all dashboard endpoints."""
        # Register and login
        user_data = {
            "email": "dashboard@example.com",
            "password": "testpassword123",
            "full_name": "Dashboard User"
        }
        client.post("/auth/register", json=user_data)
        
        login_data = {
            "username": "dashboard@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/auth/token", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test summary metrics
        response = client.get("/api/summary-metrics", headers=headers)
        assert response.status_code == 200
        
        # Test contribution data
        response = client.get("/api/contribution-data", headers=headers)
        assert response.status_code == 200
        
        # Test response curves
        response = client.get("/api/response-curves", headers=headers)
        assert response.status_code == 200
    
    def test_rate_limiting(self):
        """Test rate limiting on dashboard endpoints."""
        # Register and login
        user_data = {
            "email": "ratelimit@example.com",
            "password": "testpassword123",
            "full_name": "Rate Limit User"
        }
        client.post("/auth/register", json=user_data)
        
        login_data = {
            "username": "ratelimit@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/auth/token", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Make many requests to trigger rate limiting
        for _ in range(35):  # More than the 30/minute limit
            response = client.get("/api/summary-metrics", headers=headers)
            if response.status_code == 429:
                break
        
        # Should eventually get rate limited
        assert response.status_code == 429
    
    def test_caching(self):
        """Test that caching works for dashboard endpoints."""
        # Register and login
        user_data = {
            "email": "cache@example.com",
            "password": "testpassword123",
            "full_name": "Cache User"
        }
        client.post("/auth/register", json=user_data)
        
        login_data = {
            "username": "cache@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/auth/token", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # First request should work
        response1 = client.get("/api/summary-metrics", headers=headers)
        assert response1.status_code == 200
        
        # Second request should also work (cached)
        response2 = client.get("/api/summary-metrics", headers=headers)
        assert response2.status_code == 200
        
        # Responses should be identical
        assert response1.json() == response2.json()
