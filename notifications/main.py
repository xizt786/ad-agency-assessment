from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import asyncio

load_dotenv()

# ── Database setup ────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(String, nullable=False)
    campaign_name = Column(String, nullable=False)
    alert_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="warning")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AlertRule(Base):
    __tablename__ = "alert_rules"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(String, nullable=False)
    metric = Column(String, nullable=False)
    operator = Column(String, nullable=False)
    threshold = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)

Base.metadata.create_all(bind=engine)

# ── Socket.IO setup ───────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=True,
)

app = FastAPI(title="AdFlow Notifications")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# ── Alert rule engine ─────────────────────────────────────
def check_rules(campaign: dict, db) -> list:
    triggered = []
    rules = db.query(AlertRule).filter(
        AlertRule.campaign_id == campaign["id"],
        AlertRule.is_active == True,
    ).all()

    for rule in rules:
        value = campaign.get(rule.metric, 0)
        triggered_flag = False

        if rule.operator == "lt" and value < rule.threshold:
            triggered_flag = True
        elif rule.operator == "gt" and value > rule.threshold:
            triggered_flag = True
        elif rule.operator == "gte" and value >= rule.threshold:
            triggered_flag = True
        elif rule.operator == "lte" and value <= rule.threshold:
            triggered_flag = True

        if triggered_flag:
            triggered.append({
                "campaign_id": campaign["id"],
                "campaign_name": campaign.get("name", "Unknown"),
                "alert_type": rule.metric,
                "message": f"{campaign.get('name')} — {rule.metric} is {value} (threshold: {rule.operator} {rule.threshold})",
                "severity": "critical" if rule.metric == "spend_pct" else "warning",
            })

    # Built-in default rules
    spend_pct = (campaign.get("spend", 0) / campaign.get("budget", 1)) * 100
    if spend_pct >= 90:
        triggered.append({
            "campaign_id": campaign["id"],
            "campaign_name": campaign.get("name", "Unknown"),
            "alert_type": "budget_warning",
            "message": f"{campaign.get('name')} has used {spend_pct:.1f}% of budget",
            "severity": "critical",
        })

    ctr = campaign.get("ctr", 0)
    if ctr < 1.0:
        triggered.append({
            "campaign_id": campaign["id"],
            "campaign_name": campaign.get("name", "Unknown"),
            "alert_type": "low_ctr",
            "message": f"{campaign.get('name')} CTR dropped to {ctr:.2f}% (below 1%)",
            "severity": "warning",
        })

    return triggered

# ── Socket events ─────────────────────────────────────────
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio.emit("connected", {"message": "Connected to AdFlow notifications"}, to=sid)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def check_campaign(sid, data):
    """Client sends campaign data, server checks rules and fires alerts"""
    db = SessionLocal()
    try:
        alerts = check_rules(data, db)
        for alert_data in alerts:
            alert = Alert(**alert_data)
            db.add(alert)
            db.commit()
            db.refresh(alert)
            await sio.emit("alert", {
                "id": str(alert.id),
                "campaign_id": alert.campaign_id,
                "campaign_name": alert.campaign_name,
                "alert_type": alert.alert_type,
                "message": alert.message,
                "severity": alert.severity,
                "is_read": alert.is_read,
                "created_at": alert.created_at.isoformat(),
            }, to=sid)
    finally:
        db.close()

# ── REST endpoints ─────────────────────────────────────────
@app.get("/alerts")
def get_alerts():
    db = SessionLocal()
    try:
        alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(50).all()
        return [{
            "id": str(a.id),
            "campaign_id": a.campaign_id,
            "campaign_name": a.campaign_name,
            "alert_type": a.alert_type,
            "message": a.message,
            "severity": a.severity,
            "is_read": a.is_read,
            "created_at": a.created_at.isoformat(),
        } for a in alerts]
    finally:
        db.close()

@app.put("/alerts/{alert_id}/read")
def mark_read(alert_id: str):
    db = SessionLocal()
    try:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.is_read = True
            db.commit()
        return {"message": "Marked as read"}
    finally:
        db.close()

@app.put("/alerts/read-all")
def mark_all_read():
    db = SessionLocal()
    try:
        db.query(Alert).filter(Alert.is_read == False).update({"is_read": True})
        db.commit()
        return {"message": "All alerts marked as read"}
    finally:
        db.close()

@app.post("/rules")
def create_rule(
    campaign_id: str,
    metric: str,
    operator: str,
    threshold: float,
):
    db = SessionLocal()
    try:
        rule = AlertRule(
            campaign_id=campaign_id,
            metric=metric,
            operator=operator,
            threshold=threshold,
        )
        db.add(rule)
        db.commit()
        return {"message": "Rule created", "id": str(rule.id)}
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "healthy", "service": "AdFlow Notifications"}