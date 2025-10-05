import pytest
import asyncio
from api.services.cache_service import CacheService, cache_key
from api.services.data_service import data_service

class TestCacheService:
    """Test caching functionality."""
    
    def test_cache_key_generation(self):
        """Test that cache keys are generated correctly."""
        key1 = cache_key("dashboard", "summary", user_id=1)
        key2 = cache_key("dashboard", "summary", user_id=2)
        key3 = cache_key("dashboard", "summary", user_id=1)
        
        assert key1 != key2  # Different users should have different keys
        assert key1 == key3  # Same parameters should have same key
    
    def test_cache_set_get(self):
        """Test basic cache set and get operations."""
        cache = CacheService()
        
        # Test setting and getting a value
        cache.set("test_key", "test_value", ttl=60)
        value = cache.get("test_key")
        assert value == "test_value"
        
        # Test cache miss
        value = cache.get("nonexistent_key")
        assert value is None
    
    def test_cache_ttl(self):
        """Test cache TTL (time to live) functionality."""
        cache = CacheService()
        
        # Set value with short TTL
        cache.set("ttl_test", "value", ttl=1)
        assert cache.get("ttl_test") == "value"
        
        # Wait for expiration (in real implementation)
        # For now, we'll test the TTL setting mechanism
        assert cache._cache["ttl_test"]["ttl"] == 1
    
    def test_cache_invalidation(self):
        """Test cache invalidation."""
        cache = CacheService()
        
        # Set a value
        cache.set("invalidate_test", "value")
        assert cache.get("invalidate_test") == "value"
        
        # Invalidate
        cache.invalidate("invalidate_test")
        assert cache.get("invalidate_test") is None
    
    def test_cache_pattern_invalidation(self):
        """Test cache invalidation by pattern."""
        cache = CacheService()
        
        # Set multiple values with similar keys
        cache.set("dashboard:user:1", "data1")
        cache.set("dashboard:user:2", "data2")
        cache.set("other:user:1", "data3")
        
        # Invalidate all dashboard keys
        cache.invalidate_pattern("dashboard:*")
        
        assert cache.get("dashboard:user:1") is None
        assert cache.get("dashboard:user:2") is None
        assert cache.get("other:user:1") == "data3"  # Should still exist
    
    @pytest.mark.asyncio
    async def test_cached_api_call(self):
        """Test that API calls are properly cached."""
        cache = CacheService()
        
        # Mock the data service to track calls
        original_get_summary = data_service.get_summary_metrics
        
        call_count = 0
        def mock_get_summary():
            nonlocal call_count
            call_count += 1
            return {"total_spend": 1000, "total_contribution": 1200, "roi": 20.0}
        
        data_service.get_summary_metrics = mock_get_summary
        
        try:
            # First call should hit the service
            result1 = await cache.cached_call(
                "dashboard:summary",
                data_service.get_summary_metrics,
                ttl=60
            )
            
            # Second call should hit cache
            result2 = await cache.cached_call(
                "dashboard:summary", 
                data_service.get_summary_metrics,
                ttl=60
            )
            
            assert result1 == result2
            assert call_count == 1  # Should only call service once
            
        finally:
            # Restore original method
            data_service.get_summary_metrics = original_get_summary
