# AdFlow — Ad Agency Full Stack Assessment

A full-stack campaign management platform built for an advertising agency.

## Tech Stack
- **Frontend:** React 18, Tailwind CSS, Recharts, Socket.io
- **Backend:** FastAPI, PostgreSQL, SQLAlchemy, JWT Auth
- **AI:** Groq API (llama-3.3-70b-versatile)
- **Real-time:** WebSocket notifications via Socket.io
- **Docker:** AI microservice containerized

## How to Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 18
- Docker Desktop

### 1. Clone the repo
```bash
git clone https://github.com/xizt786/ad-agency-assessment.git
cd ad-agency-assessment
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/adflow
SECRET_KEY=adflow-super-secret-jwt-key-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=your-groq-api-key

Run backend:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Notifications Setup
```bash
cd notifications
uvicorn main:socket_app --port 8002 --reload
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. AI Microservice (Docker)
```bash
docker build -t adflow-ai-service ./ai-service
docker run -d -p 8001:8001 --env-file ./ai-service/.env --name adflow-ai adflow-ai-service
```

## URLs
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| AI Microservice | http://localhost:8001 |
| Notifications | http://localhost:8002 |

## Features
- Campaign performance dashboard with real-time KPIs
- 30-day trend chart with Recharts
- Sortable, filterable campaign table
- AI-powered creative brief builder (4-step form)
- JWT authentication
- Rate limiting (100 req/min)
- Soft delete on campaigns
- WebSocket real-time alerts
- Docker-ready AI microservice
- Dark/light mode
