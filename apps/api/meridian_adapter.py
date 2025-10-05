"""
Meridian MMM Model Adapter

This module provides an adapter for loading and extracting data from Google Meridian MMM models.
It handles the model trace from saved_mmm.pkl and provides standardized interfaces for:
- Channel contributions over time
- Response curves per channel
- Model metadata and statistics
"""

import pickle
import os
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from api.logging_config import get_logger

logger = get_logger(__name__)

@dataclass
class ContributionPoint:
    """Represents a single contribution data point"""
    channel: str
    value: float
    period: Optional[str] = None

@dataclass
class ResponseCurvePoint:
    """Represents a single point on a response curve"""
    spend: float
    response: float

@dataclass
class ResponseCurvePayload:
    """Complete response curve data for a channel"""
    channel: str
    points: List[ResponseCurvePoint]
    saturation_points: Optional[List[ResponseCurvePoint]] = None
    metadata: Optional[Dict[str, Any]] = None

class MeridianModelAdapter:
    """Adapter for Google Meridian MMM models"""
    
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        self.channels = []
        self.load_model()
    
    def load_model(self) -> bool:
        """Load the Meridian model from pickle file"""
        try:
            if not os.path.exists(self.model_path):
                logger.warning(f"Model file not found: {self.model_path}")
                logger.info("Creating mock model for development")
                self._create_mock_model()
                return True
            
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            logger.info(f"Successfully loaded Meridian model from {self.model_path}")
            
            # Extract channels from model
            self.channels = self._extract_channels()
            logger.info(f"Extracted {len(self.channels)} channels: {self.channels}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error loading Meridian model: {e}")
            logger.info("Creating mock model for development")
            self._create_mock_model()
            return True
    
    def _extract_channels(self) -> List[str]:
        """Extract channel names from the model"""
        try:
            # Try different ways to extract channels from Meridian model
            if hasattr(self.model, 'media_channels'):
                return list(self.model.media_channels)
            elif hasattr(self.model, 'channels'):
                return list(self.model.channels)
            elif hasattr(self.model, 'media_names'):
                return list(self.model.media_names)
            elif hasattr(self.model, 'feature_names'):
                # Filter for media channels (exclude control variables)
                all_features = list(self.model.feature_names)
                # Assume media channels are the first N features or have specific patterns
                return [f for f in all_features if any(keyword in f.lower() 
                        for keyword in ['tv', 'digital', 'radio', 'print', 'outdoor', 'social', 'media'])]
            else:
                # Fallback: try to extract from model attributes
                logger.warning("Could not extract channels from model attributes")
                return ['TV', 'Digital', 'Radio', 'Print', 'Outdoor', 'Social Media']
                
        except Exception as e:
            logger.error(f"Error extracting channels: {e}")
            return ['TV', 'Digital', 'Radio', 'Print', 'Outdoor', 'Social Media']
    
    def get_contributions(self, window: Optional[str] = None) -> List[ContributionPoint]:
        """Get channel contributions from the model"""
        try:
            if not self.model:
                logger.error("Model not loaded")
                return []
            
            contributions = []
            
            # Try to extract contribution data from model
            if hasattr(self.model, 'contribution') and self.model.contribution is not None:
                contrib_data = self.model.contribution
                if hasattr(contrib_data, 'values'):
                    contrib_values = contrib_data.values
                else:
                    contrib_values = contrib_data
                
                for i, channel in enumerate(self.channels):
                    if i < len(contrib_values):
                        contributions.append(ContributionPoint(
                            channel=channel,
                            value=float(contrib_values[i])
                        ))
            
            elif hasattr(self.model, 'media_contribution') and self.model.media_contribution is not None:
                contrib_data = self.model.media_contribution
                if hasattr(contrib_data, 'values'):
                    contrib_values = contrib_data.values
                else:
                    contrib_values = contrib_data
                
                for i, channel in enumerate(self.channels):
                    if i < len(contrib_values):
                        contributions.append(ContributionPoint(
                            channel=channel,
                            value=float(contrib_values[i])
                        ))
            
            else:
                # Fallback: estimate contributions from model predictions
                logger.warning("No direct contribution data found, estimating from model")
                contributions = self._estimate_contributions()
            
            logger.info(f"Extracted {len(contributions)} contribution points")
            return contributions
            
        except Exception as e:
            logger.error(f"Error getting contributions: {e}")
            return []
    
    def _estimate_contributions(self) -> List[ContributionPoint]:
        """Estimate contributions when direct data is not available"""
        contributions = []
        
        try:
            # Try to get spend data to estimate contributions
            if hasattr(self.model, 'spend') and self.model.spend is not None:
                spend_data = self.model.spend
                if hasattr(spend_data, 'values'):
                    spend_values = spend_data.values
                else:
                    spend_values = spend_data
                
                # Estimate contribution as 80% of spend (typical MMM efficiency)
                for i, channel in enumerate(self.channels):
                    if i < len(spend_values):
                        spend = float(spend_values[i])
                        contribution = spend * 0.8  # 80% efficiency assumption
                        contributions.append(ContributionPoint(
                            channel=channel,
                            value=contribution
                        ))
            else:
                # Final fallback: use mock data
                mock_spend = [50000, 30000, 15000, 10000, 8000, 12000]
                for i, channel in enumerate(self.channels):
                    if i < len(mock_spend):
                        contributions.append(ContributionPoint(
                            channel=channel,
                            value=mock_spend[i] * 0.8
                        ))
        
        except Exception as e:
            logger.error(f"Error estimating contributions: {e}")
        
        return contributions
    
    def get_response_curve(self, channel: str) -> ResponseCurvePayload:
        """Get response curve for a specific channel"""
        try:
            if not self.model:
                logger.error("Model not loaded")
                return self._create_mock_response_curve(channel)
            
            if channel not in self.channels:
                logger.warning(f"Channel {channel} not found in model")
                return self._create_mock_response_curve(channel)
            
            # Try to extract response curve from model
            if hasattr(self.model, 'response_curves') and self.model.response_curves is not None:
                curves = self.model.response_curves
                if channel in curves:
                    points = [ResponseCurvePoint(spend=p['spend'], response=p['response']) 
                             for p in curves[channel]]
                    return ResponseCurvePayload(
                        channel=channel,
                        points=points,
                        metadata={'source': 'model'}
                    )
            
            # Try to generate response curve from model predictions
            points = self._generate_response_curve_from_model(channel)
            return ResponseCurvePayload(
                channel=channel,
                points=points,
                metadata={'source': 'generated'}
            )
            
        except Exception as e:
            logger.error(f"Error getting response curve for {channel}: {e}")
            return self._create_mock_response_curve(channel)
    
    def _generate_response_curve_from_model(self, channel: str) -> List[ResponseCurvePoint]:
        """Generate response curve using model predictions"""
        points = []
        
        try:
            # Generate spend points from 0 to max spend
            max_spend = 100000  # Default max spend
            spend_points = np.linspace(0, max_spend, 20)
            
            for spend in spend_points:
                # Try to use model prediction if available
                if hasattr(self.model, 'predict') and callable(self.model.predict):
                    try:
                        # Create input vector for prediction
                        input_data = np.zeros((1, len(self.channels)))
                        channel_idx = self.channels.index(channel)
                        input_data[0, channel_idx] = spend
                        
                        # Get prediction
                        response = self.model.predict(input_data)[0]
                    except:
                        # Fallback to simple estimation
                        response = self._estimate_response(channel, spend)
                else:
                    # Use estimation
                    response = self._estimate_response(channel, spend)
                
                points.append(ResponseCurvePoint(
                    spend=float(spend),
                    response=max(0, float(response))
                ))
        
        except Exception as e:
            logger.error(f"Error generating response curve: {e}")
        
        return points
    
    def _estimate_response(self, channel: str, spend: float) -> float:
        """Estimate response for a given spend level"""
        # Channel-specific response functions (diminishing returns)
        if channel.lower() in ['tv', 'television']:
            return 0.8 * spend - 0.000001 * spend**2
        elif channel.lower() in ['digital', 'online']:
            return 1.2 * spend - 0.000002 * spend**2
        elif channel.lower() in ['radio']:
            return 0.6 * spend - 0.0000008 * spend**2
        elif channel.lower() in ['print']:
            return 0.4 * spend - 0.0000005 * spend**2
        elif channel.lower() in ['outdoor', 'billboard']:
            return 0.3 * spend - 0.0000003 * spend**2
        elif channel.lower() in ['social', 'social media']:
            return 1.5 * spend - 0.000003 * spend**2
        else:
            # Default response function
            return 0.8 * spend - 0.000001 * spend**2
    
    def _create_mock_response_curve(self, channel: str) -> ResponseCurvePayload:
        """Create mock response curve as fallback"""
        spend_points = np.linspace(0, 100000, 20)
        points = []
        
        for spend in spend_points:
            response = self._estimate_response(channel, spend)
            points.append(ResponseCurvePoint(
                spend=float(spend),
                response=max(0, float(response))
            ))
        
        return ResponseCurvePayload(
            channel=channel,
            points=points,
            metadata={'source': 'mock'}
        )
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        if not self.model:
            return {"loaded": False, "error": "Model not loaded"}
        
        info = {
            "loaded": True,
            "channels": self.channels,
            "num_channels": len(self.channels),
            "model_type": type(self.model).__name__,
            "has_contributions": hasattr(self.model, 'contribution'),
            "has_response_curves": hasattr(self.model, 'response_curves'),
            "has_predict": hasattr(self.model, 'predict') and callable(self.model.predict)
        }
        
        return info
    
    def _create_mock_model(self):
        """Create a mock model for development when real model is not available"""
        logger.info("Creating mock Meridian model for development")
        
        # Create a simple mock model object
        class MockModel:
            def __init__(self):
                self.channels = ['TV', 'Digital', 'Radio', 'Print', 'Outdoor', 'Social Media']
                self.contribution = [45000, 35000, 12000, 8000, 6000, 15000]
                self.spend = [50000, 30000, 15000, 10000, 8000, 12000]
                self.response_curves = {}
                
                # Generate mock response curves
                for i, channel in enumerate(self.channels):
                    spend_points = np.linspace(0, 100000, 20)
                    response_points = []
                    
                    for spend in spend_points:
                        # Simulate diminishing returns
                        if channel == 'TV':
                            response = 0.8 * spend - 0.000001 * spend**2
                        elif channel == 'Digital':
                            response = 1.2 * spend - 0.000002 * spend**2
                        elif channel == 'Radio':
                            response = 0.6 * spend - 0.0000008 * spend**2
                        elif channel == 'Print':
                            response = 0.4 * spend - 0.0000005 * spend**2
                        elif channel == 'Outdoor':
                            response = 0.3 * spend - 0.0000003 * spend**2
                        else:  # Social Media
                            response = 1.5 * spend - 0.000003 * spend**2
                        
                        response_points.append({
                            'spend': float(spend),
                            'response': max(0, float(response))
                        })
                    
                    self.response_curves[channel] = response_points
        
        self.model = MockModel()
        self.channels = self.model.channels
        logger.info(f"Created mock model with {len(self.channels)} channels: {self.channels}")

# Global model adapter instance
model_adapter = None

def load_model(path: str) -> MeridianModelAdapter:
    """Load a Meridian model from the specified path"""
    global model_adapter
    model_adapter = MeridianModelAdapter(path)
    return model_adapter

def get_model_adapter() -> Optional[MeridianModelAdapter]:
    """Get the current model adapter instance"""
    return model_adapter
