from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from datetime import datetime, timezone
import uuid

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    client = Column(String(255), nullable=False)
    status = Column(String(50), default="active")  # active, paused, completed

    # Budget & Spend
    budget = Column(Float, nullable=False)
    spend = Column(Float, default=0.0)

    # Metrics
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)

    # Dates
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Soft delete — never actually delete from DB
    deleted_at = Column(DateTime, nullable=True)