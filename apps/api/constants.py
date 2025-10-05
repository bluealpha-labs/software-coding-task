"""
Application constants
"""

# Security constants
SECRET_KEY_MIN_LENGTH = 32
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ALGORITHM = "HS256"

# Database constants
DB_POOL_MIN_CONNECTIONS = 1
DB_POOL_MAX_CONNECTIONS = 20

# API constants
API_VERSION = "1.0.0"
API_TITLE = "MMM Dashboard API"

# CORS origins
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://localhost:3001"
]

# Password validation
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128

# Email validation
EMAIL_MAX_LENGTH = 255
FULL_NAME_MAX_LENGTH = 255
