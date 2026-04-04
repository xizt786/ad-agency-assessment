from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.database import engine, Base
from app.routers import auth, campaigns, ai
from dotenv import load_dotenv

load_dotenv()

# Rate limiter — max 100 requests/minute per IP
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(
    title="AdFlow API",
    description="Campaign Management & AI Content Generation API",
    version="1.0.0",
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allows frontend on port 5173 to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(campaigns.router)
app.include_router(ai.router)

# Startup event to create tables
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {
        "message": "AdFlow API is running",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "healthy"}