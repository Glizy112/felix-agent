# Felix - Personal Productivity Agent

> A SaaS web app that helps users manage tasks, schedules, and info by interacting with multiple tools and data sources via MCP.

## Features (Prototype)

- **Smart Task Manager** - Create, edit, complete, and delete tasks with auto-priority scoring
- **Calendar Integration** - View Google Calendar events (via MCP with fallback to sample data)
- **Workflow Agent** - Chat-based AI assistant that suggests tasks and answers queries
- **Productivity Dashboard** - Visual analytics with charts and efficiency tracking

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS + Recharts |
| Backend | Python FastAPI |
| Database | SQLite |
| Icons | Lucide React |

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed database with sample data
python seed.py

# Start the server
python main.py
```

Backend runs at: `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

## Project Structure

```
felix/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # SQLAlchemy models & DB setup
│   ├── schemas.py              # Pydantic schemas
│   ├── seed.py                 # Sample data seeder
│   ├── requirements.txt        # Python dependencies
│   └── routers/
│       ├── tasks.py            # Task CRUD + priority scoring
│       ├── calendar.py         # Calendar events (MCP proxy)
│       ├── agent.py            # Agent chat + suggestions
│       └── analytics.py        # Productivity stats
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main app with sidebar nav
│   │   ├── api.js              # API client functions
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── AgentPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## API Endpoints

### Tasks
- `GET /api/tasks/` - Get all tasks (sorted by priority)
- `POST /api/tasks/` - Create a task
- `GET /api/tasks/{id}` - Get single task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/complete` - Mark task complete

### Calendar
- `GET /api/calendar/events` - Get calendar events
- `GET /api/calendar/today` - Get today's events
- `POST /api/calendar/sync` - Force sync calendar

### Agent
- `POST /api/agent/chat` - Chat with agent
- `GET /api/agent/suggestions` - Get task suggestions
- `POST /api/agent/create-task-from-suggestion` - Create task from suggestion

### Analytics
- `GET /api/analytics/today` - Today's stats
- `GET /api/analytics/weekly` - Weekly stats
- `GET /api/analytics/summary` - Overall summary

## Demo Flow

1. **Home** - Show overview of Felix features
2. **Tasks** - Create a task, show priority sorting, mark complete
3. **Calendar** - Show synced events (sample data for demo)
4. **Agent** - Ask "What's on my calendar?" or "Show my tasks"
5. **Dashboard** - Show productivity charts and trends

## Google Calendar MCP

For production use, set up the Google Calendar MCP server and configure:
```bash
export GOOGLE_CALENDAR_MCP_URL=http://localhost:3001
```

The prototype falls back to sample demo data when MCP is not connected.

## Future Roadmap

- Hierarchical agents (sub-agents)
- Flexibility modifiers/rules engine
- Multiple MCP integrations (Gmail, Keep, Maps)
- Community agents marketplace
- Advanced ML priority learning
- User authentication

## License

MIT
