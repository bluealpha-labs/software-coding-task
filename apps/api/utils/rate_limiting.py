"""Rate limiting utilities for user-based and IP-based limiting."""

from fastapi import Request
from api.models.user import User
from api.routers.auth import get_current_user
from api.logging_config import get_logger
from typing import Optional

logger = get_logger(__name__)


def get_user_rate_limit_key(request: Request, user: Optional[User] = None) -> str:
    """Get rate limiting key for user-based limiting."""
    if user:
        return f"user:{user.id}"
    else:
        # Fall back to IP-based limiting for unauthenticated requests
        client_ip = getattr(request.client, 'host', 'unknown')
        return f"ip:{client_ip}"


def get_ip_rate_limit_key(request: Request) -> str:
    """Get rate limiting key for IP-based limiting."""
    client_ip = getattr(request.client, 'host', 'unknown')
    return f"ip:{client_ip}"


def get_authenticated_user_rate_limit_key(request: Request) -> str:
    """Get rate limiting key for authenticated user requests."""
    try:
        # Try to get current user from request
        # This is a simplified approach - in production, you'd want to
        # extract the user from the JWT token without full authentication
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            # Extract user ID from token (simplified)
            token = auth_header.split(" ")[1]
            # In a real implementation, you'd decode the JWT to get user info
            # For now, we'll use a hash of the token as a proxy
            import hashlib
            user_hash = hashlib.md5(token.encode()).hexdigest()[:8]
            return f"user_token:{user_hash}"
    except Exception as e:
        logger.warning(f"Error extracting user for rate limiting: {e}")
    
    # Fall back to IP-based limiting
    return get_ip_rate_limit_key(request)
