from typing import Dict, Any, Optional
from api.config import get_settings
from api.constants import FEATURE_FLAGS

class FeatureFlagService:
    """Service for managing feature flags."""
    
    def __init__(self):
        self.settings = get_settings()
        self.flags = FEATURE_FLAGS.copy()
    
    def is_enabled(self, flag_name: str) -> bool:
        """Check if a feature flag is enabled."""
        return self.flags.get(flag_name, False)
    
    def get_flag(self, flag_name: str, default: Any = None) -> Any:
        """Get feature flag value."""
        return self.flags.get(flag_name, default)
    
    def set_flag(self, flag_name: str, value: Any) -> None:
        """Set a feature flag value."""
        self.flags[flag_name] = value
    
    def get_all_flags(self) -> Dict[str, Any]:
        """Get all feature flags."""
        return self.flags.copy()
    
    def update_flags(self, new_flags: Dict[str, Any]) -> None:
        """Update multiple feature flags."""
        self.flags.update(new_flags)

# Global feature flag service
feature_flags = FeatureFlagService()

def require_feature(flag_name: str):
    """Decorator to require a feature flag for endpoint access."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not feature_flags.is_enabled(flag_name):
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=404,
                    detail=f"Feature '{flag_name}' is not enabled"
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator
