# Azure Pipeline Dashboard

A real-time web dashboard for monitoring Azure DevOps pipeline status across all projects in an organization.

---

## Overview

- **Goal:** Single-pane visibility into CI/CD pipelines across every project in an Azure DevOps organization, with live updates
- **Platform:** Web application (React + TypeScript)
- **Backend:** Node.js / Express with PAT-based Azure DevOps REST API integration
- **Updates:** Server-Sent Events (SSE) for real-time push; polling fallback

---

## Phases

### Phase 1 — Project Infrastructure

**Goal:** Set up the development environment and scaffold the monorepo.

- [x] Monorepo structure (`/frontend`, `/backend`, `/shared`)
- [x] Frontend: Vite + React + TypeScript
- [x] Backend: Node.js + Express
- [x] Shared type definitions (`Pipeline`, `Build`, `Project`, etc.) under `shared/`
- [x] ESLint + Prettier config
- [x] `.env.example` with all required environment variables documented
- [x] `.gitignore`

**Deliverable:** Skeleton app running with `npm run dev`

---

### Phase 2 — Azure DevOps API Integration

**Goal:** Fetch project and pipeline data from an Azure DevOps organization.

- [x] Personal Access Token (PAT) management — stored securely via `.env` + `dotenv`
- [x] Azure DevOps REST API client (`/backend/src/azureDevOps/client.ts`)
- [x] List all projects: `GET https://dev.azure.com/{org}/_apis/projects?api-version=7.1`
- [x] List pipeline definitions per project: `GET /{org}/{project}/_apis/pipelines`
- [x] Fetch recent builds: `GET /{org}/{project}/_apis/build/builds?$top=5&definitions={id}`
- [ ] Release pipelines: `GET /{org}/{project}/_apis/release/releases` *(deferred to Phase 4)*
- [x] Map API responses to shared type definitions
- [x] Rate limiting and retry logic (exponential backoff, 3 attempts)
- [x] Unit tests with mocked API client — 10/10 passing

**Deliverable:** Working REST endpoints returning project and pipeline data

---

### Phase 3 — Backend Service Layer

**Goal:** Build the API layer that aggregates and serves data to the frontend.

- [x] `GET /api/projects` — list all projects in the organization
- [x] `GET /api/projects/:projectId/pipelines` — list pipelines for a project
- [x] `GET /api/pipelines/:pipelineId/status?project=<name>` — single pipeline status
- [x] `GET /api/dashboard[?refresh=true]` — aggregated summary for all projects in one request
- [x] In-memory response cache (TTL: 30s)
- [x] `GET /api/stream` — real-time updates via Server-Sent Events
- [x] Standardized error response format (`errorHandler` middleware)
- [x] Integration tests (supertest) — 21/21 passing

**Deliverable:** Documented, tested backend API

---

### Phase 4 — Frontend Dashboard

**Goal:** Visual dashboard for pipeline status.

#### 4.1 — Layout and Navigation
- [x] `StatusBar` — top bar with global counters (total / succeeded / failed / running)
- [x] `Sidebar` — project list with status dot and failure count badge; drag-to-resize
- [x] Dark-first theme (Tailwind CSS v4)

#### 4.2 — Pipeline Card Component
- [x] `PipelineCard` — name, branch, triggered by, duration, relative time label
- [x] `StatusBadge` — color-coded badge (Succeeded / Failed / Running / Queued / Canceled)
- [x] `Sparkline` — color-coded bar history for the last 10 builds
- [x] Click-through to the build result in Azure DevOps
- [x] `StageTimeline` — stage progress bar with active stage indicator and failure reasons

#### 4.3 — Project View
- [x] `ProjectView` — responsive pipeline grid for the selected project
- [x] Quick filter: All / Failed / Running
- [x] Pipeline name search
- [x] Failed pipelines automatically float to the top

#### 4.4 — Overview Screen
- [x] `OverviewView` — all projects with a 4-card preview per project
- [x] Critical alerts section — all failed pipelines surfaced at the top
- [x] "See all →" drill-down to project view
- [x] Projects with no pipelines are hidden

#### 4.5 — Real-time Updates
- [x] `useRealtimeUpdates` hook — manages SSE connection lifecycle
- [x] Exponential backoff reconnect on disconnect
- [x] Polling fallback (30s interval) if SSE is unavailable
- [x] React Query cache updated directly from SSE payloads

**Deliverable:** Fully functional, responsive dashboard UI

---

### Phase 5 — Authentication and Authorization

**Goal:** Restrict dashboard access to authorized users only.

- [ ] Azure Active Directory (Entra ID) OAuth 2.0 / MSAL integration
- [ ] Sign-in / sign-out flow
- [ ] Bind PAT to user session, or store a service account PAT in a secure environment variable
- [ ] 401 / redirect flow for unauthorized access
- [ ] (Optional) Role-based access: restrict visibility to specific Azure DevOps groups

**Deliverable:** Secure authentication flow

---

### Phase 6 — Notifications

**Goal:** Proactively alert users on pipeline failures.

- [ ] Browser push notifications (Web Notifications API) on pipeline failure
- [ ] Notification permission request flow
- [ ] Persist notification preferences (per project / per pipeline)
- [ ] (Optional) Email notification integration
- [ ] (Optional) Microsoft Teams Webhook integration

**Deliverable:** Configurable notification system

---

### Phase 7 — Deployment

**Goal:** Ship the application to an accessible environment.

- [ ] Dockerfile (frontend + backend)
- [ ] Docker Compose for local development
- [ ] Azure Static Web Apps configuration (frontend)
- [ ] Azure App Service or Azure Container Apps configuration (backend)
- [ ] CI/CD pipeline via GitHub Actions or Azure Pipelines (meta, but necessary)
- [ ] Azure Key Vault integration for secrets
- [ ] Production HTTPS enforcement and CORS configuration
- [ ] Health check endpoint (`GET /api/health`)

**Deliverable:** Accessible, production-ready deployment

---

### Phase 8 — Monitoring and Observability

**Goal:** Make the application itself observable.

- [ ] Azure Application Insights integration (frontend + backend)
- [ ] Structured logging — backend
- [ ] API error rate and latency metrics
- [ ] User interaction events (most-clicked pipelines, etc.)
- [ ] Uptime alerting

**Deliverable:** Observable, debuggable application

---

## Tech Stack

| Layer         | Technology                                          |
|---------------|-----------------------------------------------------|
| Frontend      | React 19, TypeScript, Vite, Tailwind CSS v4         |
| Data Fetching | TanStack React Query v5                             |
| Backend       | Node.js, Express                                    |
| Real-time     | Server-Sent Events (SSE), polling fallback          |
| Auth          | MSAL.js (Azure AD / Entra ID)                       |
| Testing       | Jest + supertest (backend), Vitest (frontend)       |
| CI/CD         | Azure Pipelines or GitHub Actions                   |
| Hosting       | Azure Static Web Apps + Azure App Service           |
| Monitoring    | Azure Application Insights                          |

---

## Environment Variables

```env
# Azure DevOps
AZURE_DEVOPS_ORG=<organization_name>
AZURE_DEVOPS_PAT=<personal_access_token>

# Azure AD (authentication — Phase 5)
AZURE_AD_TENANT_ID=<tenant_id>
AZURE_AD_CLIENT_ID=<client_id>

# Backend
PORT=3000
CACHE_TTL_SECONDS=30
```

---

## Roadmap

| Milestone | Phases   | Description                                                   |
|-----------|----------|---------------------------------------------------------------|
| MVP       | 1–4      | Fully functional local dashboard, PAT in `.env`, no auth      |
| v1.0      | + 5–7    | Secure, deployed, production-ready                            |
| v1.x      | + 6 + 8  | Notifications and observability                               |

---

## Contributing

Each phase should be developed on its own feature branch and merged via pull request.

Branch naming: `feature/phase-{n}-{short-description}` (e.g. `feature/phase-2-azure-api-client`)
