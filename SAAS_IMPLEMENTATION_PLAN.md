# Aura-Sim SaaS Backend Implementation Plan

## Executive Summary

This document outlines the complete technical architecture and implementation roadmap for transforming Aura-Sim from a browser-based simulation into a production-ready, multi-tenant SaaS platform. The focus is on core infrastructure excluding payment processing (Stripe integration deferred).

**Core Philosophy**: We're building a **decision intelligence platform**, not just a fleet simulator. Every architectural decision should prioritize real-time collaboration, data-driven insights, and scalable simulation execution.

---

## Phase 1: Python Simulation Engine (Weeks 1-3)

### 1.1 Core Architecture Decision

**Current State**: All simulation logic runs in TypeScript/JavaScript in the browser via `useSimulationStore.ts`

**Target State**: High-performance Python simulation engine with these characteristics:
- Deterministic simulation (same inputs → same outputs)
- Time-step based execution (daily ticks)
- State serialization/deserialization for pause/resume
- Pluggable vehicle economics models
- Support for 1-500+ vehicles per scenario

### 1.2 Directory Structure

```
backend/
├── aura_engine/
│   ├── __init__.py
│   ├── core/
│   │   ├── simulation.py          # Main SimulationEngine class
│   │   ├── time_manager.py        # Handles daily ticks, acceleration
│   │   ├── state_serializer.py    # JSON save/load for simulation state
│   │   └── event_bus.py           # Internal event system for state changes
│   ├── vehicles/
│   │   ├── base_vehicle.py        # Abstract Vehicle base class
│   │   ├── limousine.py           # Limousine-specific economics
│   │   ├── sedan.py               # Sedan variant
│   │   ├── suv.py                 # SUV variant
│   │   └── vehicle_factory.py     # Factory pattern for vehicle creation
│   ├── economics/
│   │   ├── pricing_models.py      # Dynamic pricing algorithms
│   │   ├── depreciation.py        # Vehicle value decay over time
│   │   ├── maintenance.py         # Cost schedules based on health/age
│   │   └── market_demand.py       # Simulated market conditions
│   ├── scenarios/
│   │   ├── scenario_loader.py     # Load preset/custom scenarios
│   │   ├── presets/               # JSON files for standard scenarios
│   │   └── custom_scenario.py     # User-defined scenario validation
│   ├── analytics/
│   │   ├── metrics_collector.py   # Real-time KPI calculation
│   │   ├── financial_reporter.py  # P&L, cash flow generation
│   │   └── performance_tracker.py # Vehicle utilization stats
│   └── utils/
│       ├── logger.py              # Structured logging
│       └── validators.py          # Input validation utilities
```

### 1.3 Key Implementation Details

**SimulationEngine Class** (`simulation.py`):
```python
class SimulationEngine:
    def __init__(self, scenario_id: str, user_id: str):
        self.scenario_id = scenario_id
        self.user_id = user_id
        self.vehicles: List[Vehicle] = []
        self.current_date: datetime = None
        self.state: SimulationState = SimulationState.RUNNING
        self.event_bus = EventBus()

    def tick(self, days: int = 1) -> SimulationSnapshot:
        """Advance simulation by N days, return state snapshot"""
        pass

    def pause(self) -> None:
        """Pause simulation, serialize state to database"""
        pass

    def resume(self) -> SimulationSnapshot:
        """Resume from last saved state"""
        pass

    def get_metrics(self) -> SimulationMetrics:
        """Calculate current KPIs (cash, utilization, ROI, etc.)"""
        pass
```

**Critical Design Decisions**:
1. **Determinism**: Use fixed random seeds for market fluctuations so simulations are reproducible
2. **State Snapshots**: After each tick, serialize full state to enable "time travel" debugging
3. **Event Bus**: Publish events like `VehicleBreakdown`, `PaymentReceived`, `MaintenanceDue` for real-time UI updates
4. **Vehicle Polymorphism**: Different vehicle types have different economics (limo vs sedan vs SUV)

### 1.4 Testing Strategy

- Unit tests for each vehicle type's economics (100% coverage)
- Integration tests for multi-vehicle interactions
- Performance benchmarks: 100 vehicles × 365 days < 5 seconds
- Determinism tests: Same scenario run twice produces identical results

---

## Phase 2: FastAPI Backend & WebSocket Streaming (Weeks 4-6)

### 2.1 API Architecture

**Tech Stack**:
- FastAPI (async Python web framework)
- Pydantic v2 (request/response validation)
- SQLAlchemy 2.0 (ORM)
- PostgreSQL (primary database)
- Redis (caching + pub/sub for WebSockets)
- JWT authentication (PyJWT)

**Directory Structure**:
```
backend/api/
├── main.py                    # FastAPI app entry point
├── dependencies.py            # Auth, DB session injection
├── routes/
│   ├── auth.py                # Login, register, token refresh
│   ├── scenarios.py           # CRUD for scenarios
│   ├── simulations.py         # Start/pause/resume/stop simulations
│   ├── vehicles.py            # Vehicle catalog management
│   ├── analytics.py           # Historical data queries
│   └── users.py               # User profile management
├── websockets/
│   ├── connection_manager.py  # Handle WS connections
│   ├── simulation_stream.py   # Stream simulation ticks to clients
│   └── collaboration.py       # Multi-user presence/collaboration
├── services/
│   ├── simulation_service.py  # Bridge between API and engine
│   ├── auth_service.py        # JWT token management
│   └── notification_service.py # Email/in-app notifications
├── schemas/
│   ├── scenario.py            # Pydantic models for scenarios
│   ├── simulation.py          # Models for simulation state
│   └── user.py                # User/auth models
└── middleware/
    ├── rate_limiter.py        # API rate limiting
    ├── cors.py                # CORS configuration
    └── request_logger.py      # Structured request logging
```

### 2.2 WebSocket Streaming Design

**Problem**: Browser needs real-time updates as simulation ticks (every simulated day)

**Solution**: WebSocket connection per active simulation with server-sent events

**Connection Flow**:
```
Client                          Server
  |                               |
  |--- WS Connect (token) ------->|
  |                               |-- Authenticate JWT
  |                               |-- Join Redis channel: sim:{scenario_id}
  |<-- Connection Established ----|
  |                               |
  |                               |-- Simulation ticks...
  |<-- {tick: 45, metrics: ...} --|  (broadcast via Redis pub/sub)
  |<-- {event: "breakdown", ...} -|
  |                               |
  |--- WS Close ----------------->|
  |                               |-- Leave Redis channel
```

**Implementation** (`simulation_stream.py`):
```python
class SimulationStreamManager:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, scenario_id: str):
        await websocket.accept()
        self.active_connections[scenario_id] = websocket
        # Subscribe to Redis pub/sub for this scenario
        pubsub = self.redis.pubsub()
        pubsub.subscribe(f"sim:{scenario_id}")
        # Start listening loop
        asyncio.create_task(self._stream_updates(pubsub, websocket))

    async def _stream_updates(self, pubsub, websocket: WebSocket):
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                data = json.loads(message['data'])
                await websocket.send_json(data)
```

**Broadcasting from Simulation Engine**:
```python
# In simulation.py, after each tick:
snapshot = self.get_snapshot()
redis_client.publish(
    f"sim:{self.scenario_id}",
    json.dumps({
        "type": "tick",
        "tick_number": snapshot.tick,
        "date": snapshot.date.isoformat(),
        "metrics": snapshot.metrics.dict(),
        "events": [e.dict() for e in snapshot.events]
    })
)
```

### 2.3 REST API Endpoints

**Authentication**:
- `POST /api/v1/auth/register` - Create new user account
- `POST /api/v1/auth/login` - Login, return JWT access + refresh tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user profile

**Scenarios**:
- `GET /api/v1/scenarios` - List all scenarios for user
- `POST /api/v1/scenarios` - Create new scenario (preset or custom)
- `GET /api/v1/scenarios/{id}` - Get scenario details
- `PUT /api/v1/scenarios/{id}` - Update scenario configuration
- `DELETE /api/v1/scenarios/{id}` - Delete scenario
- `POST /api/v1/scenarios/{id}/clone` - Duplicate scenario

**Simulations**:
- `POST /api/v1/simulations` - Start new simulation (creates scenario if needed)
- `GET /api/v1/simulations/{id}` - Get current simulation state
- `POST /api/v1/simulations/{id}/pause` - Pause simulation
- `POST /api/v1/simulations/{id}/resume` - Resume paused simulation
- `POST /api/v1/simulations/{id}/accelerate` - Change tick speed (1x, 5x, 10x)
- `POST /api/v1/simulations/{id}/stop` - Stop and archive simulation
- `GET /api/v1/simulations/{id}/history` - Get historical tick data

**Vehicles**:
- `GET /api/v1/vehicles/catalog` - Browse available vehicle types
- `POST /api/v1/vehicles/custom` - Add custom vehicle to scenario
- `PUT /api/v1/vehicles/{id}` - Modify vehicle parameters
- `DELETE /api/v1/vehicles/{id}` - Remove vehicle from scenario

**Analytics**:
- `GET /api/v1/analytics/{scenario_id}/summary` - Current KPIs
- `GET /api/v1/analytics/{scenario_id}/financials` - P&L, cash flow history
- `GET /api/v1/analytics/{scenario_id}/utilization` - Vehicle utilization rates
- `GET /api/v1/analytics/{scenario_id}/export` - Download CSV/Excel report

### 2.4 Authentication & Authorization

**JWT Token Structure**:
```python
{
    "sub": "user_123",
    "email": "user@example.com",
    "subscription_tier": "pro",  # free, pro, enterprise
    "exp": 1735689600,
    "iat": 1735603200
}
```

**Middleware Protection**:
```python
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
```

**Multi-Tenant Isolation**: Every query includes `WHERE user_id = :current_user_id`

---

## Phase 3: Database Schema & Data Persistence (Weeks 7-8)

### 3.1 PostgreSQL Schema Design

**Core Tables**:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenarios table
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scenario_type VARCHAR(50),  -- 'preset' or 'custom'
    preset_name VARCHAR(100),   -- If preset: 'standard_fleet', etc.
    initial_balance DECIMAL(15,2) NOT NULL,
    vehicle_count INTEGER NOT NULL,
    configuration JSONB NOT NULL,  -- Full scenario config as JSON
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simulations table (runtime state)
CREATE TABLE simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'paused',  -- running, paused, stopped, archived
    current_tick INTEGER DEFAULT 0,
    current_date DATE,
    state_snapshot JSONB,  -- Last complete simulation state
    started_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    stopped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL,  -- 'limousine', 'sedan', 'suv'
    model VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    current_valuation DECIMAL(15,2),
    health_percentage INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'active',  -- active, maintenance, broken, retired
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_maintenance_cost DECIMAL(15,2) DEFAULT 0,
    metadata JSONB,  -- Additional vehicle-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simulation ticks (historical data for analytics)
CREATE TABLE simulation_ticks (
    id BIGSERIAL PRIMARY KEY,
    simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
    tick_number INTEGER NOT NULL,
    tick_date DATE NOT NULL,
    cash_balance DECIMAL(15,2),
    daily_revenue DECIMAL(15,2),
    daily_expenses DECIMAL(15,2),
    active_vehicles INTEGER,
    metrics JSONB,  -- Detailed metrics for this tick
    events JSONB,   -- Events that occurred on this tick
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX idx_simulations_user_id ON simulations(user_id);
CREATE INDEX idx_simulations_scenario_id ON simulations(scenario_id);
CREATE INDEX idx_vehicles_scenario_id ON vehicles(scenario_id);
CREATE INDEX idx_simulation_ticks_simulation_id ON simulation_ticks(simulation_id);
CREATE INDEX idx_simulation_ticks_tick_number ON simulation_ticks(tick_number);
```

### 3.2 Data Isolation Strategy

**Row-Level Security (RLS)**:
```sql
-- Enable RLS on all tenant tables
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_ticks ENABLE ROW LEVEL SECURITY;

-- Policies to ensure users can only access their own data
CREATE POLICY user_scenarios_policy ON scenarios
    USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY user_simulations_policy ON simulations
    USING (user_id = current_setting('app.current_user_id')::uuid);

-- Similar policies for vehicles and simulation_ticks
```

**Application-Level Enforcement**:
Every database query includes user_id filter:
```python
async def get_user_scenarios(user_id: UUID) -> List[Scenario]:
    query = scenarios.select().where(scenarios.c.user_id == user_id)
    return await database.fetch_all(query)
```

### 3.3 State Serialization Strategy

**Problem**: Simulation state is complex (vehicles, economics, market conditions)

**Solution**: JSONB columns for flexible state storage

**Serialization Format**:
```json
{
    "simulation_id": "uuid-here",
    "tick_number": 45,
    "current_date": "2024-02-15",
    "vehicles": [
        {
            "id": "vehicle-uuid",
            "type": "limousine",
            "model": "Lincoln Town Car",
            "health": 85,
            "valuation": 45000.00,
            "total_revenue": 12500.00,
            "status": "active"
        }
    ],
    "financials": {
        "cash_balance": 2850000.00,
        "total_revenue": 125000.00,
        "total_expenses": 45000.00
    },
    "market_conditions": {
        "demand_index": 1.15,
        "seasonal_factor": 0.95
    }
}
```

**Save/Restore Logic**:
```python
async def save_simulation_state(simulation_id: UUID, state: dict):
    await db.execute(
        simulations.update()
        .where(simulations.c.id == simulation_id)
        .values(state_snapshot=state)
    )

async def load_simulation_state(simulation_id: UUID) -> dict:
    row = await db.fetch_one(
        simulations.select()
        .where(simulations.c.id == simulation_id)
    )
    return row['state_snapshot']
```

### 3.4 Database Migration Strategy

**Tool**: Alembic for schema migrations

**Migration Workflow**:
```bash
# Generate migration after model changes
alembic revision --autogenerate -m "Add vehicle valuation tracking"

# Review generated migration in alembic/versions/xxx.py

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

---

## Phase 4: Frontend Refactoring for API Consumption (Weeks 9-11)

### 4.1 Current State Analysis

**Current Architecture**:
- All logic in browser via Zustand store
- Direct localStorage persistence
- No API calls (except hypothetical future endpoints)
- Monolithic React components

**Problems**:
- No real-time collaboration
- Data loss on browser clear
- Cannot share scenarios
- Limited to single device
- No server-side validation

### 4.2 Target Architecture

**New Architecture**:
- Thin client consuming REST API + WebSocket streams
- Zustand store becomes cache layer, not source of truth
- Optimistic updates with server reconciliation
- Real-time collaboration via WebSocket events

**Directory Restructure**:
```
src/
├── api/
│   ├── client.ts              # Axios instance with interceptors
│   ├── auth.ts                # Auth API calls
│   ├── scenarios.ts           # Scenario CRUD
│   ├── simulations.ts         # Simulation control
│   └── analytics.ts           # Analytics queries
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   ├── useSimulation.ts       # Simulation state + WebSocket
│   ├── useScenarios.ts        # Scenario management
│   └── useAnalytics.ts        # Analytics data fetching
├── store/
│   ├── useSimulationStore.ts  # Now a cache layer
│   └── useAuthStore.ts        # Auth state (JWT tokens)
├── components/
│   ├── ScenarioManager.tsx    # Refactored to use API
│   ├── DashboardPage.tsx      # Refactored to use API
│   └── ...                    # All feature modules refactored
└── utils/
    ├── websocket.ts           # WebSocket connection manager
    └── optimisticUpdates.ts   # Optimistic update helpers
```

### 4.3 API Client Implementation

**Axios Instance with Interceptors** (`client.ts`):
```typescript
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach JWT token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: Handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Try to refresh token
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const { data } = await axios.post(
                        `${apiClient.defaults.baseURL}/auth/refresh`,
                        { refresh_token: refreshToken }
                    );
                    localStorage.setItem('access_token', data.access_token);
                    // Retry original request
                    error.config.headers.Authorization = `Bearer ${data.access_token}`;
                    return apiClient(error.config);
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
```

**Scenario API** (`scenarios.ts`):
```typescript
import apiClient from './client';
import { Scenario, CustomVehicleData } from '../types';

export const scenarioApi = {
    list: async (): Promise<Scenario[]> => {
        const { data } = await apiClient.get('/scenarios');
        return data;
    },

    create: async (scenario: Omit<Scenario, 'id'>): Promise<Scenario> => {
        const { data } = await apiClient.post('/scenarios', scenario);
        return data;
    },

    getById: async (id: string): Promise<Scenario> => {
        const { data } = await apiClient.get(`/scenarios/${id}`);
        return data;
    },

    update: async (id: string, updates: Partial<Scenario>): Promise<Scenario> => {
        const { data } = await apiClient.put(`/scenarios/${id}`, updates);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/scenarios/${id}`);
    },

    clone: async (id: string): Promise<Scenario> => {
        const { data } = await apiClient.post(`/scenarios/${id}/clone`);
        return data;
    },
};
```

### 4.4 WebSocket Integration Hook

**Custom Hook** (`useSimulation.ts`):
```typescript
import { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';

export function useSimulation(scenarioId: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { updateSimulationState, addEvent } = useSimulationStore();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const wsUrl = `${import.meta.env.VITE_WS_URL}/ws/simulation/${scenarioId}?token=${token}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'tick') {
                // Update simulation state from server
                updateSimulationState({
                    tick: data.tick_number,
                    date: data.date,
                    metrics: data.metrics,
                });
            } else if (data.type === 'event') {
                // Add real-time event (breakdown, payment, etc.)
                addEvent(data.event);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
        };
    }, [scenarioId]);

    // Control functions
    const startSimulation = async () => {
        await fetch(`${API_URL}/simulations`, {
            method: 'POST',
            body: JSON.stringify({ scenario_id: scenarioId }),
        });
    };

    const pauseSimulation = async () => {
        await fetch(`${API_URL}/simulations/${scenarioId}/pause`, {
            method: 'POST',
        });
    };

    return {
        isConnected,
        startSimulation,
        pauseSimulation,
    };
}
```

### 4.5 Optimistic Updates Pattern

**Problem**: UI should feel instant, but server is source of truth

**Solution**: Optimistic updates with rollback on error

```typescript
// Example: Adding a custom vehicle
const addCustomVehicle = async (vehicle: CustomVehicleData) => {
    const tempId = `temp-${Date.now()}`;

    // 1. Optimistically update UI
    const optimisticVehicle = { ...vehicle, id: tempId };
    useSimulationStore.getState().addVehicle(optimisticVehicle);

    try {
        // 2. Send to server
        const response = await vehicleApi.create(vehicle);

        // 3. Replace temporary ID with real server ID
        useSimulationStore.getState().replaceVehicle(tempId, response);
    } catch (error) {
        // 4. Rollback on error
        useSimulationStore.getState().removeVehicle(tempId);
        toast.error('Failed to add vehicle');
    }
};
```

### 4.6 Component Refactoring Checklist

For each component (ScenarioManager, DashboardPage, FleetModule, etc.):

1. **Replace direct store mutations** with API calls
2. **Add loading states** for async operations
3. **Handle errors** with user-friendly messages
4. **Implement optimistic updates** where appropriate
5. **Subscribe to WebSocket events** for real-time updates
6. **Remove localStorage dependencies** (except for JWT tokens)

**Example: ScenarioManager Refactor**:
```typescript
// BEFORE (direct store manipulation)
const handleCreateScenario = (config: ScenarioConfig) => {
    useSimulationStore.getState().resetSimulation(config.vehicles);
    localStorage.setItem('activeScenario', JSON.stringify(config));
};

// AFTER (API-driven)
const handleCreateScenario = async (config: ScenarioConfig) => {
    setIsLoading(true);
    try {
        const scenario = await scenarioApi.create({
            name: config.name,
            configuration: config,
            initial_balance: config.initialBalance,
        });
        // Navigate to new scenario
        navigate(`/simulation/${scenario.id}`);
    } catch (error) {
        toast.error('Failed to create scenario');
    } finally {
        setIsLoading(false);
    }
};
```

---

## Phase 5: Deployment & Infrastructure (Weeks 12-13)

### 5.1 Containerization Strategy

**Dockerfile for Backend**:
```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run with uvicorn
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**Dockerfile for Frontend**:
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose for Local Development**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: aura_sim
      POSTGRES_USER: aura_user
      POSTGRES_PASSWORD: aura_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://aura_user:aura_password@postgres:5432/aura_sim
      REDIS_URL: redis://redis:6379
      SECRET_KEY: dev-secret-key-change-in-production
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 5.2 Production Deployment Options

**Option A: Railway.app (Recommended for MVP)**
- Zero-config deployments
- Automatic HTTPS
- Managed PostgreSQL included
- Auto-scaling based on traffic
- Cost: ~$20-50/month for moderate usage

**Deployment Steps**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Link to existing project
railway link

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=<production-db-url>
railway variables set SECRET_KEY=<secure-random-string>
```

**Option B: AWS ECS Fargate (For Scale)**
- Container orchestration without managing servers
- Auto-scaling groups
- Application Load Balancer
- RDS for PostgreSQL
- ElastiCache for Redis
- Cost: ~$100-300/month depending on traffic

**Infrastructure as Code (Terraform)**:
```hcl
# infra/main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_ecs_cluster" "aura_sim" {
  name = "aura-sim-cluster"
}

resource "aws_rds_cluster" "postgres" {
  cluster_identifier = "aura-sim-db"
  engine             = "aurora-postgresql"
  # ... configuration
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "aura-sim-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
}
```

**Option C: DigitalOcean App Platform (Budget-Friendly)**
- Simple deployment from GitHub
- Managed databases available
- Fixed pricing tiers
- Cost: ~$12-50/month

### 5.3 Environment Configuration

**Backend Environment Variables** (`.env.production`):
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/aura_sim

# Redis
REDIS_URL=redis://host:6379

# Authentication
SECRET_KEY=<64-character-random-string>
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=https://app.aura-sim.com,https://www.aura-sim.com

# Simulation Engine
MAX_VEHICLES_PER_SCENARIO=500
SIMULATION_TICK_INTERVAL_MS=1000

# Logging
LOG_LEVEL=INFO
SENTRY_DSN=<optional-sentry-dsn>
```

**Frontend Environment Variables** (`.env.production`):
```env
VITE_API_URL=https://api.aura-sim.com/api/v1
VITE_WS_URL=wss://api.aura-sim.com/ws
```

### 5.4 CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run tests
        run: |
          cd backend
          pytest tests/ -v

      - name: Build frontend
        run: |
          cd frontend
          npm ci
          npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Railway
        uses: railwayapp/cli-action@v2
        with:
          railwayToken: ${{ secrets.RAILWAY_TOKEN }}
        env:
          RAILWAY_SERVICE: backend
        run: |
          cd backend
          railway up --detach

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Railway
        uses: railwayapp/cli-action@v2
        with:
          railwayToken: ${{ secrets.RAILWAY_TOKEN }}
        env:
          RAILWAY_SERVICE: frontend
        run: |
          cd frontend
          railway up --detach
```

### 5.5 Monitoring & Observability

**Application Monitoring**:
- **Sentry**: Error tracking and performance monitoring
- **PostHog**: Product analytics (user behavior, feature usage)
- **UptimeRobot**: Uptime monitoring with alerts

**Infrastructure Monitoring** (if using AWS):
- **CloudWatch**: Logs, metrics, alarms
- **X-Ray**: Distributed tracing
- **RDS Performance Insights**: Database query optimization

**Logging Strategy**:
```python
# Structured logging with correlation IDs
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    correlation_id = str(uuid.uuid4())
    request.state.correlation_id = correlation_id

    with structlog.contextvars.bound_contextvars(correlation_id=correlation_id):
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response

# Usage in endpoints
logger.info("simulation_started", simulation_id=sim_id, user_id=user_id)
```

---

## Phase 6: Analytics & ML Training Pipeline (Weeks 14-15)

### 6.1 Data Pipeline Architecture

**Goal**: Collect simulation data for:
1. Product analytics (understand user behavior)
2. ML training (optimize fleet recommendations)
3. Business intelligence (churn prediction, feature adoption)

**Pipeline Components**:
```
Simulation Engine
       |
       |-- Emits events --> Kafka/Redis Stream
                              |
                              |-- Consumer 1 --> PostgreSQL (operational data)
                              |-- Consumer 2 --> Data Lake (S3/GCS for ML)
                              |-- Consumer 3 --> PostHog (product analytics)
```

**Event Schema**:
```python
# Event emitted on every simulation tick
class SimulationTickEvent(BaseModel):
    event_type: str = "simulation_tick"
    timestamp: datetime
    user_id: UUID
    scenario_id: UUID
    simulation_id: UUID
    tick_number: int
    date: str  # ISO format
    metrics: {
        "cash_balance": float,
        "daily_revenue": float,
        "daily_expenses": float,
        "active_vehicles": int,
        "fleet_utilization": float,
    }
    events: List[{
        "type": str,  # "breakdown", "payment_received", etc.
        "vehicle_id": Optional[UUID],
        "amount": Optional[float],
    }]
```

### 6.2 Data Warehouse Setup

**Option A: BigQuery (Recommended)**
- Serverless, pay-per-query
- Native integration with Google Cloud ML
- SQL interface for analysis

**Schema**:
```sql
-- Raw events table (partitioned by date)
CREATE TABLE `aura-sim.raw_events.simulation_ticks` (
    event_timestamp TIMESTAMP,
    user_id STRING,
    scenario_id STRING,
    simulation_id STRING,
    tick_number INT64,
    simulation_date DATE,
    cash_balance FLOAT64,
    daily_revenue FLOAT64,
    daily_expenses FLOAT64,
    active_vehicles INT64,
    fleet_utilization FLOAT64,
    events ARRAY<STRUCT<type STRING, vehicle_id STRING, amount FLOAT64>>
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY user_id;

-- Aggregated metrics table (for dashboards)
CREATE TABLE `aura-sim.aggregated.daily_metrics` (
    metric_date DATE,
    user_id STRING,
    total_scenarios INT64,
    active_simulations INT64,
    avg_fleet_size FLOAT64,
    avg_daily_revenue FLOAT64,
    total_revenue FLOAT64,
    churned_users INT64  -- Users who didn't run simulation
)
PARTITION BY metric_date;
```

**ETL Pipeline** (Python script running daily):
```python
# etl/daily_aggregation.py
from google.cloud import bigquery

def aggregate_daily_metrics(date: str):
    client = bigquery.Client()

    query = f"""
    INSERT INTO `aura-sim.aggregated.daily_metrics`
    SELECT
        DATE(event_timestamp) as metric_date,
        user_id,
        COUNT(DISTINCT scenario_id) as total_scenarios,
        COUNT(DISTINCT simulation_id) as active_simulations,
        AVG(active_vehicles) as avg_fleet_size,
        AVG(daily_revenue) as avg_daily_revenue,
        SUM(daily_revenue) as total_revenue,
        0 as churned_users  -- Calculate separately
    FROM `aura-sim.raw_events.simulation_ticks`
    WHERE DATE(event_timestamp) = '{date}'
    GROUP BY metric_date, user_id
    """

    client.query(query).result()
```

### 6.3 ML Use Cases

**Use Case 1: Fleet Optimization Recommendations**

**Problem**: Users don't know optimal fleet composition

**Solution**: Train model on successful simulations to recommend vehicle mix

**Training Data**:
```python
# Features
X = {
    "initial_capital": float,
    "scenario_duration_days": int,
    "vehicle_mix": {
        "limousines_pct": float,
        "sedans_pct": float,
        "suvs_pct": float,
    },
    "avg_vehicle_age_days": float,
    "maintenance_budget_pct": float,
}

# Target (success metric)
y = {
    "final_roi": float,
    "profit_margin": float,
}

# Train regression model
from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)
```

**Inference API**:
```python
# api/routes/recommendations.py
@app.post("/api/v1/recommendations/fleet-composition")
async def recommend_fleet(request: FleetRecommendationRequest):
    features = extract_features(request)
    prediction = model.predict([features])

    return {
        "recommended_mix": {
            "limousines": int(prediction[0] * request.vehicle_count),
            "sedans": int(prediction[1] * request.vehicle_count),
            "suvs": int(prediction[2] * request.vehicle_count),
        },
        "expected_roi": prediction[3],
        "confidence_interval": calculate_confidence(features),
    }
```

**Use Case 2: Churn Prediction**

**Problem**: Identify users likely to cancel subscription

**Features**:
- Days since last simulation
- Number of scenarios created
- Average session duration
- Feature usage patterns
- Support ticket history

**Model**: Binary classification (will_churn: yes/no)

**Action**: Trigger retention email sequence when churn probability > 70%

### 6.4 Product Analytics Integration

**PostHog Integration**:
```typescript
// frontend/src/utils/analytics.ts
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
});

// Track scenario creation
export const trackScenarioCreated = (scenarioType: string, vehicleCount: number) => {
    posthog.capture('scenario_created', {
        scenario_type: scenarioType,
        vehicle_count: vehicleCount,
        timestamp: new Date().toISOString(),
    });
};

// Track simulation start
export const trackSimulationStarted = (scenarioId: string) => {
    posthog.capture('simulation_started', {
        scenario_id: scenarioId,
    });
};

// Track vehicle purchase
export const trackVehiclePurchased = (vehicleType: string, price: number) => {
    posthog.capture('vehicle_purchased', {
        vehicle_type: vehicleType,
        price: price,
    });
};
```

**Key Events to Track**:
1. User signup
2. Scenario created (with type)
3. Simulation started/paused/stopped
4. Vehicle added/removed
5. First profitable day achieved
6. Scenario completed (365 days)
7. Export report downloaded
8. Settings changed

**Dashboard Queries** (PostHog Insights):
- DAU/MAU ratio
- Average scenarios per user
- Most popular vehicle types
- Average simulation duration
- Feature adoption rates
- Cohort retention (users returning after 7/30 days)

---

## Phase 7: Real-Time Collaboration Features (Weeks 16-17)

### 7.1 Multi-User Presence System

**Use Case**: Multiple team members viewing/editing same scenario

**Architecture**:
```
User A ---\
User B -----> WebSocket Connection --> Redis Pub/Sub --> Broadcast to all connected users
User C ---/
```

**Presence Tracking**:
```python
# websockets/collaboration.py
class CollaborationManager:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    async def user_joined(self, scenario_id: str, user_id: str, username: str):
        # Add user to active users set
        await self.redis.hset(
            f"scenario:{scenario_id}:presence",
            user_id,
            json.dumps({
                "username": username,
                "joined_at": datetime.utcnow().isoformat(),
                "cursor_position": None,
            })
        )
        # Broadcast presence update
        await self.broadcast_presence(scenario_id)

    async def user_left(self, scenario_id: str, user_id: str):
        await self.redis.hdel(f"scenario:{scenario_id}:presence", user_id)
        await self.broadcast_presence(scenario_id)

    async def broadcast_presence(self, scenario_id: str):
        users = await self.redis.hgetall(f"scenario:{scenario_id}:presence")
        presence_data = {
            "type": "presence_update",
            "users": [
                {"user_id": uid, **json.loads(info)}
                for uid, info in users.items()
            ]
        }
        await self.redis.publish(
            f"scenario:{scenario_id}:collaboration",
            json.dumps(presence_data)
        )
```

**Frontend Presence Display**:
```typescript
// hooks/useCollaboration.ts
export function useCollaboration(scenarioId: string) {
    const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/ws/collaboration/${scenarioId}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'presence_update') {
                setActiveUsers(data.users);
            }
        };

        return () => ws.close();
    }, [scenarioId]);

    return { activeUsers };
}

// Component usage
function ScenarioHeader({ scenarioId }: { scenarioId: string }) {
    const { activeUsers } = useCollaboration(scenarioId);

    return (
        <div className="flex items-center gap-2">
            <h1>{scenario.name}</h1>
            <div className="flex -space-x-2">
                {activeUsers.map(user => (
                    <Avatar
                        key={user.user_id}
                        src={user.avatar}
                        tooltip={user.username}
                    />
                ))}
            </div>
        </div>
    );
}
```

### 7.2 Collaborative Editing (Future Enhancement)

**Challenge**: Multiple users modifying scenario simultaneously

**Solution**: Operational Transform (OT) or CRDTs

**Simpler Approach**: Lock-based editing
```python
async def acquire_edit_lock(scenario_id: str, user_id: str) -> bool:
    lock_key = f"scenario:{scenario_id}:edit_lock"
    # Try to set lock with 5-minute expiry
    acquired = await redis.set(lock_key, user_id, nx=True, ex=300)
    return acquired is not None

async def release_edit_lock(scenario_id: str, user_id: str):
    lock_key = f"scenario:{scenario_id}:edit_lock"
    current_holder = await redis.get(lock_key)
    if current_holder == user_id:
        await redis.delete(lock_key)
```

**UI Indication**:
```typescript
function EditButton({ scenarioId }: { scenarioId: string }) {
    const [isLocked, setIsLocked] = useState(false);
    const [lockedBy, setLockedBy] = useState<string | null>(null);

    const handleEditClick = async () => {
        const acquired = await acquireEditLock(scenarioId);
        if (acquired) {
            setIsLocked(true);
            openEditor();
        } else {
            const holder = await getLockHolder(scenarioId);
            setLockedBy(holder.username);
            toast.info(`Scenario is being edited by ${holder.username}`);
        }
    };

    return (
        <Button onClick={handleEditClick} disabled={isLocked}>
            {isLocked ? 'Editing...' : 'Edit Scenario'}
        </Button>
    );
}
```

### 7.3 Shared Annotations & Comments

**Database Schema**:
```sql
CREATE TABLE scenario_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    parent_comment_id UUID REFERENCES scenario_comments(id),  -- For threads
    comment_text TEXT NOT NULL,
    context JSONB,  -- { tick_number: 45, vehicle_id: "..." }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_scenario_id ON scenario_comments(scenario_id);
```

**Real-Time Comment Notifications**:
```python
async def post_comment(scenario_id: str, user_id: str, text: str):
    # Save to database
    comment = await db.comments.insert({
        "scenario_id": scenario_id,
        "user_id": user_id,
        "comment_text": text,
    })

    # Broadcast to all connected users
    await redis.publish(
        f"scenario:{scenario_id}:collaboration",
        json.dumps({
            "type": "new_comment",
            "comment": serialize_comment(comment),
        })
    )
```

---

## Phase 8: Performance Optimization & Scaling (Weeks 18-19)

### 8.1 Simulation Engine Optimization

**Problem**: Large fleets (500+ vehicles) × long simulations (365 days) = slow

**Optimization Strategies**:

**1. Vectorized Operations with NumPy**:
```python
# Instead of looping through vehicles:
for vehicle in self.vehicles:
    vehicle.health -= random_decay()

# Use NumPy for batch operations:
import numpy as np
health_array = np.array([v.health for v in self.vehicles])
decay_array = np.random.exponential(scale=0.1, size=len(self.vehicles))
new_health = health_array - decay_array
for i, vehicle in enumerate(self.vehicles):
    vehicle.health = max(0, new_health[i])
```

**2. Parallel Simulation Runs**:
```python
from concurrent.futures import ProcessPoolExecutor

def run_multiple_scenarios(scenarios: List[ScenarioConfig]):
    with ProcessPoolExecutor(max_workers=8) as executor:
        futures = [
            executor.submit(run_single_simulation, config)
            for config in scenarios
        ]
        results = [f.result() for f in futures]
    return results
```

**3. Caching Expensive Calculations**:
```python
from functools import lru_cache

@lru_cache(maxsize=1024)
def calculate_depreciation(purchase_price: float, age_days: int, vehicle_type: str) -> float:
    # Expensive calculation with multiple factors
    ...
```

**4. Database Query Optimization**:
```python
# Bad: N+1 query problem
vehicles = await db.vehicles.find_by_scenario(scenario_id)
for vehicle in vehicles:
    maintenance = await db.maintenance.find_by_vehicle(vehicle.id)  # N queries!

# Good: Single query with join
vehicles_with_maintenance = await db.execute("""
    SELECT v.*, m.*
    FROM vehicles v
    LEFT JOIN maintenance_records m ON v.id = m.vehicle_id
    WHERE v.scenario_id = :scenario_id
""", {"scenario_id": scenario_id})
```

### 8.2 API Rate Limiting

**Implementation with Redis**:
```python
from fastapi import Request, HTTPException
import time

RATE_LIMIT = 100  # requests per minute
WINDOW = 60  # seconds

async def rate_limiter(request: Request):
    user_id = request.state.user.id
    key = f"rate_limit:{user_id}"

    current_time = time.time()
    window_start = current_time - WINDOW

    # Remove old entries
    await redis.zremrangebyscore(key, 0, window_start)

    # Count requests in current window
    request_count = await redis.zcard(key)

    if request_count >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    # Add current request
    await redis.zadd(key, {str(current_time): current_time})
    await redis.expire(key, WINDOW)
```

**Tier-Based Limits**:
```python
RATE_LIMITS = {
    "free": 60,      # 1 request/second
    "pro": 300,      # 5 requests/second
    "enterprise": 1200,  # 20 requests/second
}
```

### 8.3 CDN & Asset Optimization

**Frontend Assets**:
- Bundle splitting with Vite
- Lazy loading for route components
- Image optimization (WebP format)
- Service worker for offline caching

**Static Asset CDN**:
```nginx
# nginx.conf for frontend
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;

        # Cache static assets aggressively
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 8.4 Database Connection Pooling

**SQLAlchemy Configuration**:
```python
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,           # Max persistent connections
    max_overflow=10,        # Extra connections under load
    pool_timeout=30,        # Wait time for available connection
    pool_recycle=1800,      # Recycle connections after 30 min
    pool_pre_ping=True,     # Test connections before use
)
```

**Monitoring Connection Pool**:
```python
@app.get("/health/db")
async def database_health():
    pool = engine.pool
    return {
        "status": "healthy",
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
    }
```

### 8.5 Horizontal Scaling Strategy

**Stateless Backend Design**:
- No in-memory state (all state in Redis/PostgreSQL)
- Sticky sessions NOT required
- Can scale to N instances behind load balancer

**Load Balancer Configuration** (NGINX):
```nginx
upstream aura_backend {
    least_conn;  # Route to least busy server
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    listen 80;

    location /api/ {
        proxy_pass http://aura_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws/ {
        proxy_pass http://aura_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Auto-Scaling Rules** (AWS ECS):
```yaml
# terraform/auto_scaling.tf
resource "aws_appautoscaling_policy" "cpu_scaling" {
  name               = "aura-sim-cpu-scaling"
  service_namespace  = "ecs"
  resource_id        = "service/aura-sim-cluster/aura-sim-service"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 300
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "aura-sim-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = 70
  period              = 60

  dimensions = {
    ClusterName = "aura-sim-cluster"
    ServiceName = "aura-sim-service"
  }

  metric_name = "CPUUtilization"
  namespace   = "AWS/ECS"
  statistic   = "Average"
}
```

---

## Phase 9: Security Hardening (Week 20)

### 9.1 Authentication Security

**Password Hashing**:
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**JWT Security Best Practices**:
```python
# Token configuration
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
ALGORITHM = "HS256"
SECRET_KEY = os.environ["SECRET_KEY"]  # 64+ characters, cryptographically random

# Secure token creation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Token blacklist for logout
async def blacklist_token(token: str):
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    await redis.setex(
        f"blacklist:{token}",
        ttl=decoded["exp"] - datetime.utcnow().timestamp(),
        value="blacklisted"
    )

# Check blacklist on every request
async def verify_token_not_blacklisted(token: str):
    if await redis.exists(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token has been revoked")
```

**Rate Limiting on Auth Endpoints**:
```python
@app.post("/api/v1/auth/login")
@rate_limit(max_requests=5, window_seconds=60)  # 5 attempts per minute
async def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # ... issue tokens
```

### 9.2 Input Validation & Sanitization

**Pydantic Validators**:
```python
from pydantic import field_validator, EmailStr

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = Field(..., min_length=1, max_length=255)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 12:
            raise ValueError('Password must be at least 12 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain digit')
        return v
```

**SQL Injection Prevention**:
```python
# NEVER do this:
query = f"SELECT * FROM users WHERE email = '{email}'"  # SQL injection risk!

# ALWAYS use parameterized queries:
query = "SELECT * FROM users WHERE email = :email"
result = await db.fetch_one(query, {"email": email})
```

**XSS Prevention** (Frontend):
```typescript
// React automatically escapes content in JSX
<div>{userInput}</div>  // Safe

// But be careful with dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />  // Use DOMPurify

import DOMPurify from 'dompurify';
const sanitizedHTML = DOMPurify.sanitize(rawHTML);
```

### 9.3 CORS Configuration

**Secure CORS Policy**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.aura-sim.com",
        "https://www.aura-sim.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=3600,  # Cache preflight requests for 1 hour
)
```

### 9.4 Security Headers

**Middleware for Security Headers**:
```python
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

### 9.5 Dependency Security Auditing

**Automated Scanning**:
```bash
# Add to CI/CD pipeline
pip install safety
safety check  # Check Python dependencies for known vulnerabilities

npm audit  # Check Node.js dependencies
```

**GitHub Dependabot Configuration** (`.github/dependabot.yml`):
```yaml
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/backend"
    schedule:
      interval: "weekly"
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
```

### 9.6 Penetration Testing Checklist

Before production launch:
- [ ] OWASP Top 10 vulnerability scan
- [ ] SQL injection testing on all endpoints
- [ ] XSS testing on all user input fields
- [ ] CSRF protection verification
- [ ] Authentication bypass attempts
- [ ] Authorization testing (can User A access User B's data?)
- [ ] Rate limiting effectiveness
- [ ] WebSocket security (authentication, origin validation)
- [ ] File upload restrictions (if applicable)
- [ ] API key exposure scanning

---

## Phase 10: Launch Preparation (Weeks 21-22)

### 10.1 Documentation

**API Documentation** (Auto-generated with FastAPI):
```python
# FastAPI automatically generates OpenAPI/Swagger docs
# Access at: https://api.aura-sim.com/docs

# Enhance with detailed descriptions
@app.post(
    "/api/v1/scenarios",
    summary="Create a new scenario",
    description="""
    Create a new fleet simulation scenario with custom configuration.

    Supports both preset scenarios (Standard Fleet, Aggressive Growth, etc.)
    and fully custom configurations with user-defined vehicles.

    **Preset scenarios**: Provide `preset_name` parameter
    **Custom scenarios**: Provide full `configuration` object with vehicle list
    """,
    response_model=Scenario,
    responses={
        201: {"description": "Scenario created successfully"},
        400: {"description": "Invalid configuration"},
        401: {"description": "Authentication required"},
    }
)
async def create_scenario(request: CreateScenarioRequest):
    ...
```

**Developer Documentation**:
- Getting Started guide
- API reference with examples
- SDK documentation (if providing Python/JS SDKs)
- Webhook documentation (for integrations)

**User Documentation**:
- Scenario setup tutorials
- Vehicle economics explained
- FAQ section
- Video walkthroughs

### 10.2 Onboarding Flow

**First-Time User Experience**:
```typescript
function OnboardingWizard() {
    const [step, setStep] = useState(1);

    return (
        <Modal>
            {step === 1 && (
                <WelcomeStep>
                    <h1>Welcome to Aura-Sim</h1>
                    <p>Let's create your first fleet simulation</p>
                    <Button onClick={() => setStep(2)}>Get Started</Button>
                </WelcomeStep>
            )}

            {step === 2 && (
                <ChooseScenarioStep>
                    <h2>Choose a starting point</h2>
                    <ScenarioCard
                        title="Standard Fleet"
                        description="20 limousines, $2M starting capital"
                        onSelect={() => createPresetScenario('standard')}
                    />
                    <ScenarioCard
                        title="Custom Scenario"
                        description="Build your own fleet from scratch"
                        onSelect={() => navigate('/scenarios/new')}
                    />
                </ChooseScenarioStep>
            )}

            {step === 3 && (
                <TutorialStep>
                    <h2>Quick Tutorial</h2>
                    <InteractiveGuide />
                    <Button onClick={() => completeOnboarding()}>
                        Start Simulating
                    </Button>
                </TutorialStep>
            )}
        </Modal>
    );
}
```

**Empty States**:
```typescript
function ScenarioList() {
    const { scenarios, isLoading } = useScenarios();

    if (isLoading) return <Spinner />;

    if (scenarios.length === 0) {
        return (
            <EmptyState>
                <Illustration />
                <h2>No scenarios yet</h2>
                <p>Create your first fleet simulation to get started</p>
                <Button onClick={() => navigate('/scenarios/new')}>
                    Create Scenario
                </Button>
            </EmptyState>
        );
    }

    return <ScenarioGrid scenarios={scenarios} />;
}
```

### 10.3 Beta Testing Program

**Recruitment Strategy**:
- Invite existing users of browser version
- LinkedIn outreach to fleet managers
- Reddit communities (r/fleetmanagement, r/logistics)
- Offer 6 months free Pro tier for feedback

**Feedback Collection**:
```typescript
// In-app feedback widget
function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);

    const submitFeedback = async (feedback: string, rating: number) => {
        await feedbackApi.submit({
            feedback,
            rating,
            page: window.location.pathname,
            user_id: currentUser.id,
        });
        toast.success('Thank you for your feedback!');
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-4 right-4">
            <Button onClick={() => setIsOpen(true)}>Feedback</Button>
            {isOpen && <FeedbackForm onSubmit={submitFeedback} />}
        </div>
    );
}
```

**Bug Reporting Integration**:
```python
# Automatically capture errors with context
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log to Sentry
    sentry_sdk.capture_exception(exc, scope={
        "user_id": request.state.user.id if hasattr(request.state, 'user') else None,
        "endpoint": request.url.path,
        "method": request.method,
    })

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

### 10.4 Launch Checklist

**Technical**:
- [ ] All critical bugs resolved
- [ ] Load testing completed (simulate 1000 concurrent users)
- [ ] Database backups configured (automated daily)
- [ ] SSL certificates installed and auto-renewing
- [ ] DNS records configured (app.aura-sim.com, api.aura-sim.com)
- [ ] CDN configured for static assets
- [ ] Monitoring dashboards set up (Sentry, PostHog, CloudWatch)
- [ ] Incident response plan documented
- [ ] Rollback procedure tested

**Business**:
- [ ] Pricing page live (even if Stripe deferred, show planned pricing)
- [ ] Terms of Service and Privacy Policy published
- [ ] Support email configured (support@aura-sim.com)
- [ ] Social media accounts created
- [ ] Launch announcement drafted
- [ ] Email list collected for launch notification

**Marketing**:
- [ ] Landing page optimized for conversions
- [ ] Demo video recorded and uploaded
- [ ] Blog post announcing launch
- [ ] Product Hunt submission prepared
- [ ] Hacker News "Show HN" post drafted

---

## Success Metrics & KPIs

### Technical Metrics
- **API Latency**: p95 < 200ms for all endpoints
- **WebSocket Message Delivery**: < 100ms from server to client
- **Simulation Performance**: 100 vehicles × 365 days < 5 seconds
- **Uptime**: 99.9% (excluding planned maintenance)
- **Error Rate**: < 0.1% of requests result in 5xx errors

### Product Metrics
- **Activation Rate**: % of signups who create first scenario (> 60%)
- **Engagement**: Average scenarios per user per week (> 3)
- **Retention**: D7 retention (> 30%), D30 retention (> 15%)
- **Session Duration**: Average time spent per session (> 15 minutes)
- **Feature Adoption**: % of users trying advanced features (custom vehicles, exports)

### Business Metrics (Pre-Revenue)
- **User Growth**: Week-over-week signup growth (> 10%)
- **Beta Conversion**: % of beta users willing to pay at launch (> 20%)
- **NPS**: Net Promoter Score from user surveys (> 40)
- **Support Load**: Average support tickets per user per month (< 0.5)

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk 1: Simulation Performance Degradation**
- **Probability**: Medium
- **Impact**: High (users abandon slow simulations)
- **Mitigation**:
  - Early load testing with 500+ vehicle scenarios
  - Implement caching strategies from Day 1
  - Monitor simulation execution times in production
  - Have fallback: cap free tier at 50 vehicles

**Risk 2: WebSocket Connection Instability**
- **Probability**: Medium
- **Impact**: High (real-time features break)
- **Mitigation**:
  - Implement automatic reconnection with exponential backoff
  - Graceful degradation: poll API if WebSocket fails
  - Use Redis pub/sub for reliable message delivery
  - Monitor WebSocket connection drop rates

**Risk 3: Database Bottlenecks**
- **Probability**: Low initially, High at scale
- **Impact**: High (entire platform slows)
- **Mitigation**:
  - Read replicas for analytics queries
  - Connection pooling from Day 1
  - Query optimization before launch
  - Plan for sharding at 10K+ users

### Business Risks

**Risk 4: Low Willingness to Pay**
- **Probability**: Medium
- **Impact**: Critical (business viability)
- **Mitigation**:
  - Validate pricing with beta users before launch
  - Offer annual discount to improve cash flow
  - Have freemium tier to build user base
  - Pivot to enterprise sales if B2C doesn't work

**Risk 5: Competition from Established Players**
- **Probability**: Low (niche market)
- **Impact**: High if it happens
- **Mitigation**:
  - Focus on superior UX and real-time collaboration
  - Build moat through proprietary ML recommendations
  - Establish brand as "decision intelligence" not just simulator
  - Create switching costs through data accumulation

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1. Python Engine | Weeks 1-3 | Core simulation engine, vehicle economics, scenario loader |
| 2. FastAPI Backend | Weeks 4-6 | REST API, WebSocket streaming, authentication |
| 3. Database Schema | Weeks 7-8 | PostgreSQL schema, RLS policies, migration system |
| 4. Frontend Refactor | Weeks 9-11 | API integration, WebSocket hooks, optimistic updates |
| 5. Deployment | Weeks 12-13 | Docker containers, CI/CD, production environment |
| 6. Analytics Pipeline | Weeks 14-15 | Data warehouse, ML models, product analytics |
| 7. Collaboration | Weeks 16-17 | Multi-user presence, comments, shared editing |
| 8. Performance | Weeks 18-19 | Engine optimization, caching, horizontal scaling |
| 9. Security | Week 20 | Penetration testing, security hardening, compliance |
| 10. Launch Prep | Weeks 21-22 | Documentation, onboarding, beta testing, marketing |

**Total Estimated Timeline**: 22 weeks (~5.5 months)

**Critical Path**: Phases 1-5 are blocking for MVP launch. Phases 6-10 can be parallelized or deferred post-launch.

---

## Resource Requirements

### Engineering Team
- **1 Backend Engineer** (Python/FastAPI/PostgreSQL) - Full timeline
- **1 Frontend Engineer** (React/TypeScript) - Phases 4, 7
- **1 DevOps Engineer** (part-time) - Phases 5, 8, 9
- **1 ML Engineer** (part-time) - Phase 6

### Infrastructure Costs (Monthly Estimates)
- **Development Phase** (Months 1-4): $100-200/month
  - Railway.app staging environment
  - GitHub repositories
  - Domain names
- **Beta Launch** (Months 5-6): $200-500/month
  - Production infrastructure
  - Monitoring tools (Sentry, PostHog)
  - CDN bandwidth
- **Scale Phase** (Month 6+): $500-2000/month
  - Depends on user count
  - Auto-scaling infrastructure
  - Increased database/storage needs

### Third-Party Services
- **Railway.app** or **AWS** for hosting
- **Sentry** for error tracking (free tier initially)
- **PostHog** for product analytics (open-source, self-hosted)
- **Cloudflare** for CDN and DDoS protection (free tier)
- **Resend** or **SendGrid** for transactional emails

---

## Next Steps

1. **Immediate** (This Week):
   - Review this implementation plan with stakeholders
   - Identify any missing requirements or scope changes
   - Set up project management board (Linear/Jira) with tasks from each phase
   - Begin Phase 1: Python simulation engine development

2. **Week 1 Kickoff**:
   - Initialize backend repository structure
   - Set up development environment (Docker Compose)
   - Create first simulation engine prototype (single vehicle, basic economics)
   - Write unit tests for vehicle depreciation model

3. **Ongoing**:
   - Weekly sprint reviews to assess progress
   - Bi-weekly stakeholder demos
   - Continuous integration of completed phases
   - Early user interviews to validate assumptions

---

## Appendix A: Technology Stack Summary

**Backend**:
- Python 3.12
- FastAPI 0.109+
- SQLAlchemy 2.0
- PostgreSQL 16
- Redis 7
- Pydantic v2
- Uvicorn (ASGI server)

**Frontend**:
- React 18
- TypeScript 5
- Vite 5
- Zustand 4
- Tailwind CSS 4
- Axios
- React Query (TanStack Query)

**Infrastructure**:
- Docker & Docker Compose
- Railway.app or AWS ECS
- NGINX (reverse proxy)
- GitHub Actions (CI/CD)
- Terraform (IaC, optional)

**Monitoring & Analytics**:
- Sentry (error tracking)
- PostHog (product analytics)
- UptimeRobot (uptime monitoring)
- Structured logging (structlog)

**Testing**:
- pytest (backend unit tests)
- Playwright (E2E tests)
- k6 (load testing)
- Safety (dependency scanning)

---

## Appendix B: API Endpoint Reference (Complete List)

See Section 2.3 for detailed endpoint specifications. Quick reference:

**Authentication**: 4 endpoints
**Scenarios**: 6 endpoints
**Simulations**: 7 endpoints
**Vehicles**: 4 endpoints
**Analytics**: 4 endpoints
**Users**: 2 endpoints
**Collaboration**: 3 endpoints (Phase 7)
**Recommendations**: 2 endpoints (Phase 6)

**Total**: ~32 REST endpoints + 3 WebSocket channels

---

## Appendix C: Database Schema Diagram

```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│   users     │1────*│  scenarios   │1────*│  simulations  │
└─────────────┘       └──────────────┘       └───────────────┘
                             │1                     │1
                             │                      │
                             *                      *
                      ┌──────────────┐       ┌───────────────┐
                      │   vehicles   │       │simulation_ticks│
                      └──────────────┘       └───────────────┘
```

---

**Document Version**: 1.0
**Last Updated**: 2026-05-16
**Author**: Lingma (AI Assistant)
**Status**: Ready for Review
