# BlueAlpha Marketing Analytics Dashboard - Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ and pnpm installed
- Docker Desktop running
- Python 3.12+ (for API development)

### 1. Clone and Install
```bash
git clone <repository-url>
cd software-coding-task
pnpm install
```

### 2. Start Database
```bash
docker compose up -d postgres
```

### 3. Start Applications
```bash
# Start both frontend and backend in development mode
pnpm dev
```

The applications will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database Admin** (optional): http://localhost:8080

### 4. Test the Application
1. Navigate to http://localhost:3000
2. Register a new account
3. Login and access the dashboard
4. Explore the marketing analytics charts

## Project Structure

```
software-coding-task/
├── apps/
│   ├── api/          # FastAPI backend with Google Meridian MMM data
│   └── web/          # Next.js frontend dashboard
├── packages/
│   └── ui/           # Shared UI components
├── docker-compose.yml # PostgreSQL database
└── pnpm-workspace.yaml
```

## Key Features Implemented

### Authentication System
- JWT-based authentication with access + refresh tokens
- Protected dashboard routes
- User registration and login
- PostgreSQL database with SQLAlchemy ORM

### Marketing Analytics Dashboard
- **Channel Contribution Analysis**: Pie chart showing marketing channel performance
- **Response Curves**: Incremental revenue curves with current spend indicators
- **Time Series Analysis**: Weekly spend trends with date filtering (2021-2024)
- **Geographic Performance**: 40 geographic regions analysis
- **Reach/Frequency Analysis**: TV channel advanced media planning metrics

### Technical Stack
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + JWT
- **Frontend**: Next.js 14 + React Context + shadcn/ui + Recharts
- **Data**: Google Meridian MMM CSV datasets (national_all_channels.csv, geo_media_rf.csv)
- **Infrastructure**: Docker + Turbo monorepo + pnpm

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development servers (both apps)
pnpm dev

# Start individual apps
pnpm --filter web dev      # Frontend only
pnpm --filter api dev      # Backend only

# Build for production
pnpm build

# Database admin interface
docker compose up -d adminer  # Access at http://localhost:8080
```

## Database Configuration

The application uses PostgreSQL with automatic table creation on startup:

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16.4
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: local
    ports:
      - "5432:5432"
```

Database connection is configured in `apps/api/config.py`:
```python
DATABASE_URL = "postgresql://postgres:password@localhost:5432/local"
```

## API Documentation

The FastAPI backend provides automatic API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
```
/api/v1/auth/
├── register (POST) - User registration
├── login (POST)    - User authentication
├── refresh (POST)  - Token refresh
└── me (GET)        - Current user info

/api/v1/dashboard/
├── summary (GET)              - Dashboard overview
├── contribution (GET)         - Channel contribution data
├── response-curves (GET)      - Response curves for all channels
├── time-series (GET)          - Weekly spend data with date filtering
├── metrics (GET)              - Channel performance metrics
├── geo/performance (GET)      - Geographic performance data
├── geo/comparison (GET)       - Top/bottom geographic performers
├── reach-frequency/analysis (GET) - TV reach/frequency analysis
└── reach-frequency/geo (GET)      - Geographic reach/frequency data
```

## Data Sources

The application uses Google Meridian Marketing Mix Modeling datasets:

1. **national_all_channels.csv** - National level channel performance data
   - 5 marketing channels (TV, Paid Search, Social Media, etc.)
   - 156 weeks of historical data
   - Spend, conversions, and impressions metrics

2. **geo_media_rf.csv** - Geographic reach and frequency data
   - TV channel performance across 40 geographic regions
   - Reach, frequency, and efficiency metrics

3. **national_media_rf.csv** - National reach and frequency analysis
   - Time series reach/frequency data for TV channel

## Production Considerations

### Performance Optimizations
- **Caching**: In-memory caching for MMM model data loading
- **Database**: Connection pooling configured in SQLAlchemy
- **Frontend**: React.memo and useMemo for chart components and maybe use React Query to prevent multiple API calls and cache results
- **API**: Pydantic models for fast JSON serialization

### Security Features
- **Authentication**: JWT tokens with expiration (30 min access, 7 days refresh)
- **Password Security**: bcrypt hashing with salt rounds
- **CORS**: Configured for frontend origin only
- **Input Validation**: Pydantic models for all API inputs

### Scaling Strategies

When scaling beyond the MVP, consider:

#### Database Layer
- **Read Replicas**: Separate read/write database instances
- **Connection Pooling**: Implement proper pool sizing (current: 5-20 connections)
- **Indexing**: Add indexes on user_id, email, created_at columns
- **Partitioning**: Partition large analytics tables by date

#### API Layer
- **Caching**: Redis for session storage and analytics data caching
- **Rate Limiting**: Implement per-user/IP rate limits
- **Load Balancing**: Multiple API instances behind load balancer
- **Logging and Monitoring**: Use 3rd party for performance tracking and logging

#### Frontend Layer
- **CDN**: Serve static assets via CloudFront/CloudFlare
- **Code Splitting**: Route-based and component-based code splitting
- **Image Optimization**: WebP format, lazy loading for charts
- **Bundle Analysis**: Regular bundle size monitoring

#### Infrastructure
- **Containerization**: Docker containers with multi-stage builds
- **Orchestration**: Kubernetes for auto-scaling and health checks
- **CI/CD**: Automated testing and deployment pipelines
- **Monitoring**: ELK stack for logging, Prometheus/Grafana for metrics

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Ensure PostgreSQL is running
   docker compose up -d postgres

   # Check database logs
   docker compose logs postgres
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using the ports
   lsof -i :3000  # Frontend
   lsof -i :8000  # Backend
   lsof -i :5432  # Database
   ```

3. **Package Installation Issues**
   ```bash
   # Clear pnpm cache and reinstall
   pnpm store prune
   rm -rf node_modules
   pnpm install
   ```

4. **Python Environment Issues**
   ```bash
   # Navigate to API directory
   cd apps/api

   # Check UV installation
   uv --version

   # Reinstall dependencies
   uv sync
   ```

### Environment Variables

The application uses minimal environment variables for development:

```bash
# apps/api/.env (optional)
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://postgres:password@localhost:5432/local

# .env.local (root)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, ensure you update the SECRET_KEY and use proper database credentials.

## Support

For technical questions or deployment assistance, please refer to:
- API documentation: http://localhost:8000/docs
- Frontend components: `packages/ui/src/components/`
- Database schema: `apps/api/models.py`
- Architecture decisions: `plan.md`