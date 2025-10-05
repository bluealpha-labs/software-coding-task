import redis
import json
import os
from typing import Optional, Any
from api.logging_config import get_logger

logger = get_logger(__name__)

class CacheService:
    def __init__(self):
        self.redis_client = None
        self.enabled = os.getenv('REDIS_ENABLED', 'false').lower() == 'true'
        
        if self.enabled:
            try:
                self.redis_client = redis.Redis(
                    host=os.getenv('REDIS_HOST', 'localhost'),
                    port=int(os.getenv('REDIS_PORT', 6379)),
                    db=int(os.getenv('REDIS_DB', 0)),
                    decode_responses=True
                )
                # Test connection
                self.redis_client.ping()
                logger.info("Redis cache service initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Redis cache: {e}")
                logger.info("Continuing without cache")
                self.enabled = False
                self.redis_client = None
        else:
            logger.info("Redis cache disabled")

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """Set value in cache with expiration"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            serialized_value = json.dumps(value)
            self.redis_client.setex(key, expire, serialized_value)
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False

    def clear_pattern(self, pattern: str) -> bool:
        """Clear all keys matching pattern"""
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Cache clear pattern error for {pattern}: {e}")
            return False

# Global instance
cache_service = CacheService()
