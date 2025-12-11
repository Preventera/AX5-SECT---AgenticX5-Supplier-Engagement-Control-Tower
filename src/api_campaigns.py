"""
AX5-SECT API - Campaigns Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from .database import get_db
from .db_models import Campaign, CampaignSupplierStatus, Supplier

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


class CampaignSchema(BaseModel):
    id: int
    name: str
    type: str
    status: Optional[str]
    objective: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]

    class Config:
        from_attributes = True


class CampaignWithStatsSchema(CampaignSchema):
    suppliers_total: int = 0
    suppliers_responded: int = 0
    suppliers_validated: int = 0
    progress: float = 0


class CampaignCreateSchema(BaseModel):
    name: str
    type: str
    objective: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


@router.get("", response_model=List[CampaignWithStatsSchema])
def list_campaigns(
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Liste toutes les campagnes avec statistiques"""
    query = db.query(Campaign)

    if type:
        query = query.filter(Campaign.type == type)
    if status:
        query = query.filter(Campaign.status == status)

    campaigns = query.order_by(Campaign.created_at.desc()).all()

    result = []
    for campaign in campaigns:
        statuses = db.query(CampaignSupplierStatus).filter(
            CampaignSupplierStatus.campaign_id == campaign.id
        ).all()

        total = len(statuses)
        responded = sum(1 for s in statuses if s.status in ["submitted", "validated"])
        validated = sum(1 for s in statuses if s.status == "validated")
        progress = round((responded / total * 100), 1) if total > 0 else 0

        result.append(CampaignWithStatsSchema(
            id=campaign.id,
            name=campaign.name,
            type=campaign.type,
            status=campaign.status,
            objective=campaign.objective,
            start_date=campaign.start_date,
            end_date=campaign.end_date,
            suppliers_total=total,
            suppliers_responded=responded,
            suppliers_validated=validated,
            progress=progress
        ))

    return result


@router.get("/stats")
def get_campaigns_stats(db: Session = Depends(get_db)):
    """Statistiques globales sur les campagnes"""
    total = db.query(Campaign).count()
    active = db.query(Campaign).filter(Campaign.status == "active").count()
    draft = db.query(Campaign).filter(Campaign.status == "draft").count()
    completed = db.query(Campaign).filter(Campaign.status == "completed").count()

    total_suppliers_engaged = db.query(CampaignSupplierStatus).distinct(
        CampaignSupplierStatus.supplier_id
    ).count()

    return {
        "total": total,
        "active": active,
        "draft": draft,
        "completed": completed,
        "total_suppliers_engaged": total_suppliers_engaged
    }


@router.get("/{campaign_id}", response_model=CampaignWithStatsSchema)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Récupère une campagne avec ses statistiques"""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    statuses = db.query(CampaignSupplierStatus).filter(
        CampaignSupplierStatus.campaign_id == campaign_id
    ).all()

    total = len(statuses)
    responded = sum(1 for s in statuses if s.status in ["submitted", "validated"])
    validated = sum(1 for s in statuses if s.status == "validated")

    return CampaignWithStatsSchema(
        id=campaign.id,
        name=campaign.name,
        type=campaign.type,
        status=campaign.status,
        objective=campaign.objective,
        start_date=campaign.start_date,
        end_date=campaign.end_date,
        suppliers_total=total,
        suppliers_responded=responded,
        suppliers_validated=validated,
        progress=round((responded / total * 100), 1) if total > 0 else 0
    )


@router.get("/{campaign_id}/suppliers")
def get_campaign_suppliers(campaign_id: int, db: Session = Depends(get_db)):
    """Liste les fournisseurs d'une campagne"""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    statuses = db.query(CampaignSupplierStatus).filter(
        CampaignSupplierStatus.campaign_id == campaign_id
    ).all()

    result = []
    for status in statuses:
        supplier = db.query(Supplier).filter(Supplier.id == status.supplier_id).first()
        result.append({
            "supplier_id": status.supplier_id,
            "supplier_name": supplier.name if supplier else "Unknown",
            "status": status.status,
            "last_contact_at": status.last_contact_at,
            "reminders_sent": status.reminders_sent
        })

    return result


@router.post("", response_model=CampaignSchema)
def create_campaign(data: CampaignCreateSchema, db: Session = Depends(get_db)):
    """Crée une nouvelle campagne"""
    campaign = Campaign(
        name=data.name,
        type=data.type,
        objective=data.objective,
        start_date=data.start_date,
        end_date=data.end_date,
        status="draft"
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign
