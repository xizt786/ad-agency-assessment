from dotenv import load_dotenv
import os
load_dotenv()

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.routers.auth import get_current_user
from app.models.user import User
from groq import Groq
import json

router = APIRouter(prefix="/generate", tags=["AI Generation"])

client = Groq(api_key=os.getenv("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"))
MODEL = "llama-3.3-70b-versatile"

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

class BriefRequest(BaseModel):
    clientName: str
    industry: str
    website: Optional[str] = ""
    competitors: Optional[str] = ""
    objective: str
    targetAudience: str
    budget: Optional[str] = ""
    tone: str
    imageryStyle: Optional[str] = ""
    colorDirection: Optional[str] = ""
    dos: Optional[str] = ""
    donts: Optional[str] = ""

# ── Routes ────────────────────────────────────────────────

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model": MODEL,
        "provider": "xAI Grok",
        "endpoints": [
            "POST /generate/copy",
            "POST /generate/social",
            "POST /generate/hashtags",
            "POST /generate/brief",
            "GET /generate/health",
        ]
    }

@router.post("/copy")
def generate_copy(
    data: CopyRequest,
    current_user: User = Depends(get_current_user),
):
    def stream():
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=500,
            stream=True,
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
        )
        for chunk in response:
            text = chunk.choices[0].delta.content or ""
            if text:
                yield f"data: {json.dumps({'chunk': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")

@router.post("/social")
def generate_social(
    data: SocialRequest,
    current_user: User = Depends(get_current_user),
):
    response = client.chat.completions.create(
        model=MODEL,
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
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        return {"captions": [response.choices[0].message.content]}

@router.post("/hashtags")
def generate_hashtags(
    data: HashtagRequest,
    current_user: User = Depends(get_current_user),
):
    response = client.chat.completions.create(
        model=MODEL,
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
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        return {"hashtags": []}

@router.post("/brief")
def generate_brief(
    data: BriefRequest,
    current_user: User = Depends(get_current_user),
):
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=1500,
        messages=[{
            "role": "user",
            "content": f"""You are a senior creative director. Generate a creative direction document:

Client: {data.clientName}
Industry: {data.industry}
Website: {data.website}
Competitors: {data.competitors}
Objective: {data.objective}
Target Audience: {data.targetAudience}
Budget: {data.budget}
Tone: {data.tone}
Imagery: {data.imageryStyle}
Colors: {data.colorDirection}
Do's: {data.dos}
Don'ts: {data.donts}

Respond ONLY with valid JSON, no markdown:
{{
  "campaignTitle": "string",
  "headlines": ["h1", "h2", "h3"],
  "toneOfVoice": "string",
  "channels": [{{"name": "string", "allocation": 30}}],
  "heroImageConcept": "string",
  "keyMessages": ["m1", "m2", "m3"]
}}"""
        }]
    )
    try:
        text = response.choices[0].message.content
        clean = text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid response")