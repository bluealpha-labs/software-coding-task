# BlueAlpha Interview Assignment - Implementation Plan

## Project Overview
Build an MVP authentication system + marketing analytics dashboard for BlueAlpha, showcasing Google Meridian MMM (Marketing Mix Modeling) results.

## Architecture Decisions

### Backend (FastAPI)
- **Authentication**: JWT with access + refresh tokens
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API Versioning**: `/api/v1/` prefix
- **Password Security**: bcrypt hashing
- **CORS**: Configured for Next.js frontend

### Frontend (Next.js)
- **State Management**: React Context for auth state
- **Protected Routes**: Route guards using auth context
- **UI Components**: shadcn/ui + custom chart components
- **Data Visualization**: Recharts or similar for MMM charts
- **Styling**: Tailwind CSS

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

### 1.1 Database Setup
- [ ] Add SQLAlchemy, psycopg2, alembic to pyproject.toml
- [ ] Create database models (User model)
- [ ] Set up Alembic migrations
- [ ] Create initial migration for users table
- [ ] Update config.py with database settings

### 1.2 Authentication API Endpoints
- [ ] Install python-jose, passlib, bcrypt for JWT/password handling
- [ ] Create auth utilities (password hashing, JWT creation/validation)
- [ ] Implement user registration endpoint `/api/v1/auth/register`
- [ ] Implement user login endpoint `/api/v1/auth/login`
- [ ] Implement token refresh endpoint `/api/v1/auth/refresh`
- [ ] Create protected route middleware
- [ ] Add user profile endpoint `/api/v1/auth/me`

### 1.3 API Structure
```
/api/v1/
├── auth/
│   ├── register (POST)
│   ├── login (POST)
│   ├── refresh (POST)
│   └── me (GET) - protected
└── dashboard/
    ├── mmm-data (GET) - protected
    └── charts/ - protected
        ├── contribution
        └── response-curves
```

## Phase 2: Frontend Authentication (Priority 1)

### 2.1 Auth Context & State Management
- [ ] Create AuthContext with login/logout/token management
- [ ] Implement token storage (localStorage + httpOnly cookie consideration)
- [ ] Create auth API client functions
- [ ] Add axios/fetch with interceptors for token handling

### 2.2 Authentication Pages
- [ ] Create login page `/login`
- [ ] Create registration page `/register`
- [ ] Style with shadcn/ui components (Card, Form, Input, Button)
- [ ] Add form validation (client-side)
- [ ] Implement login/register logic with error handling

### 2.3 Protected Routes
- [ ] Create route guard component/HOC
- [ ] Protect dashboard routes
- [ ] Add navigation with logout functionality
- [ ] Handle token expiration/refresh

## Phase 3: Google Meridian Data Processing (Priority 1)

### 3.1 Backend MMM Data Handling
- [ ] Add pandas, numpy, scikit-learn to handle pickle file
- [ ] Create MMM data service to load saved_mmm.pkl
- [ ] Extract contribution data for charts
- [ ] Extract response curve data
- [ ] Create data transformation utilities
- [ ] Implement caching for model data (Redis or in-memory)

### 3.2 MMM API Endpoints
- [ ] `/api/v1/dashboard/mmm-overview` - summary stats
- [ ] `/api/v1/dashboard/contribution-data` - for contribution chart
- [ ] `/api/v1/dashboard/response-curves` - for response curves
- [ ] Add data validation with Pydantic models

## Phase 4: Dashboard Frontend (Priority 1)

### 4.1 Dashboard Layout
- [ ] Create main dashboard layout with navigation
- [ ] Add responsive design for mobile/desktop
- [ ] Create dashboard header with user info
- [ ] Implement loading states

### 4.2 Data Visualization Setup
- [ ] Install chart library (Recharts recommended)
- [ ] Create reusable chart components
- [ ] Set up data fetching hooks
- [ ] Implement error boundaries for charts

### 4.3 Required Visualizations (MANDATORY)
- [ ] **Contribution Chart**: Shows channel contribution to conversions
- [ ] **Response Curves**: Shows marginal response by channel
- [ ] Additional analytics cards (spend, ROI, etc.)
- [ ] Interactive filters/date ranges

### 4.4 Dashboard Features
- [ ] Campaign analytics overview
- [ ] Spend over time visualization
- [ ] Channel performance metrics
- [ ] Export functionality (nice-to-have)

## Phase 5: Integration & Polish (Priority 2)

### 5.1 End-to-End Integration
- [ ] Test complete auth flow
- [ ] Test protected dashboard access
- [ ] Verify MMM data visualization accuracy
- [ ] Handle edge cases and errors

### 5.2 Production Readiness
- [ ] Add comprehensive error handling
- [ ] Implement proper logging
- [ ] Add API rate limiting considerations (document)
- [ ] Environment variable management
- [ ] Database connection pooling

### 5.3 Documentation & Deployment Notes
- [ ] Document deployment steps
- [ ] Add scalability considerations
- [ ] Document API endpoints
- [ ] Add development setup instructions

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
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + JWT
- **Frontend**: Next.js + React Context + shadcn/ui + Recharts
- **Data**: Google Meridian MMM model (saved_mmm.pkl)
- **Infrastructure**: Docker + Turbo monorepo + pnpm