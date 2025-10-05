"""Security utilities for sanitizing sensitive data."""

import re
from typing import Any, Dict, List


def sanitize_error_message(error_message: str) -> str:
    """Sanitize error messages to remove sensitive information."""
    if not isinstance(error_message, str):
        return str(error_message)
    
    # List of sensitive patterns to redact
    sensitive_patterns = [
        (r'password["\']?\s*[:=]\s*["\']?[^"\']+["\']?', 'password="***"'),
        (r'token["\']?\s*[:=]\s*["\']?[^"\']+["\']?', 'token="***"'),
        (r'secret["\']?\s*[:=]\s*["\']?[^"\']+["\']?', 'secret="***"'),
        (r'key["\']?\s*[:=]\s*["\']?[^"\']+["\']?', 'key="***"'),
        (r'authorization["\']?\s*[:=]\s*["\']?[^"\']+["\']?', 'authorization="***"'),
        (r'bearer\s+[a-zA-Z0-9\-_\.]+', 'bearer ***'),
        (r'jwt\s+[a-zA-Z0-9\-_\.]+', 'jwt ***'),
    ]
    
    sanitized = error_message
    for pattern, replacement in sensitive_patterns:
        sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)
    
    return sanitized


def sanitize_dict_for_logging(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize dictionary data for safe logging."""
    sensitive_keys = {
        'password', 'token', 'secret', 'key', 'authorization', 
        'access_token', 'refresh_token', 'jwt', 'bearer'
    }
    
    sanitized = {}
    for key, value in data.items():
        if key.lower() in sensitive_keys:
            sanitized[key] = "***"
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict_for_logging(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_dict_for_logging(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            sanitized[key] = value
    
    return sanitized


def sanitize_user_data_for_logging(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize user data for logging, keeping only safe fields."""
    safe_fields = {'id', 'email', 'full_name', 'is_active', 'role', 'created_at'}
    
    return {
        key: value for key, value in user_data.items() 
        if key in safe_fields
    }
