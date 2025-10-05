"""
AI-powered insights service for marketing mix modeling data analysis.
"""
import numpy as np
import pandas as pd
import hashlib
import json
from datetime import datetime
from typing import Dict, List, Any, Tuple
from api.logging_config import get_logger
from api.services.data_service import data_service
from api.services.cache_service import cache_service, cache_key
from api.services.mock_ai_service import mock_ai_service
from api.config import get_settings
from api.constants import CACHE_TTL_DEFAULT
from api.schemas import AIExplainRequest, AIExplainResponse

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
    
    def explain(self, request: AIExplainRequest) -> AIExplainResponse:
        """Generate AI explanation for a specific chart context"""
        # Create cache key based on request content
        request_hash = self._create_request_hash(request)
        cache_key_str = cache_key("ai", "explain", hash=request_hash)
        
        # Try to get from cache first
        cached_response = cache_service.get(cache_key_str)
        if cached_response:
            logger.info("Returning AI explanation from cache")
            return AIExplainResponse(**cached_response)
        
        # Generate explanation
        explanation = self._generate_explanation(request)
        
        # Cache the response for 30 minutes
        cache_service.set(cache_key_str, explanation.dict(), ttl=1800)
        
        logger.info(f"Generated AI explanation for {request.chart_type} chart")
        return explanation
    
    def _create_request_hash(self, request: AIExplainRequest) -> str:
        """Create a hash for request memoization"""
        # Create a deterministic hash of the request
        request_data = {
            "chart_type": request.chart_type,
            "metric": request.metric,
            "series_hash": hashlib.md5(json.dumps(request.series, sort_keys=True).encode()).hexdigest()[:8],
            "filters": request.filters or {},
            "date_range": request.date_range or {}
        }
        return hashlib.md5(json.dumps(request_data, sort_keys=True).encode()).hexdigest()[:16]
    
    def _generate_explanation(self, request: AIExplainRequest) -> AIExplainResponse:
        """Generate explanation based on chart context"""
        try:
            # Extract key statistics from the series data
            stats = self._extract_series_stats(request.series)
            
            # Generate context-aware explanation
            if request.chart_type == "contribution":
                return self._explain_contribution_chart(request, stats)
            elif request.chart_type == "response_curve":
                return self._explain_response_curve_chart(request, stats)
            else:
                return self._explain_generic_chart(request, stats)
                
        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            return self._create_fallback_explanation(request)
    
    def _extract_series_stats(self, series: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract statistical summary from series data"""
        if not series:
            return {}
        
        try:
            # Extract numeric values
            values = []
            for item in series:
                if isinstance(item, dict):
                    # Try different possible value keys
                    for key in ['value', 'response', 'contribution', 'spend']:
                        if key in item and isinstance(item[key], (int, float)):
                            values.append(item[key])
                            break
            
            if not values:
                return {}
            
            values_array = np.array(values)
            
            return {
                'count': len(values),
                'min': float(np.min(values_array)),
                'max': float(np.max(values_array)),
                'mean': float(np.mean(values_array)),
                'std': float(np.std(values_array)),
                'sum': float(np.sum(values_array)),
                'range': float(np.max(values_array) - np.min(values_array))
            }
        except Exception as e:
            logger.error(f"Error extracting series stats: {e}")
            return {}
    
    def _explain_contribution_chart(self, request: AIExplainRequest, stats: Dict[str, Any]) -> AIExplainResponse:
        """Generate explanation for contribution chart"""
        total_contribution = stats.get('sum', 0)
        max_contribution = stats.get('max', 0)
        min_contribution = stats.get('min', 0)
        
        # Find top and bottom performers
        series_data = request.series
        if series_data:
            sorted_series = sorted(series_data, key=lambda x: x.get('value', 0), reverse=True)
            top_performer = sorted_series[0] if sorted_series else {}
            bottom_performer = sorted_series[-1] if sorted_series else {}
        else:
            top_performer = {}
            bottom_performer = {}
        
        # Generate summary
        if total_contribution > 0:
            summary = f"Total contribution across all channels is ${total_contribution:,.0f}. "
            if max_contribution > min_contribution * 3:
                summary += f"The top performer ({top_performer.get('channel', 'Unknown')}) significantly outperforms others, suggesting potential for budget reallocation."
            else:
                summary += f"Channel performance is relatively balanced, with the top performer contributing ${max_contribution:,.0f}."
        else:
            summary = "Contribution data shows limited performance across channels, indicating potential optimization opportunities."
        
        # Generate drill-downs
        drilldowns = [
            "Analyze seasonal patterns in top performer",
            "Compare efficiency ratios (contribution/spend)",
            "Investigate underperforming channels"
        ]
        
        # Generate caveat
        caveat = "Analysis based on current data snapshot. Consider external factors like seasonality, market conditions, and campaign timing that may influence results."
        
        # Calculate confidence score
        confidence_score = min(0.9, 0.5 + (len(series_data) * 0.1))
        
        return AIExplainResponse(
            summary=summary,
            drilldowns=drilldowns,
            caveat=caveat,
            confidence_score=confidence_score,
            generated_at=datetime.now().isoformat()
        )
    
    def _explain_response_curve_chart(self, request: AIExplainRequest, stats: Dict[str, Any]) -> AIExplainResponse:
        """Generate explanation for response curve chart"""
        max_response = stats.get('max', 0)
        max_spend = max([point.get('spend', 0) for point in request.series], default=0)
        
        # Calculate efficiency metrics
        if max_spend > 0:
            efficiency = max_response / max_spend
        else:
            efficiency = 0
        
        # Generate summary
        if efficiency > 1.0:
            summary = f"Channel shows strong efficiency with {efficiency:.2f}x return on investment. "
            if efficiency > 1.5:
                summary += "The response curve suggests potential for increased investment before reaching saturation."
            else:
                summary += "Current spend levels appear optimal based on diminishing returns analysis."
        elif efficiency > 0.5:
            summary = f"Channel shows moderate efficiency ({efficiency:.2f}x ROI). "
            summary += "Consider optimizing spend allocation or improving targeting to enhance performance."
        else:
            summary = f"Channel shows low efficiency ({efficiency:.2f}x ROI). "
            summary += "Immediate review of strategy and potential budget reallocation recommended."
        
        # Generate drill-downs
        drilldowns = [
            "Identify optimal spend level for maximum ROI",
            "Analyze audience targeting effectiveness",
            "Compare with industry benchmarks"
        ]
        
        # Generate caveat
        caveat = "Response curves are based on historical data and may not account for market saturation, competitive responses, or external economic factors."
        
        # Calculate confidence score
        confidence_score = min(0.85, 0.6 + (len(request.series) * 0.05))
        
        return AIExplainResponse(
            summary=summary,
            drilldowns=drilldowns,
            caveat=caveat,
            confidence_score=confidence_score,
            generated_at=datetime.now().isoformat()
        )
    
    def _explain_generic_chart(self, request: AIExplainRequest, stats: Dict[str, Any]) -> AIExplainResponse:
        """Generate explanation for generic chart types"""
        mean_value = stats.get('mean', 0)
        std_value = stats.get('std', 0)
        
        # Generate summary
        if std_value > 0:
            cv = std_value / mean_value if mean_value > 0 else 0
            if cv > 0.5:
                summary = f"Data shows high variability (CV: {cv:.2f}), indicating significant performance differences across data points."
            else:
                summary = f"Data shows relatively consistent performance with mean value of ${mean_value:,.0f}."
        else:
            summary = f"Analysis shows consistent values around ${mean_value:,.0f}."
        
        # Generate drill-downs
        drilldowns = [
            "Investigate outliers and anomalies",
            "Analyze temporal trends",
            "Compare with historical benchmarks"
        ]
        
        # Generate caveat
        caveat = "Analysis is based on current data and may not reflect future performance or account for external market factors."
        
        # Calculate confidence score
        confidence_score = 0.7
        
        return AIExplainResponse(
            summary=summary,
            drilldowns=drilldowns,
            caveat=caveat,
            confidence_score=confidence_score,
            generated_at=datetime.now().isoformat()
        )
    
    def _create_fallback_explanation(self, request: AIExplainRequest) -> AIExplainResponse:
        """Create fallback explanation when analysis fails"""
        return AIExplainResponse(
            summary=f"Analysis of {request.chart_type} chart shows data patterns that require further investigation. The {request.metric} metric displays varying performance across the analyzed period.",
            drilldowns=[
                "Review data quality and completeness",
                "Analyze temporal patterns",
                "Compare with industry benchmarks"
            ],
            caveat="Analysis may be limited by data availability or quality. Consider additional data sources for more comprehensive insights.",
            confidence_score=0.3
        )

# Global AI service instance
ai_service = AIService()
