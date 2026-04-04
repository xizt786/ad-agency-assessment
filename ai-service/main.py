from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os
import json
import uuid
import logging
from datetime import datetime, timezone
from openai import OpenAI

load_dotenv()

# ── Logging setup ─────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AdFlow AI Microservice",
    description="Standalone AI content generation service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


client = OpenAI(
    api_key=os.getenv("GROK_API_KEY"),
    base_url="https://api.x.ai/v1",
)

# ── Request logging middleware ────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = datetime.now(timezone.utc)
    logger.info(f"[{request_id}] → {request.method} {request.url.path}")
    response = await call_next(request)
    duration = (datetime.now(timezone.utc) - start).total_seconds()
    logger.info(f"[{request_id}] ← {response.status_code} ({duration:.3f}s)")
    response.headers["X-Request-ID"] = request_id
    return response

# ── Schemas ───────────────────────────────────────────────
class CopyRequest(BaseModel):
    product: str
    tone: str
    platform: str
    word_limit: int = 100

class SocialRequest(BaseModel):
    platform: str
    campaign_goal: str
    brand_voice: str

class HashtagRequest(BaseModel):
    content: str
    industry: str

# ── Routes ────────────────────────────────────────────────

# GET /health
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "claude-sonnet-4-20250514",
        "service": "AdFlow AI Microservice",
        "version": "1.0.0",
        "endpoints": [
            "POST /generate/copy",
            "POST /generate/social",
            "POST /generate/hashtags",
            "GET /health",
        ]
    }

# POST /generate/copy — SSE streaming
@app.post("/generate/copy")
async def generate_copy(data: CopyRequest):
    def stream():
        with client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": f"""Generate advertising copy:
Product: {data.product}
Tone: {data.tone}
Platform: {data.platform}
Word limit: {data.word_limit}

Respond ONLY with valid JSON:
{{
  "headline": "catchy headline",
  "body": "body copy",
  "cta": "call to action"
}}"""
            }]
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'chunk': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")

# POST /generate/social
@app.post("/generate/social")
def generate_social(data: SocialRequest):
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Generate 5 social media captions:
Platform: {data.platform}
Goal: {data.campaign_goal}
Brand voice: {data.brand_voice}

Respond ONLY with valid JSON:
{{
  "captions": ["caption1","caption2","caption3","caption4","caption5"]
}}"""
        }]
    )
    try:
        return json.loads(message.content[0].text)
    except json.JSONDecodeError:
        return {"captions": [message.content[0].text]}

# POST /generate/hashtags
@app.post("/generate/hashtags")
def generate_hashtags(data: HashtagRequest):
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": f"""Generate 10 hashtags:
Content: {data.content}
Industry: {data.industry}

Respond ONLY with valid JSON:
{{
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"]
}}"""
        }]
    )
    try:
        return json.loads(message.content[0].text)
    except json.JSONDecodeError:
        return {"hashtags": []}