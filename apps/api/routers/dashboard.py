from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from api.models.dashboard import SummaryMetrics, ContributionData, ResponseCurvesData
from api.models.user import User
from api.routers.auth import get_current_user
from api.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["dashboard"])

# Initialize rate limiter for dashboard endpoints
limiter = Limiter(key_func=get_remote_address)

@router.get("/summary-metrics", response_model=SummaryMetrics, summary="Get summary metrics", description="Get overall marketing performance metrics including total spend, contribution, and ROI")
@limiter.limit("30/minute")
async def get_summary_metrics(request: Request, current_user: User = Depends(get_current_user)):
    return data_service.get_summary_metrics()

@router.get("/contribution-data", response_model=ContributionData, summary="Get contribution data", description="Get channel performance data for spend vs contribution analysis")
@limiter.limit("30/minute")
async def get_contribution_data(request: Request, current_user: User = Depends(get_current_user)):
    return data_service.get_contribution_data()

@router.get("/response-curves", response_model=ResponseCurvesData, summary="Get response curves", description="Get marketing channel response curves showing diminishing returns analysis")
@limiter.limit("30/minute")
async def get_response_curves_data(request: Request, current_user: User = Depends(get_current_user)):
    return data_service.get_response_curves_data()
