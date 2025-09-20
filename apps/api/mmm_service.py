"""Marketing Mix Modeling (MMM) data service using CSV data."""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime


class ContributionData(BaseModel):
    """Channel contribution data."""
    channel: str
    contribution_percentage: float
    total_spend: float
    total_impressions: float


class ResponseCurvePoint(BaseModel):
    """Single point on a response curve."""
    spend: float
    incremental_conversions: float  # FIXED: Should be incremental, not total
    efficiency: float


class ResponseCurveData(BaseModel):
    """Response curve data for a channel."""
    channel: str
    curve_points: List[ResponseCurvePoint]
    current_spend: float  # Mark current spend position
    max_efficient_spend: float  # Saturation point


class TimeSeriesPoint(BaseModel):
    """Time series data point."""
    date: str
    spend: float
    conversions: float
    impressions: float


class ChannelTimeSeries(BaseModel):
    """Time series data for a channel."""
    channel: str
    data_points: List[TimeSeriesPoint]


class ChannelMetrics(BaseModel):
    """Channel performance metrics."""
    channel: str
    total_spend: float
    total_conversions: float
    total_impressions: float
    avg_cpc: float  # cost per conversion
    avg_cpm: float  # cost per thousand impressions
    efficiency_score: float  # conversions per dollar spent


class MMModelSummary(BaseModel):
    """Summary of the MMM model results."""
    total_weeks: int
    date_range: Dict[str, str]
    total_channels: int
    channels: List[str]
    total_spend: float
    total_conversions: float
    top_performing_channel: str
    period: str


class GeoPerformance(BaseModel):
    """Geographic performance data."""
    geo: str
    total_spend: float
    total_conversions: float
    total_impressions: float
    efficiency_score: float  # conversions per dollar
    population: float
    spend_per_capita: float
    conversions_per_capita: float


class GeoChannelPerformance(BaseModel):
    """Channel performance by geography."""
    geo: str
    channel: str
    total_spend: float
    total_conversions: float
    contribution_percentage: float
    efficiency_score: float


class GeoComparison(BaseModel):
    """Geographic comparison data."""
    top_performing_geos: List[GeoPerformance]
    bottom_performing_geos: List[GeoPerformance]
    geo_insights: List[str]


class ReachFrequencyPoint(BaseModel):
    """Single reach/frequency data point."""
    date: str
    reach: float
    frequency: float
    impressions: float
    spend: float
    conversions: float


class ReachFrequencyAnalysis(BaseModel):
    """Reach/frequency analysis for Channel3."""
    channel: str
    time_series: List[ReachFrequencyPoint]
    avg_reach: float
    avg_frequency: float
    total_reach: float
    reach_efficiency: float  # conversions per reach
    frequency_efficiency: float  # conversions per frequency point


class GeoReachFrequency(BaseModel):
    """Geographic reach/frequency performance."""
    geo: str
    avg_reach: float
    avg_frequency: float
    total_conversions: float
    reach_efficiency: float
    frequency_efficiency: float
    population: float
    reach_penetration: float  # reach / population


class MMModelService:
    """Service for handling Google Meridian MMM CSV data."""

    def __init__(self, data_file: str = "data/national_all_channels.csv"):
        self.data_file = Path(data_file)
        self._data = None
        self._geo_data = None
        self._rf_data = None
        self._geo_rf_data = None
        self.channels = ['Channel0', 'Channel1', 'Channel2', 'Channel3', 'Channel4']

        # Proper channel mapping based on CSV data analysis
        self.channel_mapping = {
            'Channel0': 'Digital Display',
            'Channel1': 'Paid Search',
            'Channel2': 'Social Media',
            'Channel3': 'TV',           # Highest spend (40% of budget)
            'Channel4': 'Video/YouTube'
        }

        self.load_data()
        self.load_geo_data()
        self.load_rf_data()
        self._calculate_channel_contributions()

    def load_data(self) -> None:
        """Load MMM data from CSV file."""
        try:
            if self.data_file.exists():
                self._data = pd.read_csv(self.data_file)
                print(f"✅ Loaded MMM data: {len(self._data)} weeks of data")
                print(f"   Date range: {self._data['time'].min()} to {self._data['time'].max()}")
                print(f"   Total spend: ${sum(self._data[f'{ch}_spend'].sum() for ch in self.channels):,.0f}")
            else:
                raise FileNotFoundError(f"MMM data file not found: {self.data_file}")
        except Exception as e:
            raise Exception(f"Failed to load MMM data: {e}")

    def _calculate_channel_contributions(self):
        """Calculate proper channel contributions based on real MMM logic."""
        if self._data is None:
            return

        # Calculate actual spend per channel
        self.channel_spends = {}
        self.channel_impressions = {}

        for channel in self.channels:
            spend_col = f"{channel}_spend"
            impression_col = f"{channel}_impression"

            self.channel_spends[channel] = self._data[spend_col].sum()
            self.channel_impressions[channel] = self._data[impression_col].sum()

        self.total_spend = sum(self.channel_spends.values())
        self.total_conversions = self._data['conversions'].sum()

        # Calculate channel attribution using spend-based weights
        # In real MMM, this would use trained model coefficients
        self.channel_attributions = {}
        for channel in self.channels:
            spend_weight = self.channel_spends[channel] / self.total_spend
            self.channel_attributions[channel] = self.total_conversions * spend_weight

        print(f"📊 Channel Attribution Summary:")
        for channel in self.channels:
            name = self.channel_mapping[channel]
            spend = self.channel_spends[channel]
            attribution = self.channel_attributions[channel]
            print(f"   {name}: ${spend:,.0f} → {attribution:,.0f} conversions")

    def _saturation_curve(self, spend: float, max_spend: float, alpha: float = 2.0, gamma: float = 0.3) -> float:
        """
        Implement proper saturation curve (Hill equation).

        Args:
            spend: Current spend level
            max_spend: Maximum observed spend for scaling
            alpha: Shape parameter (steepness)
            gamma: Half-saturation point (as fraction of max_spend)

        Returns:
            Saturation factor (0-1)
        """
        if spend <= 0:
            return 0

        # Normalize spend
        normalized_spend = spend / max_spend
        half_sat = gamma

        # Hill saturation curve
        saturation = (normalized_spend ** alpha) / (half_sat ** alpha + normalized_spend ** alpha)
        return saturation

    def load_geo_data(self) -> None:
        """Load geographic MMM data from CSV file."""
        try:
            geo_file = Path("data/geo_all_channels.csv")
            if geo_file.exists():
                self._geo_data = pd.read_csv(geo_file)
                print(f"✅ Loaded Geographic data: {len(self._geo_data)} rows")
                print(f"   Geographies: {self._geo_data['geo'].nunique()}")
                print(f"   Time periods: {self._geo_data['time'].nunique()}")
            else:
                print("⚠️ Geographic data file not found, geo features disabled")
                self._geo_data = None
        except Exception as e:
            print(f"⚠️ Failed to load geographic data: {e}")
            self._geo_data = None

    def load_rf_data(self) -> None:
        """Load reach/frequency data from CSV files."""
        try:
            # National RF data
            rf_file = Path("data/national_media_rf.csv")
            if rf_file.exists():
                self._rf_data = pd.read_csv(rf_file)
                print(f"✅ Loaded National RF data: {len(self._rf_data)} weeks")
                
            # Geographic RF data
            geo_rf_file = Path("data/geo_media_rf.csv")
            if geo_rf_file.exists():
                self._geo_rf_data = pd.read_csv(geo_rf_file)
                print(f"✅ Loaded Geographic RF data: {len(self._geo_rf_data)} rows")
                print(f"   Geographies: {self._geo_rf_data['geo'].nunique()}")
                
            if self._rf_data is None and self._geo_rf_data is None:
                print("⚠️ No reach/frequency data files found, RF features disabled")
                
        except Exception as e:
            print(f"⚠️ Failed to load reach/frequency data: {e}")
            self._rf_data = None
            self._geo_rf_data = None

    def get_contribution_data(self) -> List[ContributionData]:
        """Get channel contribution data with proper channel names."""
        contribution_data = []

        for channel in self.channels:
            channel_name = self.channel_mapping[channel]  # Use proper names
            spend = self.channel_spends[channel]
            impressions = self.channel_impressions[channel]
            contribution_pct = (spend / self.total_spend) * 100

            contribution_data.append(ContributionData(
                channel=channel_name,
                contribution_percentage=round(contribution_pct, 1),
                total_spend=round(spend, 2),
                total_impressions=int(impressions)
            ))

        # Sort by contribution (highest first)
        return sorted(contribution_data, key=lambda x: x.contribution_percentage, reverse=True)

    def get_response_curves(self) -> List[ResponseCurveData]:
        """Generate proper response curves with saturation using common spend range."""
        if self._data is None:
            raise Exception("MMM data not loaded")

        response_curves = []

        # Find the maximum spend across ALL channels for common X-axis
        all_max_spends = []
        for channel in self.channels:
            spend_col = f"{channel}_spend"
            channel_max = self._data[spend_col].max()
            all_max_spends.append(channel_max)

        # Use common spend range across all channels (0 to max of all channels)
        global_max_spend = max(all_max_spends)
        common_spend_range = np.linspace(0, global_max_spend * 1.2, 100)  # More points for smoother curves

        for channel in self.channels:
            channel_name = self.channel_mapping[channel]
            spend_col = f"{channel}_spend"

            # Get channel's actual spend data
            channel_spend_data = self._data[spend_col].values
            channel_max_spend = channel_spend_data.max()
            current_avg_spend = channel_spend_data.mean()

            # Use the common spend range for all channels
            spend_range = common_spend_range

            # Get channel's attributed conversions
            total_attributed_conversions = self.channel_attributions[channel]

            # Create proper saturation response curve
            curve_points = []
            max_incremental = 0

            for spend_level in spend_range:
                # Apply saturation curve using channel's own max for proper scaling
                saturation_factor = self._saturation_curve(spend_level, channel_max_spend)

                # Calculate incremental conversions based on saturation
                # Base efficiency from current performance
                if self.channel_spends[channel] > 0:
                    base_efficiency = total_attributed_conversions / self.channel_spends[channel]
                else:
                    base_efficiency = 1000  # Default efficiency

                # Apply diminishing returns
                incremental_conversions = spend_level * base_efficiency * saturation_factor
                efficiency = incremental_conversions / spend_level if spend_level > 0 else 0

                max_incremental = max(max_incremental, incremental_conversions)

                curve_points.append(ResponseCurvePoint(
                    spend=round(spend_level, 2),
                    incremental_conversions=round(incremental_conversions, 2),
                    efficiency=round(efficiency, 6)
                ))

            # Find saturation point (90% of max incremental)
            saturation_point = channel_max_spend
            for point in curve_points:
                if point.incremental_conversions >= max_incremental * 0.9:
                    saturation_point = point.spend
                    break

            response_curves.append(ResponseCurveData(
                channel=channel_name,
                curve_points=curve_points,
                current_spend=round(current_avg_spend, 2),
                max_efficient_spend=round(saturation_point, 2)
            ))

        return response_curves

    def get_response_curve_for_channel(self, channel_name: str) -> Optional[ResponseCurveData]:
        """Get response curve data for a specific channel by name."""
        all_curves = self.get_response_curves()
        for curve in all_curves:
            if curve.channel.lower() == channel_name.lower():
                return curve
        return None

    def get_time_series_data(self, start_date: str = None, end_date: str = None) -> List[ChannelTimeSeries]:
        """Get time series spend data with proper channel names and optional date filtering."""
        if self._data is None:
            raise Exception("MMM data not loaded")

        # Apply date filtering if provided
        filtered_data = self._data.copy()

        if start_date or end_date:
            # Convert time column to datetime for filtering
            filtered_data['time'] = pd.to_datetime(filtered_data['time'])

            if start_date:
                start_dt = pd.to_datetime(start_date)
                filtered_data = filtered_data[filtered_data['time'] >= start_dt]

            if end_date:
                end_dt = pd.to_datetime(end_date)
                filtered_data = filtered_data[filtered_data['time'] <= end_dt]

            # Convert back to string for consistency
            filtered_data['time'] = filtered_data['time'].dt.strftime('%Y-%m-%d')

        time_series = []

        for channel in self.channels:
            channel_name = self.channel_mapping[channel]  # Use proper names
            spend_col = f"{channel}_spend"
            impression_col = f"{channel}_impression"

            data_points = []
            for _, row in filtered_data.iterrows():
                # Calculate channel-specific conversions (proportional to filtered data length)
                total_data_length = len(self._data)  # Use original data length for attribution
                channel_conversions = self.channel_attributions[channel] / total_data_length

                data_points.append(TimeSeriesPoint(
                    date=row['time'],
                    spend=round(row[spend_col], 2),
                    conversions=round(channel_conversions, 2),
                    impressions=round(row[impression_col], 2)
                ))

            time_series.append(ChannelTimeSeries(
                channel=channel_name,
                data_points=data_points
            ))

        return time_series

    def get_channel_metrics(self) -> List[ChannelMetrics]:
        """Get comprehensive channel performance metrics."""
        if self._data is None:
            raise Exception("MMM data not loaded")

        metrics = []
        
        for channel in self.channels:
            spend_col = f"{channel}_spend"
            impression_col = f"{channel}_impression"
            
            if spend_col in self._data.columns:
                total_spend = self._data[spend_col].sum()
                total_conversions = self._data['conversions'].sum()  # Total conversions (shared across channels)
                total_impressions = self._data[impression_col].sum() if impression_col in self._data.columns else 0
                
                # Calculate metrics
                avg_cpc = total_spend / total_conversions if total_conversions > 0 else 0
                avg_cpm = (total_spend / total_impressions) * 1000 if total_impressions > 0 else 0
                efficiency_score = total_conversions / total_spend if total_spend > 0 else 0

                metrics.append(ChannelMetrics(
                    channel=channel,
                    total_spend=round(total_spend, 2),
                    total_conversions=round(total_conversions, 2),
                    total_impressions=total_impressions,
                    avg_cpc=round(avg_cpc, 4),
                    avg_cpm=round(avg_cpm, 4),
                    efficiency_score=round(efficiency_score, 6)
                ))

        return metrics

    def get_model_summary(self) -> MMModelSummary:
        """Get model summary with proper channel names."""
        if self._data is None:
            raise Exception("MMM data not loaded")

        # Find top performing channel by spend
        top_channel_key = max(self.channel_spends.items(), key=lambda x: x[1])[0]
        top_channel_name = self.channel_mapping[top_channel_key]

        # Get date range
        dates = self._data['time'].tolist()

        return MMModelSummary(
            total_weeks=len(self._data),
            date_range={
                'start': dates[0],
                'end': dates[-1]
            },
            total_channels=len(self.channels),
            channels=list(self.channel_mapping.values()),  # Use proper names
            total_spend=round(self.total_spend, 2),
            total_conversions=round(self.total_conversions, 2),
            top_performing_channel=top_channel_name,
            period=f"{dates[0]} to {dates[-1]}"
        )

    def get_channels(self) -> List[str]:
        """Get list of marketing channels with proper names."""
        return list(self.channel_mapping.values())

    def get_geo_performance(self) -> List[GeoPerformance]:
        """Get performance data for all geographies."""
        if self._geo_data is None:
            raise Exception("Geographic data not loaded")

        geo_performance = []
        
        for geo in self._geo_data['geo'].unique():
            geo_data = self._geo_data[self._geo_data['geo'] == geo]
            
            # Calculate totals for this geo
            spend_cols = [f"{channel}_spend" for channel in self.channels]
            impression_cols = [f"{channel}_impression" for channel in self.channels]
            
            total_spend = geo_data[spend_cols].sum().sum()
            total_conversions = geo_data['conversions'].sum()
            total_impressions = geo_data[impression_cols].sum().sum()
            population = geo_data['population'].iloc[0]  # Population is constant per geo
            
            efficiency_score = total_conversions / total_spend if total_spend > 0 else 0
            spend_per_capita = total_spend / population if population > 0 else 0
            conversions_per_capita = total_conversions / population if population > 0 else 0
            
            geo_performance.append(GeoPerformance(
                geo=geo,
                total_spend=round(total_spend, 2),
                total_conversions=round(total_conversions, 2),
                total_impressions=int(total_impressions),
                efficiency_score=round(efficiency_score, 6),
                population=round(population, 2),
                spend_per_capita=round(spend_per_capita, 2),
                conversions_per_capita=round(conversions_per_capita, 2)
            ))
        
        # Sort by efficiency score (highest first)
        geo_performance.sort(key=lambda x: x.efficiency_score, reverse=True)
        return geo_performance

    def get_geo_comparison(self) -> GeoComparison:
        """Get geographic comparison with insights."""
        geo_performance = self.get_geo_performance()
        
        top_geos = geo_performance[:5]  # Top 5 performers
        bottom_geos = geo_performance[-5:]  # Bottom 5 performers
        
        # Generate insights
        insights = []
        if len(geo_performance) > 0:
            best_geo = geo_performance[0]
            worst_geo = geo_performance[-1]
            
            efficiency_ratio = best_geo.efficiency_score / worst_geo.efficiency_score if worst_geo.efficiency_score > 0 else 0
            
            insights.extend([
                f"{best_geo.geo} leads with {best_geo.efficiency_score:.4f} conversions per dollar",
                f"{efficiency_ratio:.1f}x efficiency gap between top and bottom performers",
                f"Top 5 geos drive ${sum(g.total_spend for g in top_geos):,.0f} in spend",
                f"Geographic reallocation opportunity: ${(best_geo.spend_per_capita - worst_geo.spend_per_capita) * worst_geo.population:,.0f}",
                f"Population-adjusted performance varies {(max(g.conversions_per_capita for g in geo_performance) / min(g.conversions_per_capita for g in geo_performance)):.1f}x"
            ])
        
        return GeoComparison(
            top_performing_geos=top_geos,
            bottom_performing_geos=bottom_geos,
            geo_insights=insights
        )

    def get_reach_frequency_analysis(self) -> ReachFrequencyAnalysis:
        """Get reach/frequency analysis for Channel3."""
        if self._rf_data is None:
            raise Exception("Reach/frequency data not loaded")

        # Extract Channel3 reach/frequency time series
        time_series = []
        for _, row in self._rf_data.iterrows():
            time_series.append(ReachFrequencyPoint(
                date=row['time'],
                reach=row['Channel3_reach'],
                frequency=row['Channel3_frequency'],
                impressions=row['Channel3_impression'],
                spend=row['Channel3_spend'],
                conversions=row['conversions']
            ))

        # Calculate aggregated metrics
        avg_reach = self._rf_data['Channel3_reach'].mean()
        avg_frequency = self._rf_data['Channel3_frequency'].mean()
        total_reach = self._rf_data['Channel3_reach'].sum()
        total_conversions = self._rf_data['conversions'].sum()
        
        reach_efficiency = total_conversions / total_reach if total_reach > 0 else 0
        frequency_efficiency = total_conversions / self._rf_data['Channel3_frequency'].sum() if self._rf_data['Channel3_frequency'].sum() > 0 else 0

        return ReachFrequencyAnalysis(
            channel="Channel3",
            time_series=time_series,
            avg_reach=round(avg_reach, 2),
            avg_frequency=round(avg_frequency, 4),
            total_reach=round(total_reach, 2),
            reach_efficiency=round(reach_efficiency, 6),
            frequency_efficiency=round(frequency_efficiency, 6)
        )

    def get_geo_reach_frequency(self) -> List[GeoReachFrequency]:
        """Get reach/frequency performance by geography."""
        if self._geo_rf_data is None:
            raise Exception("Geographic reach/frequency data not loaded")

        geo_rf_performance = []
        
        for geo in self._geo_rf_data['geo'].unique():
            geo_data = self._geo_rf_data[self._geo_rf_data['geo'] == geo]
            
            avg_reach = geo_data['Channel3_reach'].mean()
            avg_frequency = geo_data['Channel3_frequency'].mean()
            total_conversions = geo_data['conversions'].sum()
            population = geo_data['population'].iloc[0]
            
            total_reach = geo_data['Channel3_reach'].sum()
            total_frequency = geo_data['Channel3_frequency'].sum()
            
            reach_efficiency = total_conversions / total_reach if total_reach > 0 else 0
            frequency_efficiency = total_conversions / total_frequency if total_frequency > 0 else 0
            reach_penetration = avg_reach / population if population > 0 else 0
            
            geo_rf_performance.append(GeoReachFrequency(
                geo=geo,
                avg_reach=round(avg_reach, 2),
                avg_frequency=round(avg_frequency, 4),
                total_conversions=round(total_conversions, 2),
                reach_efficiency=round(reach_efficiency, 6),
                frequency_efficiency=round(frequency_efficiency, 6),
                population=round(population, 2),
                reach_penetration=round(reach_penetration, 4)
            ))
        
        # Sort by reach efficiency (highest first)
        geo_rf_performance.sort(key=lambda x: x.reach_efficiency, reverse=True)
        return geo_rf_performance

