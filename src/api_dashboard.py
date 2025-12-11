"""
AX5-SECT API - Dashboard Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from .database import get_db
from .db_models import (
    Supplier, Campaign, CampaignSupplierStatus,
    IMDSSubmission, PCFObject, PCFProfile
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Statistiques globales pour le dashboard"""

    # Suppliers stats
    total_suppliers = db.query(Supplier).count()
    tier1_count = db.query(Supplier).filter(Supplier.supply_chain_level == "tier1").count()
    tier2_count = db.query(Supplier).filter(Supplier.supply_chain_level == "tier2").count()

    # Campaigns stats
    total_campaigns = db.query(Campaign).count()
    active_campaigns = db.query(Campaign).filter(Campaign.status == "active").count()

    # IMDS submissions stats
    imds_total = db.query(IMDSSubmission).count()
    imds_validated = db.query(IMDSSubmission).filter(IMDSSubmission.status == "validated").count()
    imds_pending = db.query(IMDSSubmission).filter(
        IMDSSubmission.status.in_(["submitted", "draft", "pending"])
    ).count()
    imds_rejected = db.query(IMDSSubmission).filter(IMDSSubmission.status == "rejected").count()

    # PCF stats
    pcf_total = db.query(PCFObject).count()
    pcf_validated = db.query(PCFObject).filter(PCFObject.validation_status == "validated").count()
    pcf_pending = db.query(PCFObject).filter(PCFObject.validation_status == "pending").count()

    # PCF coverage
    suppliers_with_pcf = db.query(PCFProfile).filter(PCFProfile.pcf_count > 0).count()
    pcf_coverage = round((suppliers_with_pcf / total_suppliers * 100), 1) if total_suppliers > 0 else 0

    # Total emissions
    total_emissions = db.query(func.sum(PCFObject.total_emissions_kgco2e)).scalar() or 0

    return {
        "suppliers": {
            "total": total_suppliers,
            "tier1": tier1_count,
            "tier2": tier2_count
        },
        "campaigns": {
            "total": total_campaigns,
            "active": active_campaigns
        },
        "imds": {
            "total": imds_total,
            "validated": imds_validated,
            "pending": imds_pending,
            "rejected": imds_rejected
        },
        "pcf": {
            "total": pcf_total,
            "validated": pcf_validated,
            "pending": pcf_pending,
            "coverage": pcf_coverage,
            "suppliers_covered": suppliers_with_pcf
        },
        "emissions": {
            "total_kgco2e": float(total_emissions),
            "total_tco2e": round(float(total_emissions) / 1000, 2)
        }
    }


@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """Vue d'ensemble pour le dashboard principal"""
    stats = get_dashboard_stats(db)

    # Campagnes actives avec progression
    active_campaigns = db.query(Campaign).filter(Campaign.status == "active").all()
    campaigns_data = []

    for campaign in active_campaigns:
        statuses = db.query(CampaignSupplierStatus).filter(
            CampaignSupplierStatus.campaign_id == campaign.id
        ).all()

        total = len(statuses)
        responded = sum(1 for s in statuses if s.status in ["submitted", "validated"])
        validated = sum(1 for s in statuses if s.status == "validated")

        campaigns_data.append({
            "id": campaign.id,
            "name": campaign.name,
            "type": campaign.type,
            "status": campaign.status,
            "end_date": campaign.end_date,
            "suppliers_total": total,
            "suppliers_responded": responded,
            "suppliers_validated": validated,
            "progress": round((responded / total * 100), 1) if total > 0 else 0
        })

    return {
        "stats": stats,
        "active_campaigns": campaigns_data
    }


@router.get("/activity")
def get_recent_activity(limit: int = 10, db: Session = Depends(get_db)):
    """Activité récente"""
    activities = []

    # Dernières soumissions IMDS
    recent_imds = db.query(IMDSSubmission).order_by(
        IMDSSubmission.updated_at.desc()
    ).limit(5).all()

    for imds in recent_imds:
        supplier = db.query(Supplier).filter(Supplier.id == imds.supplier_id).first()
        activities.append({
            "type": "imds_submission",
            "title": f"IMDS {'validé' if imds.status == 'validated' else 'soumis'}",
            "description": f"{supplier.name if supplier else 'Unknown'} - {imds.mds_id or imds.internal_ref}",
            "status": imds.status,
            "timestamp": imds.updated_at
        })

    # Derniers objets PCF
    recent_pcf = db.query(PCFObject).order_by(
        PCFObject.updated_at.desc()
    ).limit(5).all()

    for pcf in recent_pcf:
        supplier = db.query(Supplier).filter(Supplier.id == pcf.supplier_id).first()
        activities.append({
            "type": "pcf_submission",
            "title": f"PCF {'validé' if pcf.validation_status == 'validated' else 'soumis'}",
            "description": f"{supplier.name if supplier else 'Unknown'} - {pcf.product_ref}",
            "status": pcf.validation_status,
            "timestamp": pcf.updated_at
        })

    # Trier par date
    activities.sort(key=lambda x: x["timestamp"] or datetime.min, reverse=True)

    return activities[:limit]


@router.get("/emissions/trend")
def get_emissions_trend(months: int = 6, db: Session = Depends(get_db)):
    """Tendance des émissions sur les derniers mois"""
    trend_data = []
    now = datetime.utcnow()

    month_names = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

    for i in range(months - 1, -1, -1):
        month_date = now - timedelta(days=30 * i)
        month_name = month_names[month_date.month - 1]

        # Données simulées pour la démo
        base_collected = 1200 + (months - i) * 400
        base_validated = int(base_collected * 0.85)

        trend_data.append({
            "month": month_name,
            "collected": base_collected,
            "validated": base_validated
        })

    return trend_data


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    """KPIs clés pour le dashboard"""
    stats = get_dashboard_stats(db)

    # Taux de validation IMDS
    imds_validation_rate = 0
    if stats["imds"]["total"] > 0:
        imds_validation_rate = round(
            stats["imds"]["validated"] / stats["imds"]["total"] * 100, 1
        )

    # Taux de validation PCF
    pcf_validation_rate = 0
    if stats["pcf"]["total"] > 0:
        pcf_validation_rate = round(
            stats["pcf"]["validated"] / stats["pcf"]["total"] * 100, 1
        )

    # Taux de réponse moyen des campagnes
    active_campaigns = db.query(Campaign).filter(Campaign.status == "active").all()
    response_rates = []

    for campaign in active_campaigns:
        statuses = db.query(CampaignSupplierStatus).filter(
            CampaignSupplierStatus.campaign_id == campaign.id
        ).all()
        if statuses:
            responded = sum(1 for s in statuses if s.status in ["submitted", "validated"])
            response_rates.append(responded / len(statuses) * 100)

    avg_response_rate = round(sum(response_rates) / len(response_rates), 1) if response_rates else 0

    return {
        "imds": {
            "validation_rate": imds_validation_rate,
            "total": stats["imds"]["total"],
            "validated": stats["imds"]["validated"],
            "pending": stats["imds"]["pending"]
        },
        "pcf": {
            "coverage": stats["pcf"]["coverage"],
            "validation_rate": pcf_validation_rate,
            "total": stats["pcf"]["total"],
            "validated": stats["pcf"]["validated"]
        },
        "engagement": {
            "avg_response_rate": avg_response_rate,
            "active_campaigns": len(active_campaigns),
            "suppliers_total": stats["suppliers"]["total"]
        },
        "emissions": {
            "total_kgco2e": stats["emissions"]["total_kgco2e"],
            "total_tco2e": stats["emissions"]["total_tco2e"],
            "trend": -5.2
        }
    }
