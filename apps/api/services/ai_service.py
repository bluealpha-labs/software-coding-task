"""
AI-powered insights service for marketing mix modeling data analysis.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from api.logging_config import get_logger
from api.services.data_service import data_service
from api.services.cache_service import cache_service, cache_key
from api.services.mock_ai_service import mock_ai_service
from api.config import get_settings
from api.constants import CACHE_TTL_DEFAULT

logger = get_logger(__name__)

class AIService:
    """AI service for generating insights from marketing data."""
    
    def __init__(self):
        self.insights_cache = {}
    
    def analyze_anomalies(self, data: Dict[str, Any]) -> List[str]:
        """Detect anomalies in marketing data."""
        anomalies = []
        
        if 'contribution_data' in data:
            contribution_data = data['contribution_data']
            channels = contribution_data.get('channels', [])
            spend = contribution_data.get('spend', [])
            contribution = contribution_data.get('contribution', [])
            
            if len(spend) > 0 and len(contribution) > 0:
                # Calculate ROI for each channel
                rois = []
                for i in range(len(channels)):
                    if spend[i] > 0:
                        roi = (contribution[i] - spend[i]) / spend[i] * 100
                        rois.append(roi)
                    else:
                        rois.append(0)
                
                # Detect negative ROI
                for i, roi in enumerate(rois):
                    if roi < -20:  # Very negative ROI
                        anomalies.append(f"🚨 {channels[i]} has extremely negative ROI ({roi:.1f}%) - consider reducing spend")
                    elif roi < 0:  # Negative ROI
                        anomalies.append(f"⚠️ {channels[i]} has negative ROI ({roi:.1f}%) - review strategy")
                
                # Detect spending outliers
                spend_array = np.array(spend)
                mean_spend = np.mean(spend_array)
                std_spend = np.std(spend_array)
                
                for i, channel_spend in enumerate(spend):
                    if channel_spend > mean_spend + 2 * std_spend:
                        anomalies.append(f"📊 {channels[i]} has unusually high spend (${channel_spend:,.0f}) compared to average")
        
        return anomalies
    
    def generate_recommendations(self, data: Dict[str, Any]) -> List[str]:
        """Generate AI-powered recommendations based on data analysis."""
        recommendations = []
        
        if 'summary_metrics' in data:
            metrics = data['summary_metrics']
            roi = metrics.get('roi', 0)
            total_spend = metrics.get('total_spend', 0)
            total_contribution = metrics.get('total_contribution', 0)
            
            # ROI-based recommendations
            if roi > 50:
                recommendations.append("🎯 Excellent ROI performance! Consider scaling successful channels")
            elif roi > 20:
                recommendations.append("📈 Good ROI performance. Focus on optimizing underperforming channels")
            elif roi > 0:
                recommendations.append("⚠️ Low ROI. Review channel allocation and consider rebalancing spend")
            else:
                recommendations.append("🚨 Negative ROI detected. Immediate strategy review required")
            
            # Spend efficiency recommendations
            if total_spend > 0:
                efficiency = total_contribution / total_spend
                if efficiency > 1.5:
                    recommendations.append("💡 High efficiency detected. Consider increasing budget for top performers")
                elif efficiency < 1.0:
                    recommendations.append("🔍 Low efficiency. Analyze channel performance and optimize allocation")
        
        if 'contribution_data' in data:
            contribution_data = data['contribution_data']
            channels = contribution_data.get('channels', [])
            spend = contribution_data.get('spend', [])
            contribution = contribution_data.get('contribution', [])
            
            if len(channels) > 0:
                # Find best and worst performing channels
                rois = []
                for i in range(len(channels)):
                    if spend[i] > 0:
                        roi = (contribution[i] - spend[i]) / spend[i] * 100
                        rois.append(roi)
                    else:
                        rois.append(0)
                
                if rois:
                    best_channel_idx = np.argmax(rois)
                    worst_channel_idx = np.argmin(rois)
                    
                    recommendations.append(f"🏆 {channels[best_channel_idx]} is your top performer (ROI: {rois[best_channel_idx]:.1f}%) - consider increasing investment")
                    
                    if rois[worst_channel_idx] < 0:
                        recommendations.append(f"📉 {channels[worst_channel_idx]} is underperforming (ROI: {rois[worst_channel_idx]:.1f}%) - consider reducing or pausing investment")
        
        return recommendations
    
    def analyze_trends(self, data: Dict[str, Any]) -> List[str]:
        """Analyze trends in the marketing data."""
        trends = []
        
        if 'response_curves' in data:
            response_curves = data['response_curves']
            curves = response_curves.get('curves', {})
            
            for channel, curve_data in curves.items():
                if len(curve_data) > 1:
                    # Calculate diminishing returns
                    responses = [point['response'] for point in curve_data]
                    spends = [point['spend'] for point in curve_data]
                    
                    if len(responses) > 2:
                        # Calculate efficiency trend
                        efficiencies = []
                        for i in range(1, len(responses)):
                            if spends[i] > spends[i-1]:
                                efficiency = (responses[i] - responses[i-1]) / (spends[i] - spends[i-1])
                                efficiencies.append(efficiency)
                        
                        if efficiencies:
                            avg_efficiency = np.mean(efficiencies)
                            if avg_efficiency < 0.5:
                                trends.append(f"📉 {channel} shows strong diminishing returns - consider optimizing spend level")
                            elif avg_efficiency > 1.5:
                                trends.append(f"📈 {channel} shows strong incremental returns - potential for increased investment")
        
        return trends
    
    def calculate_confidence_score(self, data: Dict[str, Any]) -> float:
        """Calculate confidence score for AI insights."""
        confidence_factors = []
        
        # Data completeness factor
        if 'summary_metrics' in data and 'contribution_data' in data and 'response_curves' in data:
            confidence_factors.append(0.3)  # All data available
        
        # Data quality factors
        if 'contribution_data' in data:
            contribution_data = data['contribution_data']
            channels = contribution_data.get('channels', [])
            spend = contribution_data.get('spend', [])
            
            if len(channels) >= 3:  # Multiple channels
                confidence_factors.append(0.2)
            
            if all(s > 0 for s in spend):  # All channels have spend
                confidence_factors.append(0.2)
        
        # Response curves availability
        if 'response_curves' in data:
            response_curves = data['response_curves']
            curves = response_curves.get('curves', {})
            if len(curves) >= 2:
                confidence_factors.append(0.3)
        
        return min(sum(confidence_factors), 1.0)
    
    def get_ai_insights(self) -> Dict[str, Any]:
        """Get comprehensive AI insights for the dashboard."""
        cache_key_str = cache_key("ai", "insights")
        
        # Try to get from cache first
        cached_insights = cache_service.get(cache_key_str)
        if cached_insights:
            logger.info("Returning AI insights from cache")
            return cached_insights
        
        # Check if we should use mock AI or real AI
        settings = get_settings()
        if settings.USE_MOCK_AI:
            logger.info("Using mock AI service for development")
            insights = mock_ai_service.get_ai_insights()
        else:
            logger.info("Using real AI analysis")
            # Use the real AI analysis (commented out below)
            insights = self._get_real_ai_insights()
        
        # Cache the insights for 10 minutes
        cache_service.set(cache_key_str, insights, ttl=600)
        
        logger.info(f"Generated AI insights with confidence score: {insights.get('confidence_score', 0):.2f}")
        return insights
    
    def _get_real_ai_insights(self) -> Dict[str, Any]:
        """Get real AI insights from actual data analysis."""
        # Gather all data (this will now use model data if available)
        summary_metrics = data_service.get_summary_metrics()
        contribution_data = data_service.get_contribution_data()
        response_curves = data_service.get_response_curves_data()
        
        data = {
            'summary_metrics': summary_metrics.dict(),
            'contribution_data': contribution_data.dict(),
            'response_curves': response_curves.dict()
        }
        
        # Generate insights
        anomalies = self.analyze_anomalies(data)
        recommendations = self.generate_recommendations(data)
        trends = self.analyze_trends(data)
        confidence_score = self.calculate_confidence_score(data)
        
        insights = {
            'recommendations': recommendations,
            'anomalies': anomalies,
            'trends': trends,
            'confidence_score': confidence_score,
            'generated_at': pd.Timestamp.now().isoformat()
        }
        
        logger.info(f"Generated real AI insights with confidence score: {confidence_score:.2f}")
        return insights

# Global AI service instance
ai_service = AIService()
