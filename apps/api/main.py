from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from api.config import get_settings
from api.routers import auth, dashboard
from api.logging_config import setup_logging, get_logger
from api.constants import API_TITLE, API_VERSION, ALLOWED_ORIGINS
from api.services.migration_service import migration_service
import logging
import time

# Setup logging
setup_logging()
logger = get_logger(__name__)

settings = get_settings()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description="Marketing Mix Modeling Dashboard API with user authentication and analytics",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response

# Performance monitoring middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time, 4))
    
    # Log slow requests
    if process_time > 1.0:  # Log requests taking more than 1 second
        logger.warning(f"Slow request: {request.method} {request.url.path} took {process_time:.3f}s")
    
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)

@app.get("/health")
async def health():
    """Comprehensive health check endpoint."""
    from api.services.database_service import db_service
    from api.services.cache_service import cache_service
    
    health_status = {
        "status": "ok",
        "timestamp": time.time(),
        "services": {}
    }
    
    # Database health check
    try:
        db_health = db_service.get_health_status()
        health_status["services"]["database"] = db_health
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    # Cache health check
    try:
        cache_stats = cache_service.get_stats()
        health_status["services"]["cache"] = {
            "status": "healthy",
            "redis_connected": cache_stats.get("redis_connected", False),
            "hit_rate": cache_stats.get("hit_rate", 0)
        }
    except Exception as e:
        health_status["services"]["cache"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    # Overall status
    all_healthy = all(
        service.get("status") == "healthy" 
        for service in health_status["services"].values()
    )
    
    if not all_healthy:
        health_status["status"] = "degraded"
    
    return health_status

@app.get("/")
async def root():
    return {"message": API_TITLE, "version": API_VERSION}

# Startup event - run migrations
@app.on_event("startup")
async def startup_event():
    """Run database migrations on startup."""
    logger.info("Starting up MMM Dashboard API...")
    
    try:
        logger.info("Running database migrations...")
        migration_results = migration_service.run_migrations()
        
        if migration_results["applied"]:
            logger.info(f"Applied migrations: {migration_results['applied']}")
        
        if migration_results["skipped"]:
            logger.info(f"Skipped migrations: {migration_results['skipped']}")
        
        if migration_results["errors"]:
            logger.error(f"Migration errors: {migration_results['errors']}")
        else:
            logger.info("All migrations completed successfully")
            
    except Exception as e:
        logger.error(f"Failed to run migrations: {e}")
        # Don't fail startup for migration errors in development
        # In production, you might want to fail fast

# Shutdown event - cleanup resources
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown."""
    logger.info("Shutting down MMM Dashboard API...")
    
    try:
        # Close database connection pool
        from api.services.database_service import db_service
        db_service.close_pool()
        logger.info("Database connection pool closed")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")
