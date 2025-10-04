from pydantic import BaseModel
from typing import List, Dict, Any

class SummaryMetrics(BaseModel):
    total_spend: float
    total_contribution: float
    roi: float
    top_channel: str
    total_channels: int

class ContributionData(BaseModel):
    channels: List[str]
    spend: List[float]
    contribution: List[float]

class ResponseCurvesData(BaseModel):
    channels: List[str]
    curves: Dict[str, List[Dict[str, float]]]
