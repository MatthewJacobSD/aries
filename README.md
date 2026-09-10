# Aries

**The operating workspace for creator agencies.**

Aries connects creator management, campaigns, tasks, client workspaces, and revenue in one operational workspace. Built for modern creator agencies that need clear visibility into their operations, financials, and relationships.

---

## Architecture

```
aries/
├── frontend/                  # Static HTML/CSS/JS frontend
│   ├── css/                   # Stylesheets (design system)
│   ├── js/                    # Client-side JavaScript
│   ├── images/                # Visual assets
│   ├── *.html                 # Page templates
│   └── package.json           # Dev tooling (ESLint, Prettier)
│
├── backend/                   # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Settings management
│   │   ├── auth/              # Authentication & RBAC
│   │   ├── devices/           # Phone farm management
│   │   ├── automation/        # Content automation engine
│   │   ├── integrations/      # Fanvue, Telegram connectors
│   │   ├── payments/          # Stripe payment processing
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── ws/                # WebSocket handlers
│   │   └── api/               # REST API endpoints
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment template
│   └── Dockerfile             # Container definition
│
├── mobile-agent/              # Phone companion apps
│   ├── android/               # Android agent (ADB control)
│   └── ios/                   # iOS agent (screen capture)
│
├── docker-compose.yml         # Local development stack
└── .gitignore                 # Ignored files
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JS | Dashboard UI, marketing pages |
| **Backend** | Python 3.12, FastAPI | API server, WebSocket hub |
| **Database** | PostgreSQL 16 | Persistent data storage |
| **Cache** | Redis 7 | Real-time state, job queues |
| **Auth** | JWT (python-jose) | Stateless authentication |
| **Payments** | Stripe | Creator payouts, invoices |
| **Device Control** | ADB (Android), libimobiledevice (iOS) | Phone farm management |
| **Containerization** | Docker, Docker Compose | Local development environment |

---

## Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--cream` | `#f4efe6` | Primary text |
| `--ink` | `#0c0b09` | Background |
| `--panel` | `#141311` | Card backgrounds |
| `--gold` | `#d6b36a` | Accent, highlights |
| `--good` | `#7dcea0` | Success states |
| `--warning` | `#d8b878` | Warning states |

### Typography

- **Headings:** Cormorant Garamond (serif)
- **Body:** Inter (sans-serif)
- **Data:** JetBrains Mono (monospace)

### Components

- Cards (feature, step, metric, activity)
- Dashboard shell (sidebar + main + chat)
- Metrics grid
- Ledger tables
- Task queues
- Activity timelines
- Log streams

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+ (for frontend tooling)
- Docker & Docker Compose (optional)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/MatthewJacobSD/aries.git
cd aries

# 2. Start backend services
docker compose up -d db redis

# 3. Set up Python environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 4. Start the backend
uvicorn app.main:app --reload --port 8000

# 5. Open frontend
cd ../frontend
# Open index.html in a browser, or use a local server:
npx serve .
```

### Available Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Backend health check |
| `GET /docs` | Interactive API documentation (Swagger UI) |
| `GET /redoc` | API documentation (ReDoc) |

---

## Project Structure

### Pages

| Page | Purpose |
|------|---------|
| `index.html` | Landing page with platform overview |
| `dashboard.html` | Main workspace (8 panes) |
| `login.html` | User authentication |
| `register.html` | Account creation |
| `onboarding.html` | 4-step workspace setup |
| `creators.html` | Creator management overview |
| `creator-voss.html` | Individual creator profile |
| `campaigns.html` | Campaign management overview |
| `campaign-atlas.html` | Individual campaign detail |
| `tasks.html` | Task queue and management |
| `clients.html` | Client workspace management |
| `revenue.html` | Financial tracking and ledger |
| `settings.html` | Workspace configuration |

### Dashboard Panes

1. **Overview** — Cash, work in flight, rooms needing reply
2. **Revenue** — Gross, fees, outstanding balances
3. **Creators** — People on the book
4. **Campaigns** — Work with a name
5. **Tasks** — What needs attention
6. **Clients** — Rooms, not inboxes
7. **Integrations** — Connected services
8. **Settings** — Workspace configuration

---

## Development

### Frontend Tooling

```bash
cd frontend
npm install

# Lint JavaScript
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn app.main:app --reload

# Run tests (when implemented)
pytest

# Type checking (when implemented)
mypy app/
```

---

## Roadmap

- [ ] Backend API implementation (FastAPI)
- [ ] PostgreSQL database models
- [ ] JWT authentication flow
- [ ] WebSocket real-time updates
- [ ] Phone farm device management
- [ ] Android agent app
- [ ] iOS agent app
- [ ] Fanvue API integration
- [ ] Telegram bot integration
- [ ] Stripe payment processing
- [ ] Content automation engine
- [ ] Dashboard data binding

---

## License

ISC

---

## Author

MatthewJacobSD
