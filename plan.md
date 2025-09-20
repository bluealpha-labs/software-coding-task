# BlueAlpha Interview Assignment - Implementation Plan

## Project Overview
Build an MVP authentication system + marketing analytics dashboard for BlueAlpha, showcasing Google Meridian MMM (Marketing Mix Modeling) results using CSV datasets and realistic dummy data for complex modeling outputs.

## Architecture Decisions

### Backend (FastAPI)
- **Authentication**: JWT with access + refresh tokens (5-hour expiry for development)
- **Database**: PostgreSQL with SQLAlchemy ORM, auto-table creation on startup
- **API Versioning**: `/api/v1/` prefix
- **Password Security**: bcrypt hashing
- **Data Processing**: CSV-based data loading with pandas, realistic dummy data generation
- **CORS**: Configured for Next.js frontend

### Frontend (Next.js)
- **State Management**: React Context for auth state
- **Protected Routes**: Route guards using auth context
- **UI Components**: shadcn/ui + custom chart components
- **Data Visualization**: Recharts with advanced features (date filtering, dashed lines, hover states)
- **Styling**: Tailwind CSS with dark mode support
- **Theme Management**: Custom theme toggle and color system

### Database Schema
```sql
users (
  id: UUID (primary key)
  email: VARCHAR(255) (unique)
  password_hash: VARCHAR(255)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)

-- Future: sessions table for refresh token management
```

### Database Migration Strategy
- **MVP Development**: Using SQLAlchemy `create_all()` for automatic table creation on startup
- **Production**: Would use Alembic migrations for proper schema versioning and safe database changes
- **Rationale**: For interview/demo purposes, auto-creation is simpler and ensures tables exist when CTO runs `pnpm dev`

## Phase 1: Database & Authentication Backend (Priority 1)

### 1.1 Database Setup ✅
- ✅ Add SQLAlchemy, psycopg2 to pyproject.toml (using uv for dependency management)
- ✅ Create database models (User model with UUID primary key)
- ✅ Use SQLAlchemy create_all() for automatic table creation (simplified for demo)
- ✅ Update config.py with PostgreSQL database settings

### 1.2 Authentication API Endpoints ✅
- ✅ Install python-jose, passlib, bcrypt for JWT/password handling
- ✅ Create auth utilities (password hashing, JWT creation/validation)
- ✅ Implement user registration endpoint `/api/v1/auth/register`
- ✅ Implement user login endpoint `/api/v1/auth/login`
- ✅ Implement token refresh endpoint `/api/v1/auth/refresh`
- ✅ Create protected route middleware with HTTPBearer
- ✅ Add user profile endpoint `/api/v1/auth/me`

### 1.3 API Structure ✅
```
/api/v1/
├── auth/
│   ├── register (POST) ✅
│   ├── login (POST) ✅
│   ├── refresh (POST) ✅
│   └── me (GET) - protected ✅
└── dashboard/ - all protected ✅
    ├── summary (GET) - dashboard overview ✅
    ├── contribution (GET) - channel contribution data ✅
    ├── response-curves (GET) - response curves ✅
    ├── time-series (GET) - weekly spend with date filtering ✅
    ├── metrics (GET) - channel performance metrics ✅
    ├── channels (GET) - list of channels ✅
    ├── geo/
    │   ├── performance (GET) - geographic performance ✅
    │   └── comparison (GET) - top/bottom performers ✅
    └── reach-frequency/
        ├── analysis (GET) - TV reach/frequency analysis ✅
        └── geo (GET) - geographic reach/frequency ✅
```

## Phase 2: Frontend Authentication (Priority 1) ✅

### 2.1 Auth Context & State Management ✅
- ✅ Create AuthContext with login/logout/token management
- ✅ Implement token storage using localStorage
- ✅ Create auth API client functions with error handling
- ✅ Add fetch with interceptors for token handling and automatic refresh

### 2.2 Authentication Pages ✅
- ✅ Create login page `/login` with professional styling
- ✅ Create registration page `/register` with form validation
- ✅ Style with shadcn/ui components (Card, Form, Input, Button)
- ✅ Add comprehensive form validation (client-side + server-side)
- ✅ Implement login/register logic with comprehensive error handling

### 2.3 Protected Routes ✅
- ✅ Create RouteGuard component for protecting dashboard
- ✅ Protect all dashboard routes with authentication check
- ✅ Add navigation header with user info and logout functionality
- ✅ Handle token expiration/refresh automatically

## Phase 3: Google Meridian Data Processing (Priority 1) ✅

### 3.1 Backend MMM Data Handling ✅
- ✅ Add pandas, numpy to handle CSV datasets
- ✅ Create MMM data service to load national_all_channels.csv and geo datasets
- ✅ Extract contribution data for pie charts
- ✅ Generate realistic response curve dummy data (matching Google's Meridian example)
- ✅ Create data transformation utilities for geographic and reach/frequency analysis
- ✅ Implement in-memory caching for CSV data loading

### 3.2 MMM API Endpoints ✅
- ✅ `/api/v1/dashboard/summary` - dashboard overview with model summary
- ✅ `/api/v1/dashboard/contribution` - channel contribution data
- ✅ `/api/v1/dashboard/response-curves` - realistic dummy response curves
- ✅ `/api/v1/dashboard/time-series` - weekly spend data with date filtering
- ✅ `/api/v1/dashboard/metrics` - comprehensive channel metrics
- ✅ `/api/v1/dashboard/geo/*` - geographic performance analysis
- ✅ `/api/v1/dashboard/reach-frequency/*` - TV reach/frequency analysis
- ✅ Add data validation with Pydantic models

## Phase 4: Dashboard Frontend (Priority 1) ✅

### 4.1 Dashboard Layout ✅
- ✅ Create main dashboard layout with professional navigation
- ✅ Add responsive design for mobile/desktop with proper grid layouts
- ✅ Create dashboard header with user info and theme toggle
- ✅ Implement comprehensive loading states and error handling

### 4.2 Data Visualization Setup ✅
- ✅ Install Recharts with advanced configuration
- ✅ Create reusable chart components with consistent styling
- ✅ Set up data fetching hooks with TypeScript interfaces
- ✅ Implement error boundaries and loading states for all charts

### 4.3 Required Visualizations (MANDATORY) ✅
- ✅ **Contribution Chart**: Pie chart showing channel contribution to conversions
- ✅ **Response Curves**: Saturation curves with current spend markers and dashed projections
- ✅ **KPI Cards**: Summary statistics (total spend, conversions, channels, weeks)
- ✅ **Time Series Chart**: Weekly spend trends with year-based date filtering (2021-2024)
- ✅ **Geographic Analysis**: Performance across 40 regions with insights
- ✅ **Reach/Frequency Analysis**: TV channel advanced media planning metrics

### 4.4 Dashboard Features ✅
- ✅ Comprehensive campaign analytics overview with hero messaging
- ✅ Weekly spend visualization with interactive date filtering
- ✅ Channel performance metrics with efficiency scoring
- ✅ Geographic performance comparison with top/bottom performers
- ✅ Professional dark/light theme support

## Phase 5: Integration & Polish (Priority 2) ✅

### 5.1 End-to-End Integration ✅
- ✅ Test complete auth flow (registration → login → dashboard access)
- ✅ Test protected dashboard access with proper route guards
- ✅ Verify MMM data visualization accuracy against Google Meridian standards
- ✅ Handle edge cases and errors with comprehensive error boundaries

### 5.2 Production Readiness ✅
- ✅ Add comprehensive error handling throughout application
- ✅ Implement proper logging with startup success/failure indicators
- ✅ Document API scalability considerations (rate limiting, caching)
- ✅ Environment variable management with development defaults
- ✅ Database connection pooling configured via SQLAlchemy

### 5.3 Documentation & Deployment Notes ✅
- ✅ Document complete deployment steps in SETUP.md
- ✅ Add detailed scalability considerations for production
- ✅ Document all API endpoints with examples
- ✅ Add comprehensive development setup instructions
- ✅ Include troubleshooting guide and common issues

## Future Considerations (Post-MVP)

### Scalability
- **Database**: Connection pooling, read replicas, indexing strategies
- **API**: Rate limiting, caching layers (Redis), API gateway
- **Frontend**: Code splitting, CDN, image optimization
- **Infrastructure**: Container orchestration, load balancing

### Security Enhancements
- **RBAC**: Role-based access control for different user types
- **Security**: API key management, CSRF protection, input sanitization
- **Monitoring**: Request logging, error tracking, performance monitoring

### Additional Features
- **User Management**: Profile editing, password reset, email verification
- **Dashboard**: More chart types, custom date ranges, data export
- **Admin Panel**: User management, system monitoring

## Success Criteria
1. ✅ Complete user registration/login flow
2. ✅ Protected dashboard routes working
3. ✅ Google Meridian contribution chart displayed
4. ✅ Response curves visualization working
5. ✅ Professional UI/UX matching BlueAlpha's ad-tech focus
6. ✅ Code runs successfully on interviewer's machine
7. ✅ Demonstrates understanding of scalable architecture

## Technical Stack Summary
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + JWT + pandas + uv
- **Frontend**: Next.js 14 + React Context + shadcn/ui + Recharts + Tailwind + Dark Mode
- **Data**: Google Meridian CSV datasets (national_all_channels.csv, geo_media_rf.csv) + realistic dummy data generation
- **Infrastructure**: Docker Compose + Turbo monorepo + pnpm + TypeScript

## Implementation Notes

### Key Architectural Decisions Made
1. **CSV over Pickle**: Switched from saved_mmm.pkl to CSV datasets for better transparency and easier data management
2. **Dummy Data for Complex Modeling**: Used realistic dummy data generation for response curves instead of complex ML modeling, matching Google's Meridian approach
3. **Extended Token Expiry**: Set JWT access token to 5 hours for better development experience
4. **Comprehensive Dashboard**: Built 7 different chart types covering all aspects of marketing mix modeling
5. **Production-Ready Features**: Added dark mode, responsive design, comprehensive error handling, and detailed documentation

### Data Sources Used
- `national_all_channels.csv`: 5 channels × 156 weeks of spend/conversion data
- `geo_media_rf.csv`: TV reach/frequency data across 40 geographic regions
- `national_media_rf.csv`: National TV reach/frequency time series
- Generated realistic response curves matching Google's Meridian saturation curve examples

### Charts Implemented
1. **KPI Cards** - Dashboard overview metrics
2. **Channel Contribution** - Pie chart with spend/conversion breakdown
3. **Response Curves** - Saturation curves with current spend indicators and dashed projections
4. **Time Series** - Weekly spend trends with year-based filtering (2021-2024)
5. **Geographic Performance** - 40 regions with efficiency scoring
6. **Geographic Insights** - Top/bottom performers with actionable insights
7. **Reach/Frequency Analysis** - TV channel advanced media planning metrics