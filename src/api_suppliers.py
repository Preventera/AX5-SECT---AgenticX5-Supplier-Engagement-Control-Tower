"""
AX5-SECT API - Suppliers Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from .database import get_db
from .db_models import Supplier, SupplierContact, IMDSProfile, PCFProfile

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


# ============================================================================
# SCHEMAS
# ============================================================================

class SupplierContactSchema(BaseModel):
    id: int
    full_name: str
    role: Optional[str]
    email: Optional[str]
    is_primary: bool

    class Config:
        from_attributes = True


class IMDSProfileSchema(BaseModel):
    id: int
    imds_id: Optional[str]
    oems_served: Optional[List[str]]
    on_time_submission_rate: Optional[float]
    oem_rejection_rate: Optional[float]
    support_level: Optional[str]

    class Config:
        from_attributes = True


class PCFProfileSchema(BaseModel):
    id: int
    pcf_maturity: Optional[str]
    tools_used: Optional[List[str]]
    pcf_count: int
    scopes_covered: Optional[List[str]]
    frameworks: Optional[List[str]]
    data_quality_score: Optional[float]

    class Config:
        from_attributes = True


class SupplierSchema(BaseModel):
    id: int
    external_id: Optional[str]
    name: str
    parent_group: Optional[str]
    country_code: Optional[str]
    region: Optional[str]
    supplier_type: Optional[str]
    supply_chain_level: Optional[str]
    main_part_families: Optional[List[str]]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class SupplierFullSchema(SupplierSchema):
    contacts: List[SupplierContactSchema] = []
    imds_profile: Optional[IMDSProfileSchema] = None
    pcf_profile: Optional[PCFProfileSchema] = None


class SupplierCreateSchema(BaseModel):
    external_id: Optional[str] = None
    name: str
    parent_group: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    supplier_type: Optional[str] = None
    supply_chain_level: Optional[str] = None
    main_part_families: Optional[List[str]] = None


class SupplierUpdateSchema(BaseModel):
    name: Optional[str] = None
    parent_group: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    supplier_type: Optional[str] = None
    supply_chain_level: Optional[str] = None
    main_part_families: Optional[List[str]] = None


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("", response_model=List[SupplierSchema])
def list_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    country_code: Optional[str] = None,
    supplier_type: Optional[str] = None,
    supply_chain_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Liste tous les fournisseurs avec filtres optionnels"""
    query = db.query(Supplier)

    if country_code:
        query = query.filter(Supplier.country_code == country_code)
    if supplier_type:
        query = query.filter(Supplier.supplier_type == supplier_type)
    if supply_chain_level:
        query = query.filter(Supplier.supply_chain_level == supply_chain_level)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Supplier.name.ilike(search_filter)) |
            (Supplier.external_id.ilike(search_filter))
        )

    suppliers = query.order_by(Supplier.name).offset(skip).limit(limit).all()
    return suppliers


@router.get("/stats")
def get_suppliers_stats(db: Session = Depends(get_db)):
    """Statistiques sur les fournisseurs"""
    total = db.query(Supplier).count()
    tier1 = db.query(Supplier).filter(Supplier.supply_chain_level == "tier1").count()
    tier2 = db.query(Supplier).filter(Supplier.supply_chain_level == "tier2").count()

    # Par région
    regions = {}
    for supplier in db.query(Supplier).all():
        region = supplier.region or "Unknown"
        regions[region] = regions.get(region, 0) + 1

    # PCF maturity stats
    pcf_advanced = db.query(PCFProfile).filter(PCFProfile.pcf_maturity == "advanced").count()
    pcf_intermediate = db.query(PCFProfile).filter(PCFProfile.pcf_maturity == "intermediate").count()
    pcf_beginner = db.query(PCFProfile).filter(PCFProfile.pcf_maturity == "beginner").count()

    return {
        "total": total,
        "by_level": {"tier1": tier1, "tier2": tier2},
        "by_region": regions,
        "pcf_maturity": {
            "advanced": pcf_advanced,
            "intermediate": pcf_intermediate,
            "beginner": pcf_beginner
        }
    }


@router.get("/{supplier_id}")
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Récupère un fournisseur avec tous ses profils"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")

    # Récupérer les profils associés
    imds_profile = db.query(IMDSProfile).filter(IMDSProfile.supplier_id == supplier_id).first()
    pcf_profile = db.query(PCFProfile).filter(PCFProfile.supplier_id == supplier_id).first()
    contacts = db.query(SupplierContact).filter(SupplierContact.supplier_id == supplier_id).all()

    return {
        "id": supplier.id,
        "external_id": supplier.external_id,
        "name": supplier.name,
        "parent_group": supplier.parent_group,
        "country_code": supplier.country_code,
        "region": supplier.region,
        "supplier_type": supplier.supplier_type,
        "supply_chain_level": supplier.supply_chain_level,
        "main_part_families": supplier.main_part_families,
        "created_at": supplier.created_at,
        "updated_at": supplier.updated_at,
        "contacts": [{"id": c.id, "full_name": c.full_name, "role": c.role, "email": c.email, "is_primary": c.is_primary} for c in contacts],
        "imds_profile": {
            "id": imds_profile.id,
            "imds_id": imds_profile.imds_id,
            "oems_served": imds_profile.oems_served,
            "on_time_submission_rate": imds_profile.on_time_submission_rate,
            "support_level": imds_profile.support_level
        } if imds_profile else None,
        "pcf_profile": {
            "id": pcf_profile.id,
            "pcf_maturity": pcf_profile.pcf_maturity,
            "pcf_count": pcf_profile.pcf_count,
            "tools_used": pcf_profile.tools_used,
            "frameworks": pcf_profile.frameworks,
            "data_quality_score": pcf_profile.data_quality_score
        } if pcf_profile else None
    }


@router.post("", response_model=SupplierSchema)
def create_supplier(data: SupplierCreateSchema, db: Session = Depends(get_db)):
    """Crée un nouveau fournisseur"""
    if data.external_id:
        existing = db.query(Supplier).filter(Supplier.external_id == data.external_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="External ID déjà utilisé")

    supplier = Supplier(**data.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


@router.put("/{supplier_id}", response_model=SupplierSchema)
def update_supplier(supplier_id: int, data: SupplierUpdateSchema, db: Session = Depends(get_db)):
    """Met à jour un fournisseur"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(supplier, key, value)

    db.commit()
    db.refresh(supplier)
    return supplier


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Supprime un fournisseur"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")

    db.delete(supplier)
    db.commit()
    return {"message": "Fournisseur supprimé", "id": supplier_id}


@router.get("/{supplier_id}/imds")
def get_supplier_imds(supplier_id: int, db: Session = Depends(get_db)):
    """Récupère le profil IMDS d'un fournisseur"""
    profile = db.query(IMDSProfile).filter(IMDSProfile.supplier_id == supplier_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil IMDS non trouvé")
    return profile


@router.get("/{supplier_id}/pcf")
def get_supplier_pcf(supplier_id: int, db: Session = Depends(get_db)):
    """Récupère le profil PCF d'un fournisseur"""
    profile = db.query(PCFProfile).filter(PCFProfile.supplier_id == supplier_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil PCF non trouvé")
    return profile
