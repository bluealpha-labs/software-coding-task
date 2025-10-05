"""Application constants."""

# API Configuration
API_TITLE = "MMM Dashboard API"
API_VERSION = "1.0.0"

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3002"
]

# Rate Limiting
RATE_LIMIT_PER_MINUTE = 60
RATE_LIMIT_BURST = 10

# Cache Configuration
CACHE_TTL_DEFAULT = 300  # 5 minutes
CACHE_TTL_SHORT = 60    # 1 minute
CACHE_TTL_LONG = 3600   # 1 hour
CACHE_MAX_SIZE = 1000   # Maximum items in memory cache

# Database Pool Configuration
DB_POOL_MIN_CONNECTIONS = 1
DB_POOL_MAX_CONNECTIONS = 10

# Security Configuration
SECRET_KEY_MIN_LENGTH = 32
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ALGORITHM = "HS256"

# Feature Flags
FEATURE_FLAGS = {
    "ENABLE_CACHING": True,
    "ENABLE_RATE_LIMITING": True,
    "ENABLE_AUDIT_LOGGING": True,
    "ENABLE_RBAC": True
}