"""
Enhanced validation middleware for comprehensive input validation and error handling.
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from typing import Any, Dict, List, Optional
import re
import logging
from api.logging_config import get_logger

logger = get_logger(__name__)

class ValidationMiddleware:
    """Enhanced validation middleware for comprehensive input validation."""
    
    def __init__(self):
        self.email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        self.password_pattern = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')
        self.sanitization_patterns = [
            (r'<script.*?</script>', ''),  # Remove script tags
            (r'javascript:', ''),  # Remove javascript: protocols
            (r'on\w+\s*=', ''),  # Remove event handlers
        ]
    
    def sanitize_input(self, value: str) -> str:
        """Sanitize input to prevent XSS attacks."""
        if not isinstance(value, str):
            return value
        
        sanitized = value
        for pattern, replacement in self.sanitization_patterns:
            sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)
        
        return sanitized.strip()
    
    def validate_email(self, email: str) -> bool:
        """Validate email format and length."""
        if not email or len(email) > 255:
            return False
        return bool(self.email_pattern.match(email))
    
    def validate_password(self, password: str) -> Dict[str, Any]:
        """Validate password strength and return detailed feedback."""
        if not password:
            return {"valid": False, "errors": ["Password is required"]}
        
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        if len(password) > 128:
            errors.append("Password must be less than 128 characters")
        
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        if not re.search(r'[@$!%*?&]', password):
            errors.append("Password must contain at least one special character (@$!%*?&)")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
    
    def validate_request_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and sanitize request data."""
        validated_data = {}
        errors = []
        
        for key, value in data.items():
            if isinstance(value, str):
                # Sanitize string inputs
                sanitized_value = self.sanitize_input(value)
                
                # Validate specific fields
                if key == 'email':
                    if not self.validate_email(sanitized_value):
                        errors.append("Invalid email format")
                        continue
                
                elif key == 'password':
                    password_validation = self.validate_password(sanitized_value)
                    if not password_validation["valid"]:
                        errors.extend(password_validation["errors"])
                        continue
                
                elif key == 'full_name':
                    if len(sanitized_value) > 255:
                        errors.append("Full name must be less than 255 characters")
                        continue
                
                validated_data[key] = sanitized_value
            else:
                validated_data[key] = value
        
        return {
            "data": validated_data,
            "errors": errors
        }

# Global validation middleware instance
validation_middleware = ValidationMiddleware()

async def enhanced_validation_handler(request: Request, call_next):
    """Enhanced validation middleware handler."""
    try:
        # Skip validation for auth endpoints that use form data
        if request.url.path.startswith("/auth/token"):
            response = await call_next(request)
            return response
        
        # Get request body for validation
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
            if body:
                try:
                    import json
                    data = json.loads(body.decode())
                    
                    # Validate and sanitize data
                    validation_result = validation_middleware.validate_request_data(data)
                    
                    if validation_result["errors"]:
                        return JSONResponse(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            content={
                                "detail": "Validation failed",
                                "errors": validation_result["errors"],
                                "field_errors": validation_result["errors"]
                            }
                        )
                    
                    # Store validated data in request state for use in endpoints
                    request.state.validated_data = validation_result["data"]
                    
                except json.JSONDecodeError:
                    # Only return JSON error for non-auth endpoints
                    if not request.url.path.startswith("/auth/"):
                        return JSONResponse(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            content={"detail": "Invalid JSON format"}
                        )
        
        response = await call_next(request)
        return response
        
    except Exception as e:
        logger.error(f"Validation middleware error: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal validation error"}
        )

def create_validation_error_response(errors: List[str], field_errors: Optional[Dict[str, List[str]]] = None) -> JSONResponse:
    """Create standardized validation error response."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation failed",
            "errors": errors,
            "field_errors": field_errors or {}
        }
    )
