# Aries

**The operating workspace for creator agencies.**

Aries connects creator management, campaigns, tasks, client workspaces, and revenue in one operational workspace. Built for modern creator agencies that need clear visibility into their operations, financials, and relationships.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Design System](#design-system)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Role-Based Access Control](#role-based-access-control)
- [Frontend Pages](#frontend-pages)
- [Mobile Agent](#mobile-agent)
- [Getting Started](#getting-started)
- [Development](#development)
- [Current Status](#current-status)

---

## Overview

Aries is a full-stack web application for managing creator agencies. It provides:

- **Creator Management** — Profiles, platform connections, revenue shares
- **Campaign Management** — Briefs, deliverables, approvals, completion tracking
- **Task Management** — Assignments, due dates, blockers, ownership
- **Client Workspaces** — Shared visibility, briefs, approvals, communication
- **Revenue Tracking** — Gross intake, fees, splits, payouts, reconciliation
- **Device Management** — Phone farm registration, monitoring, remote control
- **Automation** — Content scheduling, job management, execution logs
- **Integrations** — Fanvue, Telegram, Stripe (placeholders)
- **Role-Based Access** — Admin, Creator, Buyer roles with different permissions

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Frontend (HTML/CSS/JS)                 │  │
│  │  • Marketing pages (index, about, feature pages)         │  │
│  │  • Dashboard (10 panes, role-based visibility)           │  │
│  │  • Auth pages (login, register, onboarding)              │  │
│  │  • Detail pages (creator, campaign, client, device, job)  │  │
│  │  • Payment pages (invoices, payouts)                     │  │
│  │  • Settings (profile, password, session)                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP-only cookie (aries_session)
                              │ credentials: "include"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Python FastAPI)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     API Layer                             │  │
│  │  • Auth (8 endpoints) — login, register, logout, me      │  │
│  │  • Creators (6) — CRUD + stats                           │  │
│  │  • Campaigns (5) — CRUD with creator linking             │  │
│  │  • Tasks (3) — list, create, update                      │  │
│  │  • Clients (3) — list, create, get                       │  │
│  │  • Devices (6) — CRUD + status + logs                    │  │
│  │  • Automation (7) — CRUD + pause/resume/cancel + logs    │  │
│  │  • Payments (7) — revenue, payouts, invoices, webhook    │  │
│  │  • Integrations (6) — Fanvue, Telegram, disconnect       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Service Layer                           │  │
│  │  • JWT authentication (python-jose)                      │  │
│  │  • Password hashing (bcrypt)                             │  │
│  │  • RBAC policies (admin, creator, buyer)                 │  │
│  │  • HTTP-only cookie session management                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Data Layer                              │  │
│  │  • SQLAlchemy ORM (async)                                │  │
│  │  • SQLite (development) / PostgreSQL (production)        │  │
│  │  • 10 database tables                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket / REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Mobile Agent                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   Android Agent   │    │   iOS Agent       │                  │
│  │   (Kotlin)        │    │   (Swift)         │                  │
│  │   • Screen capture│    │   • Screen capture│                  │
│  │   • Remote control│    │   • Remote control│                  │
│  │   • Device status │    │   • Device status │                  │
│  └──────────────────┘    └──────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
1. User opens dashboard.html
2. browser.js calls GET /api/auth/me with credentials: "include"
3. Backend reads aries_session cookie → decodes JWT → returns user
4. If 401 → redirect to login.html
5. If 200 → load dashboard with role-based pane visibility
6. API calls use credentials: "include" for all requests
7. Logout calls POST /api/auth/logout → clears cookie
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JS | Dashboard UI, marketing pages, auth flows |
| **Backend** | Python 3.12, FastAPI | API server, WebSocket hub, business logic |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Persistent data storage |
| **Auth** | JWT (python-jose) + HTTP-only cookies | Stateless authentication, secure sessions |
| **Password Hashing** | bcrypt (passlib) | Secure password storage |
| **Payments** | Stripe (placeholder) | Creator payouts, invoices |
| **Device Control** | ADB (Android), libimobiledevice (iOS) | Phone farm management |
| **Containerization** | Docker, Docker Compose | Local development environment |

---

## Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--cream` | `#f4efe6` | Primary text |
| `--ink` | `#0c0b09` | Background |
| `--panel` | `#141311` | Card backgrounds |
| `--panel-soft` | `#181714` | Elevated surfaces |
| `--panel-raised` | `#1c1a17` | Hover states |
| `--line` | `rgba(244, 239, 230, 0.12)` | Borders |
| `--muted` | `rgba(244, 239, 230, 0.62)` | Secondary text |
| `--gold` | `#d6b36a` | Accent, highlights |
| `--gold-soft` | `rgba(214, 179, 106, 0.12)` | Gold backgrounds |
| `--gold-line` | `rgba(214, 179, 106, 0.3)` | Gold borders |
| `--good` | `#7dcea0` | Success states |
| `--warning` | `#d8b878` | Warning states |

### Typography

| Font | Weight | Usage |
|------|--------|-------|
| Cormorant Garamond | 400, 600 | Headings, metric values, logos |
| Inter | 300, 400, 500, 600 | Body text, navigation |
| JetBrains Mono | 400, 500 | Code, data, timestamps |

### Font Scale

| Token | Size | Usage |
|-------|------|-------|
| `--fs-micro` | 0.5rem | Status indicators |
| `--fs-badge` | 0.62rem | Badges, table headers |
| `--fs-nav` | 0.68rem | Navigation links |
| `--fs-body-sm` | 0.72rem | Small body text |
| `--fs-body` | 0.78rem | Default body text |
| `--fs-body-lg` | 0.82rem | Queue items, strong labels |
| `--fs-heading-sm` | 1.3rem | Section headings |
| `--fs-display` | 1.8rem | Metric values |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 0.65rem | Tight gaps |
| `--space-sm` | 0.75rem | Component gaps |
| `--space-md` | 1rem | Standard gaps |
| `--space-lg` | 1.5rem | Section spacing |

### Components

| Component | Files | Description |
|-----------|-------|-------------|
| Empty State | `empty-state.css` | Icon, title, description, variants |
| Modal | `components.css` | Overlay, form container |
| Detail Page | `components.css` | Entity detail view layout |
| Dashboard Shell | `dashboard.css` | Sidebar + main + chat layout |
| Auth Forms | `auth.css` | Login, register, onboarding |
| Settings | `settings.css` | Profile, password, session |
| Campaign Detail | `campaign.css` | Campaign-specific styles |
| Creator Detail | `creator.css` | Creator-specific styles |

### Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| 1180px | Grid adjustments |
| 1080px | Dashboard collapses to single column |
| 800px | Mobile menu toggle, sidebar becomes slide-out drawer |
| 560px | Full mobile layout, reduced padding |

---

## Data Models

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User      │       │   Creator   │       │  Campaign   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id           │       │ id          │       │ id          │
│ email        │       │ name        │       │ name        │
│ full_name    │       │ platform    │       │ client_id   │──→ Client
│ hashed_pwd   │       │ handle      │       │ creator_ids │
│ role         │       │ email       │       │ budget      │
│ created_at   │       │ rev_share   │       │ start_date  │
│ updated_at   │       │ status      │       │ end_date    │
└─────────────┘       │ created_at  │       │ status      │
                      │ updated_at  │       │ created_at  │
                      └─────────────┘       │ updated_at  │
                             │              └─────────────┘
                             │                     │
                             │              ┌─────────────┐
                             │              │    Task      │
                             │              ├─────────────┤
                             │              │ id          │
                             │              │ title       │
                             │              │ campaign_id │──→ Campaign
                             │              │ assigned_to │──→ Creator
                             │              │ due_date    │
                             │              │ priority    │
                             │              │ status      │
                             │              └─────────────┘
                             │
                      ┌─────────────┐       ┌─────────────┐
                      │   Device    │       │AutomationJob│
                      ├─────────────┤       ├─────────────┤
                      │ id          │       │ id          │
                      │ name        │       │ name        │
                      │ platform    │       │ creator_id  │──→ Creator
                      │ serial      │       │ device_id   │──→ Device
                      │ creator_id  │──→ Creator│ type     │
                      │ status      │       │ schedule    │
                      └─────────────┘       │ payload     │
                                            │ status      │
                                            └─────────────┘

                      ┌─────────────┐       ┌─────────────┐
                      │   Payout    │       │   Invoice   │
                      ├─────────────┤       ├─────────────┤
                      │ id          │       │ id          │
                      │ creator_id  │──→ Creator│ client_id│──→ Client
                      │ amount      │       │ campaign_id │──→ Campaign
                      │ currency    │       │ amount      │
                      │ description │       │ currency    │
                      │ status      │       │ due_date    │
                      └─────────────┘       │ line_items  │
                                            │ status      │
                                            └─────────────┘

                      ┌─────────────┐
                      │ Integration │
                      ├─────────────┤
                      │ id          │
                      │ creator_id  │──→ Creator
                      │ type        │ (fanvue, telegram)
                      │ status      │
                      │ config      │
                      └─────────────┘
```

### Table Summary

| Table | Records | Key Relationships |
|-------|---------|-------------------|
| users | User accounts | — |
| creators | Creator profiles | — |
| campaigns | Campaign records | → clients, → creators (JSON array) |
| tasks | Task items | → campaigns, → creators |
| clients | Client records | — |
| devices | Phone farm devices | → creators |
| automation_jobs | Automation jobs | → creators, → devices |
| payouts | Payout records | → creators |
| invoices | Invoice records | → clients, → campaigns |
| integrations | Connected services | → creators |

---

## API Endpoints

### Auth (8 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account (first user = admin) |
| POST | `/api/auth/login` | No | Login, sets HTTP-only cookie |
| POST | `/api/auth/logout` | Yes | Clear session cookie |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/me` | Yes | Update profile (name, email) |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset with token |
| POST | `/api/auth/change-password` | Yes | Change password |

### Creators (6 endpoints)

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/creators` | Yes | reader+ |
| POST | `/api/creators` | Yes | admin |
| GET | `/api/creators/:id` | Yes | reader+ |
| PUT | `/api/creators/:id` | Yes | manager+ |
| DELETE | `/api/creators/:id` | Yes | admin |
| GET | `/api/creators/:id/stats` | Yes | reader+ |

### Campaigns (5 endpoints)

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/campaigns` | Yes | reader+ |
| POST | `/api/campaigns` | Yes | manager+ |
| GET | `/api/campaigns/:id` | Yes | reader+ |
| PUT | `/api/campaigns/:id` | Yes | manager+ |
| DELETE | `/api/campaigns/:id` | Yes | manager+ |

### Tasks (3 endpoints)

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/tasks` | Yes | reader+ |
| POST | `/api/tasks` | Yes | manager+ |
| PUT | `/api/tasks/:id` | Yes | manager+ |

### Clients (3 endpoints)

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/clients` | Yes | reader+ |
| POST | `/api/clients` | Yes | admin |
| GET | `/api/clients/:id` | Yes | reader+ |

### Devices (6 endpoints)

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/devices` | Yes | manager+ |
| POST | `/api/devices` | Yes | manager+ |
| GET | `/api/devices/:id` | Yes | manager+ |
| PATCH | `/api/devices/:id/status` | Yes | manager+ |
| DELETE | `/api/devices/:id` | Yes | manager+ |
| GET | `/api/devices/:id/logs` | Yes | manager+ |

### Automation (7 endpoints)

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/automation/jobs` | Yes | manager+ |
| POST | `/api/automation/jobs` | Yes | manager+ |
| GET | `/api/automation/jobs/:id` | Yes | manager+ |
| POST | `/api/automation/jobs/:id/pause` | Yes | manager+ |
| POST | `/api/automation/jobs/:id/resume` | Yes | manager+ |
| DELETE | `/api/automation/jobs/:id` | Yes | manager+ |
| GET | `/api/automation/jobs/:id/logs` | Yes | manager+ |

### Payments (7 endpoints)

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/payments/revenue` | Yes | reader+ |
| GET | `/api/payments/payouts` | Yes | reader+ |
| POST | `/api/payments/payouts` | Yes | admin |
| GET | `/api/payments/payouts/:id` | Yes | reader+ |
| GET | `/api/payments/invoices` | Yes | reader+ |
| POST | `/api/payments/invoices` | Yes | admin |
| POST | `/api/payments/webhook` | No | — (Stripe) |

### Integrations (6 endpoints)

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/integrations` | Yes | manager+ |
| POST | `/api/integrations/fanvue` | Yes | admin |
| GET | `/api/integrations/fanvue/:id/stats` | Yes | manager+ |
| POST | `/api/integrations/telegram` | Yes | admin |
| POST | `/api/integrations/telegram/:id/send` | Yes | admin |
| DELETE | `/api/integrations/:id` | Yes | admin |

**Total: 51 API endpoints**

---

## Role-Based Access Control

### Roles

| Role | Label | Description |
|------|-------|-------------|
| `admin` | Agency Owner | Full access to all features |
| `creator` | Creator | Own campaigns, tasks, devices, revenue |
| `buyer` | Client/Buyer | Browse creators, view purchased content |

### Permission Matrix

| Resource | admin | creator | buyer |
|----------|-------|---------|-------|
| **Users** | CRUD | Read | Read |
| **Creators** | CRUD | Read | Read |
| **Campaigns** | CRUD | CRUD | Read |
| **Tasks** | CRUD | CRUD | Read |
| **Clients** | CRUD | Read | None |
| **Devices** | CRUD | CRUD | None |
| **Automation** | CRUD | CRUD | None |
| **Payments** | CRUD | Read | Read |
| **Integrations** | CRUD | Read | None |
| **Settings** | Full | Limited | Limited |

### Dashboard Visibility

| Pane | admin | creator | buyer |
|------|-------|---------|-------|
| Overview | Full | Full | Full |
| Revenue | Full | Full | Hidden |
| Creators | Full | Hidden | Hidden |
| Campaigns | Full | Full | Full |
| Tasks | Full | Full | Full |
| Clients | Full | Hidden | Hidden |
| Devices | Full | Hidden | Hidden |
| Automation | Full | Hidden | Hidden |
| Integrations | Full | Hidden | Hidden |
| Settings | Full | Full | Hidden |

### Registration Logic

- **First user** → `admin` role (agency owner)
- **All subsequent users** → `creator` role
- **Buyer** → assigned manually or via invite

---

## Frontend Pages

### Auth Pages

| Page | Purpose | API |
|------|---------|-----|
| `login.html` | User login | `POST /api/auth/login` |
| `register.html` | Account creation | `POST /api/auth/register` |
| `onboarding.html` | 4-step workspace setup | `POST /api/auth/complete-onboarding` |
| `forgot-password.html` | Request password reset | `POST /api/auth/forgot-password` |
| `reset-password.html` | Reset with token | `POST /api/auth/reset-password` |

### Dashboard

| Page | Purpose | Panes |
|------|---------|-------|
| `dashboard.html` | Main workspace | 10 panes (role-filtered) |

### Detail Pages

| Page | Purpose | API |
|------|---------|-----|
| `creator-detail.html` | Dynamic creator profile | `GET /api/creators/:id` |
| `campaign-detail.html` | Dynamic campaign profile | `GET /api/campaigns/:id` |
| `client-detail.html` | Dynamic client profile | `GET /api/clients/:id` |
| `device-detail.html` | Device status + logs | `GET /api/devices/:id` |
| `job-detail.html` | Automation job + controls | `GET /api/automation/jobs/:id` |

### Payment Pages

| Page | Purpose | API |
|------|---------|-----|
| `invoices.html` | List/create invoices | `GET/POST /api/payments/invoices` |
| `payouts.html` | List/create payouts | `GET/POST /api/payments/payouts` |

### Settings

| Page | Purpose | API |
|------|---------|-----|
| `settings.html` | Profile, password, session | `PUT /api/auth/me`, `POST /api/auth/change-password` |

### Marketing Pages

| Page | Purpose |
|------|---------|
| `index.html` | Landing page with platform overview |
| `about.html` | About page with project vision |
| `creators.html` | Creator management feature page |
| `campaigns.html` | Campaign management feature page |
| `tasks.html` | Task management feature page |
| `clients.html` | Client workspace feature page |
| `revenue.html` | Revenue tracking feature page |
| `integration.html` | Integrations feature page |

---

## Mobile Agent

### Android Agent (Kotlin)

```
mobile-agent/android/
├── app/
│   ├── src/main/
│   │   ├── java/com/aries/agent/
│   │   │   ├── AriesAgentApp.kt     # Application + notification
│   │   │   ├── MainActivity.kt      # Connect/disconnect UI
│   │   │   ├── DeviceService.kt     # Foreground service
│   │   │   ├── WebSocketClient.kt   # Backend communication
│   │   │   ├── ScreenCapture.kt     # Screenshot capture
│   │   │   └── CommandExecutor.kt   # Remote tap/swipe/type
│   │   └── AndroidManifest.xml
│   ├── build.gradle.kts
│   └── proguard-rules.pro
├── build.gradle.kts
└── settings.gradle.kts
```

### iOS Agent (Swift)

```
mobile-agent/ios/
├── AriesAgent/
│   ├── AriesAgentApp.swift          # SwiftUI app entry
│   ├── ContentView.swift            # Connection UI
│   ├── Services/
│   │   ├── DeviceManager.swift      # WebSocket + commands
│   │   ├── ScreenCapture.swift      # Screenshot capture
│   │   └── DeviceAPI.swift          # Backend registration
│   └── Models/
│       └── AgentModels.swift        # Data models
└── Package.swift
```

### Agent Features

| Feature | Android | iOS |
|---------|---------|-----|
| Register device | ADB serial | Device identifier |
| Screen capture | VirtualDisplay | UIGraphicsImageRenderer |
| Remote tap | AccessibilityService | Accessibility API |
| Remote swipe | AccessibilityService | Accessibility API |
| Type text | AccessibilityService | — |
| Status reporting | WebSocket | WebSocket |
| Background service | ForegroundService | Background session |

---

## Session Management

### HTTP-Only Cookie Flow

```
1. User submits login form
2. Frontend sends POST /api/auth/login with credentials: "include"
3. Backend validates credentials, creates JWT
4. Backend sets HTTP-only cookie: aries_session=<jwt>
5. Browser stores cookie (not accessible via JavaScript)
6. All subsequent requests include cookie automatically
7. Backend reads cookie, decodes JWT, returns user data
8. Logout clears the cookie
```

### Cookie Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| Name | `aries_session` | Cookie identifier |
| HttpOnly | `true` | Not accessible via JavaScript |
| Secure | `false` (dev) | `true` in production (HTTPS) |
| SameSite | `lax` | Sends on navigation |
| Max-Age | 86400 | 24 hours |

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+ (for frontend tooling)
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/MatthewJacobSD/aries.git
cd aries

# 2. Set up backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 3. Start backend
uvicorn app.main:app --reload --port 8000

# 4. Open frontend (new terminal)
cd ../frontend
npx serve . -l 3000

# 5. Open browser
# http://localhost:3000
```

### First User

1. Open `http://localhost:3000/register.html`
2. Create an account (first user gets `admin` role)
3. Complete onboarding (select your role)
4. Access the dashboard

### Backend API Docs

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/health`

---

## Development

### Frontend

```bash
cd frontend
npm install

# Lint
npm run lint

# Format
npm run format
```

### Backend

```bash
cd backend
source venv/bin/activate

# Run with auto-reload
uvicorn app.main:app --reload --port 8000

# Run tests
python -m pytest

# Check Python syntax
python -m py_compile app/main.py
```

### Database

```bash
# SQLite (default, no setup needed)
# Database file: backend/aries.db

# Access via Python
cd backend
venv/Scripts/python -c "
import sqlite3
conn = sqlite3.connect('aries.db')
cursor = conn.cursor()
cursor.execute(\"SELECT name FROM sqlite_master WHERE type='table'\")
print([r[0] for r in cursor.fetchall()])
conn.close()
"
```

---

## Current Status

### Completed

- [x] Frontend design system (CSS variables, responsive)
- [x] Marketing pages (landing, features, about)
- [x] Auth pages (login, register, onboarding, forgot/reset password)
- [x] Dashboard with 10 panes and role-based visibility
- [x] Detail pages (creator, campaign, client, device, job)
- [x] Payment pages (invoices, payouts)
- [x] Settings page (profile, password, session)
- [x] Backend API (51 endpoints across 9 modules)
- [x] SQLAlchemy models (10 tables)
- [x] JWT authentication with HTTP-only cookies
- [x] RBAC system (admin, creator, buyer)
- [x] Role-based dashboard navigation
- [x] Android mobile agent (Kotlin)
- [x] iOS mobile agent (Swift)
- [x] Postman collections (API documentation)
- [x] Unified CSS stylesheet (aries.css)
- [x] Empty state components with icons

### In Progress

- [ ] WebSocket real-time updates
- [ ] Phone farm device control (ADB integration)
- [ ] Content automation engine

### Planned

- [ ] Fanvue API integration
- [ ] Telegram bot integration
- [ ] Stripe payment processing
- [ ] Email notifications
- [ ] File upload/management
- [ ] Search and filtering
- [ ] Analytics dashboard
- [ ] Multi-workspace support

---

## License

ISC

---

## Author

MatthewJacobSD
