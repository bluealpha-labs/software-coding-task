from fastapi import APIRouter, Depends
from api.models.dashboard import SummaryMetrics, ContributionData, ResponseCurvesData
from api.models.user import User
from api.routers.auth import get_current_user
from api.services.data_service import data_service

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/summary-metrics", response_model=SummaryMetrics)
async def get_summary_metrics(current_user: User = Depends(get_current_user)):
    return data_service.get_summary_metrics()

@router.get("/contribution-data", response_model=ContributionData)
async def get_contribution_data(current_user: User = Depends(get_current_user)):
    return data_service.get_contribution_data()

@router.get("/response-curves", response_model=ResponseCurvesData)
async def get_response_curves_data(current_user: User = Depends(get_current_user)):
    return data_service.get_response_curves_data()
