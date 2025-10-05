"""
Development MMM endpoints without authentication

This router provides MMM endpoints for development and testing without authentication.
"""

from fastapi import APIRouter, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from api.services.ai_service import ai_service
from api.services.cache_service import cache_service, cache_key
from api.meridian_adapter import get_model_adapter, load_model
from api.schemas import (
    ContributionsResponse, 
    ResponseCurveResponse, 
    AIExplainRequest, 
    AIExplainResponse,
    HealthResponse
)
from api.constants import CACHE_TTL_DEFAULT
from api.logging_config import get_logger
import time
import os

logger = get_logger(__name__)

router = APIRouter(prefix="/api/mmm-dev", tags=["mmm-dev"])

# Initialize rate limiter for MMM endpoints
limiter = Limiter(key_func=get_remote_address)

@router.get("/contributions", response_model=ContributionsResponse, summary="Get channel contributions (dev)", description="Get channel contribution data from the Meridian model - development version")
@limiter.limit("30/minute")
async def get_contributions(
    request: Request, 
    window: str = "total",
    group_by: str = "channel"
):
    """Get channel contributions from the Meridian model - development version"""
    start_time = time.time()
    
    # Create cache key
    cache_key_str = cache_key("mmm", "contributions", window=window, group_by=group_by, user_id="dev")
    
    # Try to get from cache first
    cached_data = cache_service.get(cache_key_str)
    if cached_data:
        logger.info("Returning contributions from cache")
        return ContributionsResponse(**cached_data)
    
    # Get model adapter
    model_adapter = get_model_adapter()
    if not model_adapter:
        # Try to load model if not already loaded
        model_path = os.path.join(os.path.dirname(__file__), 'saved_mmm.pkl')
        if not os.path.exists(model_path):
            model_path = os.path.join(os.path.dirname(__file__), '../../saved_mmm.pkl')
        if not os.path.exists(model_path):
            model_path = 'saved_mmm.pkl'  # Try current directory
        
        if os.path.exists(model_path):
            model_adapter = load_model(model_path)
        else:
            raise HTTPException(status_code=404, detail="Meridian model not found")
    
    # Get contributions from model
    contributions = model_adapter.get_contributions(window=window)
    
    if not contributions:
        raise HTTPException(status_code=404, detail="No contribution data available")
    
    # Calculate totals
    total_contribution = sum(c.value for c in contributions)
    total_spend = sum(c.value * 1.25 for c in contributions)  # Estimate spend from contribution
    roi = ((total_contribution - total_spend) / total_spend * 100) if total_spend > 0 else 0
    
    # Create response
    response_data = {
        "contributions": [{"channel": c.channel, "value": c.value, "period": c.period} for c in contributions],
        "total_contribution": total_contribution,
        "total_spend": total_spend,
        "roi": roi,
        "metadata": {
            "window": window,
            "group_by": group_by,
            "source": "meridian_model"
        }
    }
    
    # Cache the response
    cache_service.set(cache_key_str, response_data, ttl=CACHE_TTL_DEFAULT)
    
    # Log performance
    duration = time.time() - start_time
    logger.info(f"Contributions request completed in {duration:.3f}s for dev user")
    
    return ContributionsResponse(**response_data)

@router.get("/response-curves/{channel}", response_model=ResponseCurveResponse, summary="Get response curve (dev)", description="Get response curve data for a specific channel - development version")
@limiter.limit("30/minute")
async def get_response_curve(
    request: Request,
    channel: str
):
    """Get response curve for a specific channel - development version"""
    start_time = time.time()
    
    # Create cache key
    cache_key_str = cache_key("mmm", "response_curve", channel=channel, user_id="dev")
    
    # Try to get from cache first
    cached_data = cache_service.get(cache_key_str)
    if cached_data:
        logger.info(f"Returning response curve for {channel} from cache")
        return ResponseCurveResponse(**cached_data)
    
    # Get model adapter
    model_adapter = get_model_adapter()
    if not model_adapter:
        # Try to load model if not already loaded
        model_path = os.path.join(os.path.dirname(__file__), 'saved_mmm.pkl')
        if not os.path.exists(model_path):
            model_path = os.path.join(os.path.dirname(__file__), '../../saved_mmm.pkl')
        if not os.path.exists(model_path):
            model_path = 'saved_mmm.pkl'  # Try current directory
        
        if os.path.exists(model_path):
            model_adapter = load_model(model_path)
        else:
            raise HTTPException(status_code=404, detail="Meridian model not found")
    
    # Get response curve from model
    response_curve = model_adapter.get_response_curve(channel)
    
    if not response_curve or not response_curve.points:
        raise HTTPException(status_code=404, detail=f"No response curve data available for channel: {channel}")
    
    # Calculate metadata
    points = response_curve.points
    if points:
        max_response = max(p.response for p in points)
        max_spend = max(p.spend for p in points)
        efficiency = max_response / max_spend if max_spend > 0 else 0
        
        # Find saturation point (90% of max response)
        saturation_threshold = max_response * 0.9
        saturation_points = [p for p in points if p.response >= saturation_threshold]
        saturation_point = saturation_points[0] if saturation_points else None
    else:
        efficiency = 0
        saturation_point = None
    
    # Create response
    response_data = {
        "channel": response_curve.channel,
        "points": [{"spend": p.spend, "response": p.response} for p in response_curve.points],
        "saturation_points": [{"spend": p.spend, "response": p.response} for p in response_curve.saturation_points] if response_curve.saturation_points else None,
        "metadata": {
            "elasticity": efficiency,
            "roi": efficiency,
            "saturation_point": saturation_point.spend if saturation_point else None,
            "source": response_curve.metadata.get('source', 'model') if response_curve.metadata else 'model'
        }
    }
    
    # Cache the response
    cache_service.set(cache_key_str, response_data, ttl=CACHE_TTL_DEFAULT)
    
    # Log performance
    duration = time.time() - start_time
    logger.info(f"Response curve request for {channel} completed in {duration:.3f}s for dev user")
    
    return ResponseCurveResponse(**response_data)

@router.post("/ai/explain", response_model=AIExplainResponse, summary="Get AI explanation (dev)", description="Get AI-powered explanation for a chart context - development version")
@limiter.limit("20/minute")
async def explain_chart(
    request: Request,
    explain_request: AIExplainRequest
):
    """Get AI explanation for a chart context - development version"""
    start_time = time.time()
    
    try:
        # Generate explanation using AI service
        explanation = ai_service.explain(explain_request)
        
        # Log performance
        duration = time.time() - start_time
        logger.info(f"AI explanation request completed in {duration:.3f}s for dev user")
        
        return explanation
        
    except Exception as e:
        logger.error(f"Error generating AI explanation: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI explanation")

@router.get("/ai-insights", summary="Get AI insights (dev)", description="Get AI-powered insights and recommendations - development version")
@limiter.limit("20/minute")
async def get_ai_insights(request: Request):
    """Get AI insights for the dashboard - development version"""
    start_time = time.time()
    
    try:
        # Generate AI insights using AI service
        insights = ai_service.get_ai_insights()
        
        # Log performance
        duration = time.time() - start_time
        logger.info(f"AI insights request completed in {duration:.3f}s for dev user")
        
        return insights
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI insights")

@router.get("/data-source", summary="Get data source info (dev)", description="Get information about data source - development version")
@limiter.limit("10/minute")
async def get_data_source_info(request: Request):
    """Get data source information - development version"""
    try:
        # Get model adapter
        model_adapter = get_model_adapter()
        if model_adapter and model_adapter.model:
            return {
                "using_model": True,
                "using_mock_data": False,
                "model_loaded": True,
                "data_source": "model"
            }
        else:
            return {
                "using_model": False,
                "using_mock_data": True,
                "model_loaded": False,
                "data_source": "mock"
            }
    except Exception as e:
        logger.error(f"Error getting data source info: {e}")
        return {
            "using_model": False,
            "using_mock_data": True,
            "model_loaded": False,
            "data_source": "mock"
        }

@router.get("/health", response_model=HealthResponse, summary="MMM health check (dev)", description="Check health of MMM model and services - development version")
@limiter.limit("10/minute")
async def mmm_health_check(request: Request):
    """Health check for MMM services - development version"""
    health_status = {
        "status": "ok",
        "timestamp": time.time(),
        "services": {},
        "model_loaded": False,
        "model_info": None
    }
    
    # Check model status
    model_adapter = get_model_adapter()
    if model_adapter:
        health_status["model_loaded"] = True
        health_status["model_info"] = model_adapter.get_model_info()
        health_status["services"]["model"] = {
            "status": "healthy",
            "channels": len(model_adapter.channels),
            "model_type": type(model_adapter.model).__name__ if model_adapter.model else "Unknown"
        }
    else:
        health_status["services"]["model"] = {
            "status": "unhealthy",
            "error": "Model not loaded"
        }
    
    # Check AI service
    try:
        # Simple test of AI service
        test_request = AIExplainRequest(
            chart_type="test",
            metric="test",
            series=[{"value": 100}]
        )
        ai_service.explain(test_request)
        health_status["services"]["ai"] = {"status": "healthy"}
    except Exception as e:
        health_status["services"]["ai"] = {
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
    
    return HealthResponse(**health_status)
