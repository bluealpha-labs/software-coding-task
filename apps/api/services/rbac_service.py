from typing import Dict, Optional
from functools import wraps
from api.models.user import UserRole

class RBACService:
    """Role-Based Access Control service."""
    
    def __init__(self):
        # In-memory role storage (in production, this would be in database)
        self.user_roles: Dict[str, UserRole] = {
            "admin@example.com": UserRole.ADMIN,
            "test@example.com": UserRole.USER,
        }
        
        # Permission matrix
        self.permissions = {
            UserRole.USER: {
                "dashboard:read",
                "profile:read",
                "profile:update"
            },
            UserRole.ADMIN: {
                "dashboard:read",
                "profile:read", 
                "profile:update",
                "admin:manage",
                "users:manage",
                "system:admin"
            }
        }
    
    def get_user_role(self, email: str) -> UserRole:
        """Get user role by email."""
        return self.user_roles.get(email, UserRole.USER)
    
    def assign_role(self, email: str, role: UserRole) -> None:
        """Assign role to user."""
        self.user_roles[email] = role
    
    def check_access(self, email: str, permission: str) -> bool:
        """Check if user has permission."""
        user_role = self.get_user_role(email)
        user_permissions = self.permissions.get(user_role, set())
        return permission in user_permissions
    
    def get_user_permissions(self, email: str) -> set:
        """Get all permissions for a user."""
        user_role = self.get_user_role(email)
        return self.permissions.get(user_role, set())

# Global RBAC instance
rbac_service = RBACService()

def require_role(required_role: UserRole):
    """Decorator to require specific role for endpoint access."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current user from kwargs (should be injected by FastAPI)
            current_user = kwargs.get('current_user')
            if not current_user:
                from fastapi import HTTPException, status
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            # Check user role
            user_role = rbac_service.get_user_role(current_user.email)
            if user_role != required_role and required_role != UserRole.USER:
                from fastapi import HTTPException, status
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def check_permission(permission: str):
    """Decorator to check specific permission."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # In a real implementation, this would check the current user's permissions
            # from the request context
            return await func(*args, **kwargs)
        return wrapper
    return decorator
