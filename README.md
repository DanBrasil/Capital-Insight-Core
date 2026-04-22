# Capital Insight API

Multi-tenant NestJS API for financial monitoring, portfolio management and AI-driven insights.

---

## Overview

The Capital Insight API is the backend service of a white-label SaaS platform designed for financial monitoring and investment analysis.

It provides:

* Multi-tenant architecture
* Secure JWT authentication
* Portfolio and operations management
* Financial analytics (dashboard & reports)
* AI-ready data layer for insights
* Modular and scalable domain structure

---

## Architecture

This project follows a modular, domain-driven architecture with strong separation of concerns.

### Core Principles

* SOLID
* Clean Architecture
* Separation of concerns
* Multi-tenant isolation
* Scalable modules

### Data Flow

```txt
Controller → Service → Domain Logic → Prisma → Database
```

---

## Main Features

### Authentication

* JWT-based authentication
* Login / Logout / Me
* Role-based access control
* Tenant-aware security

---

### Multi-Tenant System

* Tenant resolution via header
* Tenant-based data isolation
* Feature flags per tenant
* Dynamic configuration endpoint

---

### Operations & Transactions

* Create, update, delete operations
* Server-side calculation (totalAmount)
* Validation for selling rules
* Filtering and querying

---

### Portfolio

* Derived positions from operations
* Average price calculation
* Profit & loss tracking
* Allocation data ready for charts

---

### Dashboard

* Financial summary
* Time-series data
* Recent activity
* Period-based filtering

---

### Reports

* Aggregated financial data
* Performance metrics
* Period-based summaries

---

### Settings

* User profile
* Preferences
* Password management
* Platform settings (admin)

---

### AI Insights (Ready)

* Structured data output for AI consumption
* Portfolio summaries
* Performance insights (descriptive)

---

## Tech Stack

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Swagger (OpenAPI)
* Jest (Testing)

---

## Project Structure

```txt
src/
  auth/
  tenants/
  operations/
  transactions/
  portfolio/
  dashboard/
  reports/
  settings/
  common/
  prisma/
```

---

## Multi-Tenant Strategy

* Tenant is resolved via request header
* All queries are scoped by tenant_id
* Feature flags are controlled per tenant

Configuration endpoint:

```txt
GET /api/tenants/:id/config
```

---

## API Endpoints (Highlights)

### Auth

```txt
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Tenant

```txt
GET /api/tenants/:id/config
```

### Operations

```txt
GET    /api/operations
POST   /api/operations
PUT    /api/operations/:id
DELETE /api/operations/:id
```

### Portfolio

```txt
GET /api/portfolio/positions
```

### Dashboard

```txt
GET /api/dashboard/summary
GET /api/dashboard/chart
GET /api/dashboard/recent
```

### Reports

```txt
GET /api/reports/summary
```

### Settings

```txt
GET  /api/settings/profile
PUT  /api/settings/profile
PUT  /api/settings/preferences
PUT  /api/settings/password
```

---

## Testing

* Unit tests with Jest
* E2E tests (initial setup)
* Health check endpoint covered

---

## Scripts

```bash
# install
npm install

# run dev
npm run start:dev

# build
npm run build

# test
npm run test

# e2e
npm run test:e2e

# prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
```

---

## Database Setup

### 1. Configure `.env`

```txt
DATABASE_URL=postgresql://user:password@localhost:5432/db
```

### 2. Run migrations

```bash
npx prisma migrate dev
```

### 3. Seed database

```bash
npx prisma db seed
```

---

## Health Check

```txt
GET /api/health
```

---

## API Documentation

Swagger available at:

```txt
/api/docs
```

---

## Important Notes

* Dashboard and Reports are implemented in MVP mode
* Advanced analytics and edge cases will be refined
* Multi-tenant logic is enforced across all modules
* Backend is designed to support frontend modular architecture

---

## Roadmap

* Advanced financial analytics
* Time-series precision improvements
* AI Insights backend integration
* Feature flags expansion
* Performance optimizations
* Observability and logging

---

## Contribution

This project follows strict architectural guidelines.

* Keep modules isolated
* Avoid business logic in controllers
* Maintain consistency with domain structure
* Follow naming and layering conventions

---

## Author

Developed as part of a scalable SaaS financial platform architecture.
