"""
Integration tests for MMM endpoints
"""
import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from api.main import app
from api.meridian_adapter import MeridianModelAdapter

client = TestClient(app)

class TestMMMEndpoints:
    """Test MMM development endpoints"""
    
    def test_get_contributions_success(self):
        """Test successful contributions endpoint"""
        with patch('api.routers.mmm_dev.get_model_adapter') as mock_adapter:
            mock_model = MagicMock()
            mock_model.get_contributions.return_value = [
                {"channel": "TV", "value": 100000},
                {"channel": "Digital", "value": 75000},
            ]
            mock_adapter.return_value = mock_model
            
            response = client.get("/api/mmm-dev/contributions")
            
            assert response.status_code == 200
            data = response.json()
            assert "contributions" in data
            assert len(data["contributions"]) == 2
            assert data["contributions"][0]["channel"] == "TV"
            assert data["contributions"][0]["value"] == 100000

    def test_get_contributions_with_cache(self):
        """Test contributions endpoint with caching"""
        with patch('api.routers.mmm_dev.cache_service') as mock_cache:
            mock_cache.get.return_value = {
                "contributions": [{"channel": "TV", "value": 100000}],
                "total_contribution": 100000,
                "period": "2024-Q1"
            }
            
            response = client.get("/api/mmm-dev/contributions")
            
            assert response.status_code == 200
            data = response.json()
            assert "contributions" in data
            mock_cache.get.assert_called_once()

    def test_get_response_curve_success(self):
        """Test successful response curve endpoint"""
        with patch('api.routers.mmm_dev.get_model_adapter') as mock_adapter:
            mock_model = MagicMock()
            mock_model.get_response_curves.return_value = {
                "channel": "TV",
                "points": [
                    {"spend": 0, "response": 0},
                    {"spend": 50000, "response": 75000},
                ],
                "saturation_points": [{"spend": 120000, "response": 105000}],
                "metadata": {"elasticity": 0.8, "roi": 1.1}
            }
            mock_adapter.return_value = mock_model
            
            response = client.get("/api/mmm-dev/response-curves/TV")
            
            assert response.status_code == 200
            data = response.json()
            assert data["channel"] == "TV"
            assert "points" in data
            assert len(data["points"]) == 2
            assert "saturation_points" in data

    def test_get_response_curve_invalid_channel(self):
        """Test response curve with invalid channel"""
        with patch('api.routers.mmm_dev.get_model_adapter') as mock_adapter:
            mock_model = MagicMock()
            mock_model.get_response_curves.side_effect = ValueError("Channel not found")
            mock_adapter.return_value = mock_model
            
            response = client.get("/api/mmm-dev/response-curves/InvalidChannel")
            
            assert response.status_code == 400
            data = response.json()
            assert "error" in data

    def test_ai_explain_success(self):
        """Test successful AI explanation endpoint"""
        with patch('api.routers.mmm_dev.ai_service') as mock_ai:
            mock_ai.explain.return_value = {
                "summary": "TV shows highest contribution",
                "drill_downs": ["Analyze TV performance"],
                "caveat": "Based on Q1 data",
                "confidence_score": 0.85,
                "generated_at": "2024-01-15T10:00:00Z"
            }
            
            request_data = {
                "chart_type": "contribution",
                "metric": "contribution",
                "series": [{"channel": "TV", "value": 100000}],
                "filters": {},
                "date_range": {"start": "2024-01-01", "end": "2024-03-31"}
            }
            
            response = client.post("/api/mmm-dev/ai/explain", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "summary" in data
            assert "drill_downs" in data
            assert "caveat" in data
            assert "confidence_score" in data

    def test_ai_explain_with_cache(self):
        """Test AI explanation with caching"""
        with patch('api.routers.mmm_dev.cache_service') as mock_cache:
            mock_cache.get.return_value = {
                "summary": "Cached explanation",
                "drill_downs": ["Cached drill down"],
                "caveat": "Cached caveat",
                "confidence_score": 0.8,
                "generated_at": "2024-01-15T10:00:00Z"
            }
            
            request_data = {
                "chart_type": "contribution",
                "metric": "contribution",
                "series": [{"channel": "TV", "value": 100000}],
                "filters": {},
                "date_range": {}
            }
            
            response = client.post("/api/mmm-dev/ai/explain", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["summary"] == "Cached explanation"

    def test_ai_explain_invalid_request(self):
        """Test AI explanation with invalid request"""
        request_data = {
            "chart_type": "invalid_type",
            "metric": "contribution",
            "series": [],
            "filters": {},
            "date_range": {}
        }
        
        response = client.post("/api/mmm-dev/ai/explain", json=request_data)
        
        assert response.status_code == 422  # Validation error

    def test_data_source_info(self):
        """Test data source info endpoint"""
        with patch('api.routers.mmm_dev.get_model_adapter') as mock_adapter:
            mock_model = MagicMock()
            mock_model.get_model_info.return_value = {
                "model_type": "meridian",
                "channels": ["TV", "Digital", "Radio"],
                "capabilities": ["contributions", "response_curves"],
                "data_source": "model"
            }
            mock_adapter.return_value = mock_model
            
            response = client.get("/api/mmm-dev/data-source")
            
            assert response.status_code == 200
            data = response.json()
            assert data["data_source"] == "model"
            assert "channels" in data
            assert len(data["channels"]) == 3

    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/api/mmm-dev/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_rate_limiting(self):
        """Test rate limiting on endpoints"""
        # Make multiple requests to test rate limiting
        responses = []
        for _ in range(35):  # Exceed the 30/minute limit
            response = client.get("/api/mmm-dev/contributions")
            responses.append(response.status_code)
        
        # Should have some 429 responses
        assert 429 in responses

    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = client.options("/api/mmm-dev/contributions")
        
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers

class TestMeridianAdapter:
    """Test Meridian model adapter"""
    
    def test_load_model_success(self):
        """Test successful model loading"""
        with patch('api.meridian_adapter.pickle.load') as mock_pickle:
            mock_model = MagicMock()
            mock_model.media_channels = ["TV", "Digital"]
            mock_pickle.return_value = mock_model
            
            adapter = MeridianModelAdapter("test_model.pkl")
            
            assert adapter.model is not None
            assert len(adapter.channels) == 2
            assert "TV" in adapter.channels

    def test_load_model_fallback(self):
        """Test model loading fallback to mock"""
        with patch('api.meridian_adapter.pickle.load') as mock_pickle:
            mock_pickle.side_effect = FileNotFoundError("Model not found")
            
            adapter = MeridianModelAdapter("nonexistent_model.pkl")
            
            assert adapter.model is not None
            assert len(adapter.channels) > 0

    def test_get_contributions(self):
        """Test getting contributions from model"""
        with patch('api.meridian_adapter.pickle.load') as mock_pickle:
            mock_model = MagicMock()
            mock_model.contribution = {"TV": 100000, "Digital": 75000}
            mock_pickle.return_value = mock_model
            
            adapter = MeridianModelAdapter("test_model.pkl")
            contributions = adapter.get_contributions()
            
            assert len(contributions) == 2
            assert contributions[0].channel == "TV"
            assert contributions[0].value == 100000

    def test_get_response_curves(self):
        """Test getting response curves from model"""
        with patch('api.meridian_adapter.pickle.load') as mock_pickle:
            mock_model = MagicMock()
            mock_model.response_curves = {
                "TV": [
                    {"spend": 0, "response": 0},
                    {"spend": 50000, "response": 75000},
                ]
            }
            mock_pickle.return_value = mock_model
            
            adapter = MeridianModelAdapter("test_model.pkl")
            curves = adapter.get_response_curves("TV")
            
            assert curves.channel == "TV"
            assert len(curves.points) == 2
            assert curves.points[0].spend == 0
            assert curves.points[0].response == 0
