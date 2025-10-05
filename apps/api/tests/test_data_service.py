import pytest
from unittest.mock import patch, Mock
from api.services.data_service import DataService
from api.models.dashboard import SummaryMetrics, ContributionData, ResponseCurvesData

class TestDataService:
    def test_data_service_initialization(self):
        """Test DataService initialization"""
        with patch('api.services.data_service.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            mock_cache.set.return_value = True
            
            service = DataService()
            assert service.model is None
            assert service.mock_data is not None
            assert 'channels' in service.mock_data
            assert 'spend' in service.mock_data
            assert 'contribution' in service.mock_data

    def test_get_summary_metrics_with_cache(self):
        """Test get_summary_metrics with cached data"""
        with patch('api.services.data_service.cache_service') as mock_cache:
            cached_data = {
                "total_spend": 100000,
                "total_contribution": 120000,
                "roi": 20.0,
                "top_channel": "TV",
                "total_channels": 6
            }
            mock_cache.get.return_value = cached_data
            
            service = DataService()
            result = service.get_summary_metrics()
            
            assert isinstance(result, SummaryMetrics)
            assert result.total_spend == 100000
            assert result.total_contribution == 120000
            assert result.roi == 20.0
            assert result.top_channel == "TV"
            assert result.total_channels == 6

    def test_get_summary_metrics_without_cache(self):
        """Test get_summary_metrics without cached data"""
        with patch('api.services.data_service.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            mock_cache.set.return_value = True
            
            service = DataService()
            result = service.get_summary_metrics()
            
            assert isinstance(result, SummaryMetrics)
            assert result.total_spend > 0
            assert result.total_contribution > 0
            assert result.total_channels > 0
            # Verify cache was called to store the result
            mock_cache.set.assert_called_once()

    def test_get_contribution_data_with_cache(self):
        """Test get_contribution_data with cached data"""
        with patch('api.services.data_service.cache_service') as mock_cache:
            cached_data = {
                "channels": ["TV", "Digital"],
                "spend": [50000, 30000],
                "contribution": [45000, 35000]
            }
            mock_cache.get.return_value = cached_data
            
            service = DataService()
            result = service.get_contribution_data()
            
            assert isinstance(result, ContributionData)
            assert result.channels == ["TV", "Digital"]
            assert result.spend == [50000, 30000]
            assert result.contribution == [45000, 35000]

    def test_get_contribution_data_without_cache(self):
        """Test get_contribution_data without cached data"""
        with patch('api.services.data_service.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            mock_cache.set.return_value = True
            
            service = DataService()
            result = service.get_contribution_data()
            
            assert isinstance(result, ContributionData)
            assert len(result.channels) > 0
            assert len(result.spend) > 0
            assert len(result.contribution) > 0
            # Verify cache was called to store the result
            mock_cache.set.assert_called_once()

    def test_get_response_curves_data_with_cache(self):
        """Test get_response_curves_data with cached data"""
        with patch('api.services.data_service.cache_service') as mock_cache:
            cached_data = {
                "channels": ["TV", "Digital"],
                "curves": {
                    "TV": [{"spend": 0, "response": 0}, {"spend": 1000, "response": 800}],
                    "Digital": [{"spend": 0, "response": 0}, {"spend": 1000, "response": 1200}]
                }
            }
            mock_cache.get.return_value = cached_data
            
            service = DataService()
            result = service.get_response_curves_data()
            
            assert isinstance(result, ResponseCurvesData)
            assert result.channels == ["TV", "Digital"]
            assert "TV" in result.curves
            assert "Digital" in result.curves

    def test_get_response_curves_data_without_cache(self):
        """Test get_response_curves_data without cached data"""
        with patch('api.services.data_service.cache_service') as mock_cache:
            mock_cache.get.return_value = None
            mock_cache.set.return_value = True
            
            service = DataService()
            result = service.get_response_curves_data()
            
            assert isinstance(result, ResponseCurvesData)
            assert len(result.channels) > 0
            assert len(result.curves) > 0
            # Verify cache was called to store the result
            mock_cache.set.assert_called_once()

    def test_mock_data_generation(self):
        """Test that mock data is generated correctly"""
        service = DataService()
        
        assert service.mock_data is not None
        assert 'channels' in service.mock_data
        assert 'spend' in service.mock_data
        assert 'contribution' in service.mock_data
        assert 'response_curves' in service.mock_data
        
        # Check that all arrays have the same length
        channels = service.mock_data['channels']
        spend = service.mock_data['spend']
        contribution = service.mock_data['contribution']
        
        assert len(channels) == len(spend)
        assert len(channels) == len(contribution)
        
        # Check that response curves exist for all channels
        response_curves = service.mock_data['response_curves']
        for channel in channels:
            assert channel in response_curves
            assert len(response_curves[channel]) > 0
