# BlueAlpha Interview Assignment - UPDATED Implementation Plan

## Project Overview
Build an MVP authentication system + marketing analytics dashboard for BlueAlpha, showcasing Google Meridian MMM (Marketing Mix Modeling) results using **REAL CSV data** extracted from the Meridian model.

## 📊 Data Analysis - CSV Files Overview

### Available Data Files (6 CSV files):

#### **1. National Level Data (156 weeks)**
- **`national_all_channels.csv`** ⭐ **START HERE**
  - Complete national view with all 5 channels + organic + controls
  - 156 rows (weekly data from 2021-01-25 to ~2024)
  - Columns: time, conversions, revenue_per_conversion, Channel0-4 (impressions + spend), Organic_channel0, competitor_sales_control, sentiment_score_control, Promo
  - **Perfect for initial dashboard implementation**

- **`national_media.csv`** 
  - Simplified view with only 4 channels (Channel0-3)
  - 156 rows, focused on media channels only
  - Use for: Channel comparison analysis

- **`national_media_rf.csv`**
  - Media channels + reach/frequency data for Channel3
  - 156 rows with reach and frequency metrics
  - Use for: Advanced media planning insights

#### **2. Geo Level Data (40 geos × 156 weeks = 6,240 rows)**
- **`geo_all_channels.csv`** 📈 **ADD LATER**
  - Complete geo breakdown for advanced analysis
  - Same structure as national but per geography
  - Use for: Geographic performance comparison

- **`geo_media.csv`** & **`geo_media_rf.csv`**
  - Geo-level media data with/without reach frequency
  - Use for: Regional optimization insights

### **Data Quality Assessment:**
✅ **AUTHENTIC**: Real Google Meridian MMM data structure
✅ **COMPLETE**: All required elements for contribution charts + response curves
✅ **RICH**: 156 weeks of real spend, conversions, and impression data
✅ **NO ASSUMPTIONS NEEDED**: Actual channel names, spend amounts, conversion data

## Updated Architecture Decisions

### Backend (FastAPI) - UNCHANGED
- **Authentication**: JWT with access + refresh tokens ✅
- **Database**: PostgreSQL with SQLAlchemy ORM ✅
- **API Versioning**: `/api/v1/` prefix ✅
- **Data Source**: **CSV files** instead of pickle file

### Frontend (Next.js) - ENHANCED
- **Chart Library**: Recharts for MMM visualizations
- **Data Visualization**: Focus on compelling narrative for channel performance
- **UI Components**: shadcn/ui + custom MMM dashboard components

## UPDATED IMPLEMENTATION PLAN

## Phase 1: Authentication Backend ✅ COMPLETED
- [x] Database models and authentication endpoints
- [x] JWT token management
- [x] Protected route middleware
- [x] User registration/login/refresh endpoints

## Phase 2: MMM Data Service (NEW PRIORITY 1)

### 2.1 CSV Data Processing Service
- [ ] Create MMM data service to load CSV files
- [ ] Start with `national_all_channels.csv` as primary data source
- [ ] Create Pydantic models for MMM data structure
- [ ] Implement data caching (in-memory for MVP)

### 2.2 Data Analysis Functions
- [ ] **Contribution Analysis**: Calculate channel contribution percentages from spend data
- [ ] **Response Curve Generation**: Create spend vs conversion curves for each channel
- [ ] **Time Series Processing**: Weekly performance trends
- [ ] **Channel Performance Metrics**: ROI, efficiency, spend allocation

### 2.3 MMM API Endpoints (UPDATED)
```
/api/v1/dashboard/
├── summary (GET) - Key metrics overview
├── contribution (GET) - Channel contribution data
├── response-curves (GET) - All channel response curves
├── response-curves/{channel} (GET) - Single channel curve
├── time-series (GET) - Weekly spend/conversion trends
├── channels (GET) - Available channel list
└── performance (GET) - Channel efficiency metrics
```

## Phase 3: Dashboard Frontend (PRIORITY 1)

### 3.1 Core Dashboard Layout
- [ ] Create main dashboard with navigation
- [ ] Implement protected route guards
- [ ] Add responsive design for professional look
- [ ] Create loading states and error boundaries

### 3.2 Required MMM Visualizations (MANDATORY)

#### **A. Contribution Chart** 🎯 **REQUIRED**
- [ ] **Donut/Pie Chart**: Channel contribution percentages
- [ ] **Bar Chart Alternative**: Horizontal bar chart option
- [ ] **Data**: Calculated from real spend data in national_all_channels.csv
- [ ] **Narrative**: "Channel3 drives 40%+ of performance, Channel2 underperforms"

#### **B. Response Curves** 🎯 **REQUIRED**
- [ ] **Line Chart**: Spend vs Conversions for each channel
- [ ] **Multi-line Chart**: All channels on same axis for comparison
- [ ] **Interactive**: Hover for exact values, toggle channels
- [ ] **Data**: Generated from spend/conversion relationship in CSV
- [ ] **Narrative**: "Diminishing returns visible, Channel3 most efficient"

### 3.3 Additional Compelling Visualizations

#### **C. Time Series Performance** 📈
- [ ] **Multi-line Chart**: Weekly spend trends by channel
- [ ] **Stacked Area Chart**: Total spend composition over time
- [ ] **Seasonality Insights**: Identify seasonal patterns
- [ ] **Narrative**: "Q4 spend peaks, Channel performance varies seasonally"

#### **D. Channel Efficiency Dashboard** 📊
- [ ] **Metrics Cards**: ROI, Cost per Conversion, Efficiency Score
- [ ] **Comparison Table**: Channel performance side-by-side
- [ ] **Traffic Light System**: Green/Yellow/Red performance indicators
- [ ] **Narrative**: "Channel ranking by efficiency and ROI"

### 3.4 Dashboard Features
- [ ] **Interactive Filters**: Date range selection
- [ ] **Channel Toggle**: Show/hide specific channels
- [ ] **Export Options**: Download chart data (nice-to-have)
- [ ] **Responsive Design**: Mobile-friendly charts

## Phase 4: Enhanced Analytics (ADD LATER)

### 4.1 Geographic Analysis (Using geo CSV files)
- [ ] **Geo Performance Map**: State/region performance heatmap
- [ ] **Top Performing Geos**: Ranking by conversion efficiency
- [ ] **Geographic Insights**: Regional optimization opportunities

### 4.2 Advanced Media Planning (Using RF data)
- [ ] **Reach vs Frequency Analysis**: Channel3 optimization
- [ ] **Media Planning Tools**: Budget allocation recommendations
- [ ] **Frequency Capping Insights**: Optimal frequency levels

## Implementation Priority Order

### **PHASE 1: Core MVP (Start Here)**
1. **Data Service**: Load `national_all_channels.csv`
2. **Contribution Chart**: Calculate and display channel contributions
3. **Response Curves**: Generate spend vs conversion curves
4. **Basic Dashboard**: Clean layout with these two charts

### **PHASE 2: Enhanced Storytelling**
1. **Time Series**: Add weekly performance trends
2. **Metrics Cards**: Key performance indicators
3. **Professional Polish**: Improved styling and interactions

### **PHASE 3: Advanced Features**
1. **Geographic Data**: Add geo-level insights using geo CSV files
2. **Reach/Frequency**: Advanced media planning features
3. **Export/Sharing**: Data export capabilities

## Data Processing Strategy

### **Start With: `national_all_channels.csv`**
```python
# Key columns to use:
- time: Weekly dates (156 weeks)
- conversions: Target variable
- Channel0-4_spend: Media investment per channel
- Channel0-4_impression: Media volume per channel
- revenue_per_conversion: Value metric
```

### **Add Later: Other CSV files**
- `national_media_rf.csv`: For reach/frequency insights
- `geo_all_channels.csv`: For geographic breakdowns
- Other files: For specific advanced analyses

## Success Criteria (UPDATED)
1. ✅ Complete user authentication flow
2. ✅ Protected dashboard access
3. 🎯 **Contribution chart showing real channel performance** (Channel0-4)
4. 🎯 **Response curves demonstrating diminishing returns**
5. 📈 **Compelling narrative**: "Channel3 dominates performance, optimization opportunities in Channel2"
6. ✅ Professional UI matching BlueAlpha's marketing analytics focus
7. ✅ Code runs successfully with real MMM data
8. ✅ Demonstrates understanding of marketing mix modeling

## Technical Implementation Notes

### **Data Loading Strategy:**
```python
# Load CSV files at startup
mmm_data = pd.read_csv('data/national_all_channels.csv')

# Calculate contributions
channel_spend = mmm_data[['Channel0_spend', 'Channel1_spend', ...]].sum()
contributions = channel_spend / channel_spend.sum() * 100

# Generate response curves
for channel in channels:
    spend_data = mmm_data[f'{channel}_spend']
    conversion_data = mmm_data['conversions'] 
    # Create spend vs conversion relationship
```

### **Visualization Focus:**
- **Contribution Chart**: Clear channel performance ranking
- **Response Curves**: Show marketing efficiency and saturation
- **Time Series**: Demonstrate seasonal patterns and trends
- **Narrative**: Tell story of channel performance and optimization opportunities

## Next Steps Summary
1. **Immediate**: Create MMM data service for CSV processing
2. **Priority 1**: Build contribution chart with real data
3. **Priority 2**: Implement response curve visualization
4. **Priority 3**: Add time series and enhanced dashboard features
5. **Future**: Geographic and advanced media planning features

This plan leverages the authentic Google Meridian data to create a compelling marketing analytics dashboard that tells a real story about channel performance.
