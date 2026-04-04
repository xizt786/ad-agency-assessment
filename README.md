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
