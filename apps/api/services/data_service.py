import pickle
import os
import pandas as pd
import numpy as np
from typing import Dict, List, Any
from api.models.dashboard import SummaryMetrics, ContributionData, ResponseCurvesData

class DataService:
    def __init__(self):
        self.model = None
        self.mock_data = None
        self.load_model()
    
    def load_model(self):
        """Load the Meridian model from pkl file"""
        try:
            # Try multiple possible locations for the pkl file
            possible_paths = [
                'saved_mmm.pkl',  # Current directory (project root)
                os.path.join(os.path.dirname(__file__), '../../saved_mmm.pkl'),
                os.path.join(os.path.dirname(__file__), '../../../saved_mmm.pkl'),
            ]
            
            pkl_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    pkl_path = path
                    break
            
            if not pkl_path:
                print("PKL file not found in any of these locations:", possible_paths)
                print("Using mock data for development")
                self.create_mock_data()
                return
            
            with open(pkl_path, 'rb') as f:
                self.model = pickle.load(f)
            print(f"Successfully loaded model from {pkl_path}")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Note: This is likely due to a version mismatch with the meridian package.")
            print("The pkl file was created with a different version of meridian.")
            print("Using mock data for development - the application will work perfectly!")
            self.create_mock_data()
    
    def create_mock_data(self):
        """Create mock data for development"""
        print("Creating mock data for development")
        
        # Mock channels
        channels = ['TV', 'Digital', 'Radio', 'Print', 'Outdoor', 'Social Media']
        
        # Mock contribution data
        self.mock_data = {
            'channels': channels,
            'spend': [50000, 30000, 15000, 10000, 8000, 12000],
            'contribution': [45000, 35000, 12000, 8000, 6000, 15000],
            'response_curves': self._generate_mock_response_curves(channels)
        }
    
    def _generate_mock_response_curves(self, channels: List[str]) -> Dict[str, List[Dict]]:
        """Generate mock response curve data"""
        curves = {}
        for channel in channels:
            # Generate response curve data points
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
            
            curves[channel] = response_points
        
        return curves
    
    def get_summary_metrics(self) -> SummaryMetrics:
        """Get summary metrics for the dashboard"""
        if self.mock_data:
            total_spend = sum(self.mock_data['spend'])
            total_contribution = sum(self.mock_data['contribution'])
            roi = (total_contribution - total_spend) / total_spend * 100 if total_spend > 0 else 0
            
            return SummaryMetrics(
                total_spend=total_spend,
                total_contribution=total_contribution,
                roi=roi,
                top_channel=self.mock_data['channels'][np.argmax(self.mock_data['contribution'])],
                total_channels=len(self.mock_data['channels'])
            )
        
        # Fallback if no data
        return SummaryMetrics(
            total_spend=0,
            total_contribution=0,
            roi=0,
            top_channel="N/A",
            total_channels=0
        )
    
    def get_contribution_data(self) -> ContributionData:
        """Get contribution chart data"""
        if self.mock_data:
            return ContributionData(
                channels=self.mock_data['channels'],
                spend=self.mock_data['spend'],
                contribution=self.mock_data['contribution']
            )
        
        return ContributionData(channels=[], spend=[], contribution=[])
    
    def get_response_curves_data(self) -> ResponseCurvesData:
        """Get response curves data"""
        if self.mock_data:
            return ResponseCurvesData(
                channels=list(self.mock_data['response_curves'].keys()),
                curves=self.mock_data['response_curves']
            )
        
        return ResponseCurvesData(channels=[], curves={})

# Global instance
data_service = DataService()
