#!/usr/bin/env python3
"""
Create a sample Meridian MMM model file for development
This simulates a real Meridian model with realistic data
"""

import pickle
from datetime import datetime, timedelta

# Simple model class that doesn't require external dependencies
class SampleMeridianModel:
    """Sample Meridian model that simulates real MMM data"""
    
    def __init__(self):
        # Model metadata
        self.model_version = "1.2.1"
        self.training_date = datetime.now() - timedelta(days=30)
        self.channels = ['TV', 'Digital', 'Radio', 'Print', 'Outdoor', 'Social Media']
        
        # Generate realistic contribution data
        self.contribution = [45000, 35000, 12000, 8000, 6000, 15000]
        self.spend = [50000, 30000, 15000, 10000, 8000, 12000]
        
        # Generate response curves for each channel
        self.response_curves = {}
        for i, channel in enumerate(self.channels):
            spend_points = [i * 5000 for i in range(21)]  # 0 to 100k in steps of 5k
            response_points = []
            
            for spend in spend_points:
                # Channel-specific response functions with diminishing returns
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
        
        # Model performance metrics
        self.total_contribution = sum(self.contribution)
        self.total_spend = sum(self.spend)
        self.roi = (self.total_contribution - self.total_spend) / self.total_spend * 100
        
        # Model confidence and metadata
        self.confidence_score = 0.85
        self.model_type = "Meridian MMM"
        self.data_period = "12 months"
        self.last_updated = datetime.now().isoformat()

def create_sample_model():
    """Create and save a sample Meridian model only if one doesn't exist"""
    import os
    
    if os.path.exists('saved_mmm.pkl'):
        print("✅ saved_mmm.pkl already exists - skipping creation")
        print("📁 Using existing model data")
        return
    
    print("Creating sample Meridian MMM model...")
    
    # Create the model
    model = SampleMeridianModel()
    
    # Save to pickle file
    with open('saved_mmm.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print(f"✅ Sample model created successfully!")
    print(f"📊 Channels: {model.channels}")
    print(f"💰 Total Contribution: ${model.total_contribution:,.0f}")
    print(f"💸 Total Spend: ${model.total_spend:,.0f}")
    print(f"📈 ROI: {model.roi:.1f}%")
    print(f"🎯 Confidence: {model.confidence_score:.1%}")
    print(f"📁 Saved to: saved_mmm.pkl")

if __name__ == "__main__":
    create_sample_model()
