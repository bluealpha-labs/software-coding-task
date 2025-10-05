"""
Pydantic schemas for MMM API endpoints

This module defines the request and response schemas for the MMM dashboard API,
including contribution data, response curves, and AI explanation endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Contribution Data Schemas
class ContributionPoint(BaseModel):
    """Single contribution data point"""
    channel: str
    value: float
    period: Optional[str] = None

class ContributionsResponse(BaseModel):
    """Response for contribution data endpoint"""
    contributions: List[ContributionPoint]
    total_contribution: float
    total_spend: float
    roi: float
    metadata: Optional[Dict[str, Any]] = None

# Response Curve Schemas
class ResponseCurvePoint(BaseModel):
    """Single point on a response curve"""
    spend: float
    response: float

class ResponseCurveMetadata(BaseModel):
    """Metadata for response curve"""
    elasticity: Optional[float] = None
    roi: Optional[float] = None
    saturation_point: Optional[float] = None
    source: Optional[str] = None

class ResponseCurveResponse(BaseModel):
    """Response for response curve endpoint"""
    channel: str
    points: List[ResponseCurvePoint]
    saturation_points: Optional[List[ResponseCurvePoint]] = None
    metadata: Optional[ResponseCurveMetadata] = None

# AI Explanation Schemas
class AIExplainRequest(BaseModel):
    """Request schema for AI explanation endpoint"""
    chart_type: str = Field(..., description="Type of chart being explained")
    metric: str = Field(..., description="Primary metric being analyzed")
    series: List[Dict[str, Any]] = Field(..., description="Data series for the chart")
    filters: Optional[Dict[str, Any]] = Field(None, description="Applied filters")
    date_range: Optional[Dict[str, str]] = Field(None, description="Date range for analysis")
    stats: Optional[Dict[str, Any]] = Field(None, description="Statistical summary")

class AIExplainResponse(BaseModel):
    """Response schema for AI explanation endpoint"""
    summary: str = Field(..., description="2-3 sentence summary of the data")
    drilldowns: List[str] = Field(..., description="Suggested drill-down actions")
    caveat: str = Field(..., description="Important caveat or limitation")
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence in the explanation")
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="ISO timestamp of generation")

# Health Check Schema
class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: float
    services: Dict[str, Any]
    model_loaded: bool = False
    model_info: Optional[Dict[str, Any]] = None
