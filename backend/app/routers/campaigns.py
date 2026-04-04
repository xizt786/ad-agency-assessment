from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models.campaign import Campaign
from app.routers.auth import get_current_user
from app.models.user import User
import uuid

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

# ── Schemas ───────────────────────────────────────────────
class CampaignCreate(BaseModel):
    name: str
    client: str
    status: str = "active"
    budget: float
    spend: float = 0.0
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    notes: Optional[str] = None

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    client: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    spend: Optional[float] = None
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    conversions: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    notes: Optional[str] = None

def campaign_to_dict(c: Campaign) -> dict:
    ctr = (c.clicks / c.impressions * 100) if c.impressions > 0 else 0
    roas = (c.conversions * 45 / c.spend) if c.spend > 0 else 0
    return {
        "id": str(c.id),
        "name": c.name,
        "client": c.client,
        "status": c.status,
        "budget": c.budget,
        "spend": c.spend,
        "impressions": c.impressions,
        "clicks": c.clicks,
        "conversions": c.conversions,
        "ctr": round(ctr, 2),
        "roas": round(roas, 2),
        "start_date": c.start_date.isoformat() if c.start_date else None,
        "end_date": c.end_date.isoformat() if c.end_date else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        "notes": c.notes,
    }

# ── Routes ────────────────────────────────────────────────

# GET /campaigns — list all with filter, sort, pagination
@router.get("/")
def list_campaigns(
    status: Optional[str] = Query(None),
    client: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Campaign).filter(Campaign.is_deleted == False)

    # Filters
    if status:
        query = query.filter(Campaign.status == status)
    if client:
        query = query.filter(Campaign.client.ilike(f"%{client}%"))
    if search:
        query = query.filter(
            or_(
                Campaign.name.ilike(f"%{search}%"),
                Campaign.client.ilike(f"%{search}%"),
            )
        )

    # Sorting
    sort_col = getattr(Campaign, sort_by, Campaign.created_at)
    if sort_dir == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    # Pagination
    total = query.count()
    campaigns = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": -(-total // page_size),
        "data": [campaign_to_dict(c) for c in campaigns],
    }

# GET /campaigns/:id — single campaign
@router.get("/{campaign_id}")
def get_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.is_deleted == False
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return campaign_to_dict(campaign)

# POST /campaigns — create new campaign
@router.post("/", status_code=201)
def create_campaign(
    data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validation
    if data.budget <= 0:
        raise HTTPException(status_code=422, detail="Budget must be greater than 0")
    if data.status not in ["active", "paused", "completed"]:
        raise HTTPException(status_code=422, detail="Status must be active, paused, or completed")
    if data.spend > data.budget:
        raise HTTPException(status_code=422, detail="Spend cannot exceed budget")

    campaign = Campaign(**data.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign_to_dict(campaign)

# PUT /campaigns/:id — update campaign
@router.put("/{campaign_id}")
def update_campaign(
    campaign_id: str,
    data: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.is_deleted == False
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Only update fields that were actually sent
    update_data = data.model_dump(exclude_unset=True)

    # Validate status if provided
    if "status" in update_data and update_data["status"] not in ["active", "paused", "completed"]:
        raise HTTPException(status_code=422, detail="Status must be active, paused, or completed")

    for field, value in update_data.items():
        setattr(campaign, field, value)

    campaign.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(campaign)
    return campaign_to_dict(campaign)

# DELETE /campaigns/:id — soft delete only
@router.delete("/{campaign_id}")
def delete_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.is_deleted == False
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Soft delete — just mark as deleted, never remove from DB
    campaign.is_deleted = True
    campaign.deleted_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "Campaign deleted successfully", "id": campaign_id}