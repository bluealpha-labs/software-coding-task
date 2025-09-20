from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from api.config import get_settings
from api.database import get_db, engine
from api.auth import (
    UserRegister, UserLogin, UserResponse, Token,
    create_tokens, verify_token, TokenData
)
from api.user_service import UserService
from api.models import Base
from api.mmm_service import (
    MMModelService, ContributionData, ResponseCurveData,
    ChannelTimeSeries, ChannelMetrics, MMModelSummary,
    GeoPerformance, GeoComparison, ReachFrequencyAnalysis, GeoReachFrequency
)

settings = get_settings()
app = FastAPI(title="BlueAlpha API", version="1.0.0")

# Initialize MMM service
mmm_service = MMModelService()


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup."""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        raise e

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()


# Dependency to get current user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Get the current authenticated user."""
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = UserService.get_user_by_id(db, token_data.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return UserResponse.model_validate(user)


# Health check
@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


# Authentication endpoints
@app.post("/api/v1/auth/register", response_model=Token)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = UserService.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    user = UserService.create_user(db, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create user"
        )

    # Create tokens
    tokens = create_tokens(user.id, user.email)
    return tokens


@app.post("/api/v1/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return tokens."""
    user = UserService.authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    tokens = create_tokens(user.id, user.email)
    return tokens


@app.post("/api/v1/auth/refresh", response_model=Token)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    token_data = verify_token(credentials.credentials, token_type="refresh")
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user = UserService.get_user_by_id(db, token_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    tokens = create_tokens(user.id, user.email)
    return tokens


@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """Get current user information."""
    return current_user


# MMM Dashboard endpoints (protected)
@app.get("/api/v1/dashboard/summary", response_model=MMModelSummary)
async def get_dashboard_summary(current_user: UserResponse = Depends(get_current_user)):
    """Get MMM model summary for dashboard overview."""
    try:
        return mmm_service.get_model_summary()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model summary: {str(e)}"
        )


@app.get("/api/v1/dashboard/contribution", response_model=List[ContributionData])
async def get_contribution_data(current_user: UserResponse = Depends(get_current_user)):
    """Get channel contribution data for contribution charts."""
    try:
        return mmm_service.get_contribution_data()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get contribution data: {str(e)}"
        )


@app.get("/api/v1/dashboard/response-curves", response_model=List[ResponseCurveData])
async def get_response_curves(current_user: UserResponse = Depends(get_current_user)):
    """Get response curve data for all channels."""
    try:
        return mmm_service.get_response_curves()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get response curves: {str(e)}"
        )


@app.get("/api/v1/dashboard/response-curves/{channel}", response_model=ResponseCurveData)
async def get_response_curve_by_channel(
    channel: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get response curve data for a specific channel."""
    try:
        curve_data = mmm_service.get_response_curve_for_channel(channel)
        if curve_data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Channel '{channel}' not found"
            )
        return curve_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get response curve for channel: {str(e)}"
        )


@app.get("/api/v1/dashboard/time-series", response_model=List[ChannelTimeSeries])
async def get_time_series_data(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get time series spend data for all channels with optional date filtering."""
    try:
        return mmm_service.get_time_series_data(start_date=start_date, end_date=end_date)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get time series data: {str(e)}"
        )


@app.get("/api/v1/dashboard/metrics", response_model=List[ChannelMetrics])
async def get_channel_metrics(current_user: UserResponse = Depends(get_current_user)):
    """Get comprehensive channel performance metrics."""
    try:
        return mmm_service.get_channel_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get channel metrics: {str(e)}"
        )


@app.get("/api/v1/dashboard/channels", response_model=List[str])
async def get_channels(current_user: UserResponse = Depends(get_current_user)):
    """Get list of all marketing channels."""
    try:
        return mmm_service.get_channels()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get channels: {str(e)}"
        )


# Geographic Analysis Endpoints

@app.get("/api/v1/dashboard/geo/performance", response_model=List[GeoPerformance])
async def get_geo_performance(current_user: UserResponse = Depends(get_current_user)):
    """Get performance data for all geographies."""
    try:
        return mmm_service.get_geo_performance()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get geo performance: {str(e)}"
        )


@app.get("/api/v1/dashboard/geo/comparison", response_model=GeoComparison)
async def get_geo_comparison(current_user: UserResponse = Depends(get_current_user)):
    """Get geographic comparison with top/bottom performers and insights."""
    try:
        return mmm_service.get_geo_comparison()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get geo comparison: {str(e)}"
        )


# Reach/Frequency Analysis Endpoints

@app.get("/api/v1/dashboard/reach-frequency/analysis", response_model=ReachFrequencyAnalysis)
async def get_reach_frequency_analysis(current_user: UserResponse = Depends(get_current_user)):
    """Get reach/frequency analysis for Channel3."""
    try:
        return mmm_service.get_reach_frequency_analysis()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get reach/frequency analysis: {str(e)}"
        )


@app.get("/api/v1/dashboard/reach-frequency/geo", response_model=List[GeoReachFrequency])
async def get_geo_reach_frequency(current_user: UserResponse = Depends(get_current_user)):
    """Get reach/frequency performance by geography."""
    try:
        return mmm_service.get_geo_reach_frequency()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get geo reach/frequency: {str(e)}"
        )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "BlueAlpha API", "version": "1.0.0"}
