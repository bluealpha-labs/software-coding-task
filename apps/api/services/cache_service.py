import json
import hashlib
import time
import asyncio
import threading
from typing import Any, Optional, Callable, Awaitable, Dict
import redis
from api.config import get_settings

class CacheService:
    """Caching service with Redis backend and in-memory fallback."""
    
    def __init__(self):
        self.settings = get_settings()
        self.redis_client = None
        self._cache = {}  # In-memory fallback cache
        self._cache_lock = threading.RLock()  # Thread-safe lock for in-memory cache
        from api.constants import CACHE_MAX_SIZE
        self._max_cache_size = CACHE_MAX_SIZE  # Maximum number of items in memory cache
        
        # Cache statistics
        self._stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "invalidations": 0
        }
        
        # Try to connect to Redis
        try:
            self.redis_client = redis.Redis(
                host=getattr(self.settings, 'REDIS_HOST', 'localhost'),
                port=getattr(self.settings, 'REDIS_PORT', 6379),
                db=getattr(self.settings, 'REDIS_DB', 0),
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
        except Exception:
            # Fall back to in-memory cache
            self.redis_client = None
    
    def _get_redis_key(self, key: str) -> str:
        """Get Redis key with prefix."""
        return f"mmm_dashboard:{key}"
    
    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        """Set cache value with TTL."""
        # Convert Pydantic models to dicts for JSON serialization
        if hasattr(value, 'dict'):
            value = value.dict()
        elif hasattr(value, 'model_dump'):
            value = value.model_dump()
        
        serialized_value = json.dumps(value)
        self._stats["sets"] += 1
        
        if self.redis_client:
            try:
                self.redis_client.setex(self._get_redis_key(key), ttl, serialized_value)
            except Exception:
                # Fall back to in-memory
                self._set_in_memory(key, serialized_value, ttl)
        else:
            self._set_in_memory(key, serialized_value, ttl)
    
    def _set_in_memory(self, key: str, value: str, ttl: int) -> None:
        """Set value in thread-safe in-memory cache."""
        with self._cache_lock:
            # Check cache size limit
            if len(self._cache) >= self._max_cache_size:
                # Remove oldest entries (simple LRU)
                oldest_key = next(iter(self._cache))
                del self._cache[oldest_key]
            
            self._cache[key] = {
                "value": value,
                "expires": time.time() + ttl
            }
    
    def get(self, key: str) -> Optional[Any]:
        """Get cache value."""
        if self.redis_client:
            try:
                value = self.redis_client.get(self._get_redis_key(key))
                if value:
                    self._stats["hits"] += 1
                    return json.loads(value)
            except Exception:
                pass
        
        # Fall back to in-memory cache
        result = self._get_from_memory(key)
        if result is not None:
            self._stats["hits"] += 1
        else:
            self._stats["misses"] += 1
        return result
    
    def _get_from_memory(self, key: str) -> Optional[Any]:
        """Get value from thread-safe in-memory cache."""
        with self._cache_lock:
            if key in self._cache:
                cache_entry = self._cache[key]
                if time.time() < cache_entry["expires"]:
                    return json.loads(cache_entry["value"])
                else:
                    del self._cache[key]
            return None
    
    def invalidate(self, key: str) -> None:
        """Invalidate cache key."""
        if self.redis_client:
            try:
                self.redis_client.delete(self._get_redis_key(key))
            except Exception:
                pass
        
        with self._cache_lock:
            if key in self._cache:
                del self._cache[key]
                self._stats["invalidations"] += 1
    
    def invalidate_pattern(self, pattern: str) -> None:
        """Invalidate cache keys matching pattern."""
        if self.redis_client:
            try:
                keys = self.redis_client.keys(self._get_redis_key(pattern))
                if keys:
                    self.redis_client.delete(*keys)
            except Exception:
                pass
        
        # For in-memory cache, we need to check each key
        with self._cache_lock:
            keys_to_delete = []
            for key in self._cache:
                if self._match_pattern(key, pattern):
                    keys_to_delete.append(key)
            
            for key in keys_to_delete:
                del self._cache[key]
    
    def _match_pattern(self, key: str, pattern: str) -> bool:
        """Simple pattern matching for cache invalidation."""
        import fnmatch
        return fnmatch.fnmatch(key, pattern)
    
    async def cached_call(self, cache_key: str, func: Callable, ttl: int = 300, *args, **kwargs) -> Any:
        """Call function with caching."""
        # Check cache first
        cached_result = self.get(cache_key)
        if cached_result is not None:
            return cached_result
        
        # Call function and cache result
        if asyncio.iscoroutinefunction(func):
            result = await func(*args, **kwargs)
        else:
            result = func(*args, **kwargs)
        
        self.set(cache_key, result, ttl)
        return result
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        with self._cache_lock:
            total_requests = self._stats["hits"] + self._stats["misses"]
            hit_rate = (self._stats["hits"] / total_requests * 100) if total_requests > 0 else 0
            
            return {
                "hits": self._stats["hits"],
                "misses": self._stats["misses"],
                "sets": self._stats["sets"],
                "invalidations": self._stats["invalidations"],
                "hit_rate": round(hit_rate, 2),
                "memory_cache_size": len(self._cache),
                "redis_connected": self.redis_client is not None
            }

def cache_key(prefix: str, action: str, **kwargs) -> str:
    """Generate cache key from parameters."""
    # Sort kwargs for consistent key generation
    sorted_kwargs = sorted(kwargs.items())
    key_data = f"{prefix}:{action}:{':'.join(f'{k}={v}' for k, v in sorted_kwargs)}"
    
    # Hash long keys to keep them manageable
    if len(key_data) > 100:
        return hashlib.md5(key_data.encode()).hexdigest()
    
    return key_data

# Global cache instance
cache_service = CacheService()