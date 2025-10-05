from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from api.models.dashboard import SummaryMetrics, ContributionData, ResponseCurvesData
from api.models.user import User
from api.routers.auth import get_current_user
from api.services.data_service import data_service
from api.services.ai_service import ai_service
from api.services.cache_service import cache_service, cache_key
from api.constants import CACHE_TTL_DEFAULT
from api.logging_config import get_logger
from api.utils.rate_limiting import get_authenticated_user_rate_limit_key
import time

logger = get_logger(__name__)

router = APIRouter(prefix="/api", tags=["dashboard"])

# Initialize rate limiter for dashboard endpoints with user-based limiting
limiter = Limiter(key_func=get_authenticated_user_rate_limit_key)

@router.get("/summary-metrics", response_model=SummaryMetrics, summary="Get summary metrics", description="Get overall marketing performance metrics including total spend, contribution, and ROI")
@limiter.limit("30/minute")
async def get_summary_metrics(request: Request, current_user: User = Depends(get_current_user)):
    start_time = time.time()
    cache_key_str = cache_key("dashboard", "summary", user_id=current_user.id)
    result = await cache_service.cached_call(
        cache_key_str,
        data_service.get_summary_metrics,
        ttl=CACHE_TTL_DEFAULT
    )
    
    # Log performance metrics
    duration = time.time() - start_time
    logger.info(f"Summary metrics request completed in {duration:.3f}s for user {current_user.email}")
    
    return result

@router.get("/contribution-data", response_model=ContributionData, summary="Get contribution data", description="Get channel performance data for spend vs contribution analysis")
@limiter.limit("30/minute")
async def get_contribution_data(request: Request, current_user: User = Depends(get_current_user)):
    cache_key_str = cache_key("dashboard", "contribution", user_id=current_user.id)
    return await cache_service.cached_call(
        cache_key_str,
        data_service.get_contribution_data,
        ttl=CACHE_TTL_DEFAULT
    )

@router.get("/response-curves", response_model=ResponseCurvesData, summary="Get response curves", description="Get marketing channel response curves showing diminishing returns analysis")
@limiter.limit("30/minute")
async def get_response_curves_data(request: Request, current_user: User = Depends(get_current_user)):
    cache_key_str = cache_key("dashboard", "response_curves", user_id=current_user.id)
    return await cache_service.cached_call(
        cache_key_str,
        data_service.get_response_curves_data,
        ttl=CACHE_TTL_DEFAULT
    )

@router.get("/ai-insights", summary="Get AI insights", description="Get AI-powered insights and recommendations for marketing data")
@limiter.limit("20/minute")
async def get_ai_insights(request: Request, current_user: User = Depends(get_current_user)):
    start_time = time.time()
    cache_key_str = cache_key("ai", "insights", user_id=current_user.id)
    result = await cache_service.cached_call(
        cache_key_str,
        ai_service.get_ai_insights,
        ttl=CACHE_TTL_DEFAULT
    )
    
    # Log performance metrics
    duration = time.time() - start_time
    logger.info(f"AI insights request completed in {duration:.3f}s for user {current_user.email}")
    
    return result

@router.get("/data-source", summary="Get data source info", description="Get information about whether model or mock data is being used")
@limiter.limit("10/minute")
async def get_data_source_info(request: Request, current_user: User = Depends(get_current_user)):
    return data_service.get_data_source_info()

@router.get("/cache-stats", summary="Get cache statistics", description="Get cache performance statistics")
@limiter.limit("10/minute")
async def get_cache_stats(request: Request, current_user: User = Depends(get_current_user)):
    return cache_service.get_stats()
