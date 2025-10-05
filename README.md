# MMM Dashboard - Marketing Mix Modeling Platform

## Overview

A comprehensive Marketing Mix Modeling (MMM) dashboard platform with user
authentication, analytics, and modern development practices. Built with FastAPI
backend and Next.js frontend in a monorepo structure.

## 🚀 Quick Start

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Model data**: The real Meridian model data is already available in
   `apps/api/saved_mmm.pkl`
   - This contains the actual interview data from Google Meridian
   - If you need to create additional sample data:
     `cd apps/api && pnpm run create-sample-model`

3. **Start the development servers**:

   ```bash
   pnpm dev
   ```

4. **Access the applications**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## ✅ Implemented Features

### 🧠 Google Meridian MMM Integration

- **Meridian Model Loading** from saved_mmm.pkl with automatic fallback to mock
  data
- **Channel Contribution Analysis** with real-time data from Meridian model
- **Response Curves Visualization** showing diminishing returns per channel
- **AI-Powered Explanations** with context-aware insights and drill-down
  suggestions
- **Model Health Monitoring** with comprehensive status checks

### 🔐 Authentication & Authorization

- **JWT-based authentication** with refresh tokens
- **RBAC (Role-Based Access Control)** with admin/user roles
- **Secure password hashing** with bcrypt
- **Session management** with HTTP-only cookies
- **Rate limiting** on API endpoints

### 🏗️ Architecture & Backend

- **Automated migrations** on startup with tracking
- **Connection pooling** with psycopg2
- **Environment-based configuration** with Pydantic
- **Redis caching** with in-memory fallback
- **Feature flags** system for controlled rollouts
- **Audit logging** for security and compliance
- **Health check endpoints** for monitoring

### 🎨 Frontend & UX

- **Responsive design** with Tailwind CSS
- **Dark/light mode** toggle with next-themes
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Skeleton loaders** for better UX
- **Form validation** (client + server side)

### 📊 Data & Analytics

- **Dual Dashboard System** with legacy dashboard and new Meridian MMM dashboard
- **Real-time Model Data** from Google Meridian MMM with automatic fallback
- **Advanced Chart Visualizations** with Recharts integration
- **AI-Powered Insights** with contextual explanations and recommendations
- **Cached API calls** for performance optimization
- **Drill-down views** for detailed analysis
- **Usage analytics** with event logging

### 🧪 Testing & Quality

- **Unit tests** with pytest (API) and Jest (frontend)
- **Integration tests** for end-to-end scenarios
- **Type checking** with TypeScript
- **Linting** with ESLint and Black
- **Precommit hooks** for code quality
- **CI/CD pipeline** with GitHub Actions

### 🚀 DevOps & Deployment

- **Docker containers** for API and web
- **Docker Compose** for local development
- **Database migrations** with automated execution
- **Environment configuration** management
- **Security scanning** with Trivy

## General structure

- apps
  - api: fastapi
  - web: nextjs frontend
- packages
  - ui: shadcn component library
  - docker: dockerized database setup

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose
- pnpm

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd software-coding-task
pnpm turbo run install
```

2. **Start the development environment:**

```bash
pnpm turbo run dev
```

This will:

- Start PostgreSQL database (port 5432)
- Start Redis cache (port 6379)
- Start Adminer database UI (port 8080)
- Start FastAPI backend (port 8000)
- Start Next.js frontend (port 3000)

### 🧪 Running Tests

**API Tests:**

```bash
cd apps/api
pytest tests/ -v --cov=api
```

**Frontend Tests:**

```bash
cd apps/web
pnpm test
```

**All Tests:**

```bash
pnpm turbo run test
```

### 🔧 Development Tools

**Code Quality:**

```bash
# Install precommit hooks
pre-commit install

# Run linting
pnpm turbo run lint

# Run type checking
pnpm turbo run typecheck
```

**Database Management:**

```bash
# Run migrations manually
cd apps/api && uv run python run_migration.py

# Access database UI
open http://localhost:8080
```

### 🐳 Docker Development

```bash
# Start all services
docker-compose -f packages/docker/docker-compose.yml up -d

# Build and run API
cd apps/api
docker build -t mmm-api .
docker run -p 8000:8000 mmm-api

# Build and run frontend
cd apps/web
docker build -t mmm-web .
docker run -p 3000:3000 mmm-web
```

## 🏗️ Architecture

### Backend (FastAPI)

- **Authentication**: JWT with bcrypt password hashing
- **Authorization**: RBAC with role-based middleware
- **Caching**: Redis with in-memory fallback
- **Database**: PostgreSQL with automated migrations
- **Rate Limiting**: SlowAPI for API protection
- **Logging**: Structured audit logging
- **Testing**: pytest with coverage reporting

### Frontend (Next.js)

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context for auth
- **Notifications**: react-hot-toast for user feedback
- **Theming**: next-themes for dark/light mode
- **Testing**: Jest with React Testing Library

### DevOps

- **Monorepo**: Turbo for build orchestration
- **CI/CD**: GitHub Actions with automated testing
- **Code Quality**: Precommit hooks with linting
- **Security**: Trivy vulnerability scanning
- **Containerization**: Docker for deployment

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the project root:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=local

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Application
SECRET_KEY=your-secret-key-here
DEBUG=true

# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Features

### Meridian MMM Dashboard

- **Model Integration**: Automatic loading of saved_mmm.pkl with fallback to
  mock data
- **Channel Contributions**: Real-time analysis of channel performance from
  Meridian model
- **Response Curves**: Interactive visualization of diminishing returns per
  channel
- **AI Explanations**: Context-aware insights with drill-down suggestions and
  caveats
- **Channel Selection**: Dynamic switching between different marketing channels
- **Performance Metrics**: Efficiency, ROI, and saturation point analysis

### Legacy Dashboard Analytics

- **Summary Metrics**: Total spend, contribution, ROI
- **Contribution Charts**: Channel performance analysis
- **Response Curves**: Diminishing returns visualization
- **Real-time Updates**: Cached data with TTL

### User Management

- **Registration/Login**: Secure authentication flow
- **Role-based Access**: Admin and user permissions
- **Session Management**: JWT with refresh tokens
- **Audit Logging**: Complete user action tracking

### Development Experience

- **Hot Reload**: Fast development iteration
- **Type Safety**: Full TypeScript coverage
- **Testing**: Comprehensive test suite
- **Code Quality**: Automated linting and formatting
- **Documentation**: OpenAPI/Swagger documentation

## Frontend component library

### Usage

```bash
pnpm dlx shadcn@latest init
```

### Adding components

To add components to your app, run the following command at the root of your
`web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

### Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the
components from the `ui` package.

### Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```
