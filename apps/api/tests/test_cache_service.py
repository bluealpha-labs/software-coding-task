import pytest
from unittest.mock import Mock, patch
from api.services.cache_service import CacheService

class TestCacheService:
    def test_cache_service_disabled(self):
        """Test cache service when Redis is disabled"""
        with patch.dict('os.environ', {'REDIS_ENABLED': 'false'}):
            cache_service = CacheService()
            assert cache_service.enabled is False
            assert cache_service.get("test_key") is None
            assert cache_service.set("test_key", "test_value") is False
            assert cache_service.delete("test_key") is False

    @patch('redis.Redis')
    def test_cache_service_enabled_success(self, mock_redis):
        """Test cache service when Redis is enabled and working"""
        mock_redis_instance = Mock()
        mock_redis_instance.ping.return_value = True
        mock_redis_instance.get.return_value = '{"test": "value"}'
        mock_redis_instance.setex.return_value = True
        mock_redis_instance.delete.return_value = True
        mock_redis.return_value = mock_redis_instance
        
        with patch.dict('os.environ', {'REDIS_ENABLED': 'true'}):
            cache_service = CacheService()
            assert cache_service.enabled is True
            
            # Test get
            result = cache_service.get("test_key")
            assert result == {"test": "value"}
            
            # Test set
            result = cache_service.set("test_key", {"test": "value"})
            assert result is True
            
            # Test delete
            result = cache_service.delete("test_key")
            assert result is True

    @patch('redis.Redis')
    def test_cache_service_connection_failure(self, mock_redis):
        """Test cache service when Redis connection fails"""
        mock_redis.side_effect = Exception("Connection failed")
        
        with patch.dict('os.environ', {'REDIS_ENABLED': 'true'}):
            cache_service = CacheService()
            assert cache_service.enabled is False
            assert cache_service.redis_client is None

    @patch('redis.Redis')
    def test_cache_service_operations_failure(self, mock_redis):
        """Test cache service when Redis operations fail"""
        mock_redis_instance = Mock()
        mock_redis_instance.ping.return_value = True
        mock_redis_instance.get.side_effect = Exception("Redis error")
        mock_redis_instance.setex.side_effect = Exception("Redis error")
        mock_redis_instance.delete.side_effect = Exception("Redis error")
        mock_redis.return_value = mock_redis_instance
        
        with patch.dict('os.environ', {'REDIS_ENABLED': 'true'}):
            cache_service = CacheService()
            assert cache_service.enabled is True
            
            # Test operations that should fail gracefully
            assert cache_service.get("test_key") is None
            assert cache_service.set("test_key", "value") is False
            assert cache_service.delete("test_key") is False
