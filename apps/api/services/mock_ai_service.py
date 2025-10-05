"""
Mock AI service for development and testing.
Easy to swap out with real AI implementation later.
"""
import random
from typing import Dict, List, Any
from api.logging_config import get_logger

logger = get_logger(__name__)

class MockAIService:
    """Mock AI service that generates realistic-looking insights for development."""
    
    def __init__(self):
        self.mock_insights = {
            "recommendations": [
                "🎯 Excellent ROI performance! Consider scaling successful channels",
                "🏆 Social Media is your top performer (ROI: 45.2%) - consider increasing investment",
                "📈 Digital shows strong incremental returns - potential for increased investment",
                "💡 Consider reallocating budget from underperforming channels to top performers"
            ],
            "anomalies": [
                "⚠️ Print has negative ROI (-15.1%) - consider reducing or pausing investment",
                "📊 TV has unusually high spend ($75,000) compared to average",
                "🚨 Radio shows declining performance over the last quarter"
            ],
            "trends": [
                "📉 TV shows strong diminishing returns - consider optimizing spend level",
                "📈 Digital shows strong incremental returns - potential for increased investment",
                "📊 Social Media maintains consistent efficiency across spend levels"
            ],
            "confidence_score": 0.85
        }
    
    def get_ai_insights(self) -> Dict[str, Any]:
        """Generate mock AI insights for development."""
        logger.info("Generating mock AI insights for development")
        
        # Add some randomization to make it feel more dynamic
        insights = self.mock_insights.copy()
        
        # Randomly select a subset of recommendations
        if random.random() < 0.3:  # 30% chance to show fewer recommendations
            insights["recommendations"] = insights["recommendations"][:2]
        
        # Randomly select anomalies
        if random.random() < 0.5:  # 50% chance to show anomalies
            insights["anomalies"] = insights["anomalies"][:2]
        else:
            insights["anomalies"] = []
        
        # Always show trends
        insights["trends"] = insights["trends"][:2]
        
        # Vary confidence score slightly
        base_confidence = insights["confidence_score"]
        insights["confidence_score"] = max(0.6, min(0.95, base_confidence + random.uniform(-0.1, 0.1)))
        
        # Add timestamp
        insights["generated_at"] = "2024-01-15T10:30:00Z"
        
        return insights

# Global mock AI service instance
mock_ai_service = MockAIService()
