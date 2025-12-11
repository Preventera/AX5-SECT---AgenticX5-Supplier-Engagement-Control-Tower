"""
AX5-SECT CRUD Services
Services pour les opérations CRUD sur la base de données
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from .db_models import (
    Supplier, SupplierContact, IMDSProfile, PCFProfile, SupplierHubMetadata,
    Campaign, CampaignSupplierStatus,
    IMDSSubmission, PCFObject,
    Task, Event,
    KnowledgeDocument, KnowledgeChunk
)


# ============================================================================
# SUPPLIER CRUD
# ============================================================================

class SupplierService:
    """Service CRUD pour les fournisseurs"""
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Supplier:
        """Crée un nouveau fournisseur"""
        supplier = Supplier(**data)
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        return supplier
    
    @staticmethod
    def get_by_id(db: Session, supplier_id: int) -> Optional[Supplier]:
        """Récupère un fournisseur par ID"""
        return db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    @staticmethod
    def get_by_external_id(db: Session, external_id: str) -> Optional[Supplier]:
        """Récupère un fournisseur par ID externe"""
        return db.query(Supplier).filter(Supplier.external_id == external_id).first()
    
    @staticmethod
    def list(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        country_code: Optional[str] = None,
        supplier_type: Optional[str] = None,
        supply_chain_level: Optional[str] = None
    ) -> List[Supplier]:
        """Liste les fournisseurs avec filtres optionnels"""
        query = db.query(Supplier)
        
        if country_code:
            query = query.filter(Supplier.country_code == country_code)
        if supplier_type:
            query = query.filter(Supplier.supplier_type == supplier_type)
        if supply_chain_level:
            query = query.filter(Supplier.supply_chain_level == supply_chain_level)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update(db: Session, supplier_id: int, data: Dict[str, Any]) -> Optional[Supplier]:
        """Met à jour un fournisseur"""
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if supplier:
            for key, value in data.items():
                if hasattr(supplier, key):
                    setattr(supplier, key, value)
            db.commit()
            db.refresh(supplier)
        return supplier
    
    @staticmethod
    def delete(db: Session, supplier_id: int) -> bool:
        """Supprime un fournisseur"""
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if supplier:
            db.delete(supplier)
            db.commit()
            return True
        return False
    
    @staticmethod
    def count(db: Session) -> int:
        """Compte le nombre total de fournisseurs"""
        return db.query(func.count(Supplier.id)).scalar()
    
    @staticmethod
    def get_full_profile(db: Session, supplier_id: int) -> Optional[Dict[str, Any]]:
        """Récupère le profil complet d'un fournisseur (avec IMDS, PCF, contacts)"""
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            return None
        
        return {
            "supplier": supplier,
            "contacts": supplier.contacts,
            "imds_profile": supplier.imds_profile,
            "pcf_profile": supplier.pcf_profile,
            "hub_metadata": supplier.hub_metadata
        }


# ============================================================================
# CAMPAIGN CRUD
# ============================================================================

class CampaignService:
    """Service CRUD pour les campagnes"""
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> Campaign:
        """Crée une nouvelle campagne"""
        campaign = Campaign(**data)
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        return campaign
    
    @staticmethod
    def get_by_id(db: Session, campaign_id: int) -> Optional[Campaign]:
        """Récupère une campagne par ID"""
        return db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    @staticmethod
    def list(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        campaign_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Campaign]:
        """Liste les campagnes avec filtres optionnels"""
        query = db.query(Campaign)
        
        if campaign_type:
            query = query.filter(Campaign.type == campaign_type)
        if status:
            query = query.filter(Campaign.status == status)
        
        return query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def update(db: Session, campaign_id: int, data: Dict[str, Any]) -> Optional[Campaign]:
        """Met à jour une campagne"""
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if campaign:
            for key, value in data.items():
                if hasattr(campaign, key):
                    setattr(campaign, key, value)
            db.commit()
            db.refresh(campaign)
        return campaign
    
    @staticmethod
    def add_suppliers(db: Session, campaign_id: int, supplier_ids: List[int]) -> int:
        """Ajoute des fournisseurs à une campagne"""
        added = 0
        for supplier_id in supplier_ids:
            # Vérifier si le fournisseur existe
            supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
            if supplier:
                # Vérifier si pas déjà dans la campagne
                existing = db.query(CampaignSupplierStatus).filter(
                    and_(
                        CampaignSupplierStatus.campaign_id == campaign_id,
                        CampaignSupplierStatus.supplier_id == supplier_id
                    )
                ).first()
                if not existing:
                    status = CampaignSupplierStatus(
                        campaign_id=campaign_id,
                        supplier_id=supplier_id,
                        status="not_started"
                    )
                    db.add(status)
                    added += 1
        db.commit()
        return added
    
    @staticmethod
    def get_supplier_statuses(db: Session, campaign_id: int) -> List[CampaignSupplierStatus]:
        """Récupère les statuts des fournisseurs pour une campagne"""
        return db.query(CampaignSupplierStatus).filter(
            CampaignSupplierStatus.campaign_id == campaign_id
        ).all()
    
    @staticmethod
    def update_supplier_status(
        db: Session, 
        campaign_id: int, 
        supplier_id: int, 
        status: str,
        notes: Optional[str] = None
    ) -> Optional[CampaignSupplierStatus]:
        """Met à jour le statut d'un fournisseur dans une campagne"""
        css = db.query(CampaignSupplierStatus).filter(
            and_(
                CampaignSupplierStatus.campaign_id == campaign_id,
                CampaignSupplierStatus.supplier_id == supplier_id
            )
        ).first()
        if css:
            css.status = status
            if notes:
                css.notes = notes
            css.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(css)
        return css
    
    @staticmethod
    def get_stats(db: Session, campaign_id: int) -> Dict[str, Any]:
        """Calcule les statistiques d'une campagne"""
        statuses = db.query(CampaignSupplierStatus).filter(
            CampaignSupplierStatus.campaign_id == campaign_id
        ).all()
        
        if not statuses:
            return {"total": 0, "by_status": {}}
        
        status_counts = {}
        for s in statuses:
            status_counts[s.status] = status_counts.get(s.status, 0) + 1
        
        total = len(statuses)
        return {
            "total": total,
            "by_status": status_counts,
            "response_rate": (status_counts.get("submitted", 0) + status_counts.get("validated", 0)) / total * 100 if total > 0 else 0,
            "validation_rate": status_counts.get("validated", 0) / total * 100 if total > 0 else 0
        }


# ============================================================================
# IMDS SUBMISSION CRUD
# ============================================================================

class IMDSSubmissionService:
    """Service CRUD pour les soumissions IMDS"""
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> IMDSSubmission:
        """Crée une nouvelle soumission IMDS"""
        submission = IMDSSubmission(**data)
        db.add(submission)
        db.commit()
        db.refresh(submission)
        return submission
    
    @staticmethod
    def get_by_id(db: Session, submission_id: int) -> Optional[IMDSSubmission]:
        """Récupère une soumission par ID"""
        return db.query(IMDSSubmission).filter(IMDSSubmission.id == submission_id).first()
    
    @staticmethod
    def list_by_supplier(db: Session, supplier_id: int) -> List[IMDSSubmission]:
        """Liste les soumissions d'un fournisseur"""
        return db.query(IMDSSubmission).filter(
            IMDSSubmission.supplier_id == supplier_id
        ).order_by(IMDSSubmission.submitted_at.desc()).all()
    
    @staticmethod
    def list_by_campaign(db: Session, campaign_id: int) -> List[IMDSSubmission]:
        """Liste les soumissions d'une campagne"""
        return db.query(IMDSSubmission).filter(
            IMDSSubmission.campaign_id == campaign_id
        ).all()
    
    @staticmethod
    def update_status(
        db: Session, 
        submission_id: int, 
        status: str,
        rejection_reason: Optional[str] = None
    ) -> Optional[IMDSSubmission]:
        """Met à jour le statut d'une soumission"""
        submission = db.query(IMDSSubmission).filter(IMDSSubmission.id == submission_id).first()
        if submission:
            submission.status = status
            if rejection_reason:
                submission.rejection_reason = rejection_reason
            if status == "rejected":
                submission.iteration_count += 1
            db.commit()
            db.refresh(submission)
        return submission


# ============================================================================
# PCF OBJECT CRUD
# ============================================================================

class PCFObjectService:
    """Service CRUD pour les objets PCF"""
    
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> PCFObject:
        """Crée un nouvel objet PCF"""
        pcf = PCFObject(**data)
        db.add(pcf)
        db.commit()
        db.refresh(pcf)
        return pcf
    
    @staticmethod
    def get_by_id(db: Session, pcf_id: int) -> Optional[PCFObject]:
        """Récupère un objet PCF par ID"""
        return db.query(PCFObject).filter(PCFObject.id == pcf_id).first()
    
    @staticmethod
    def list_by_supplier(db: Session, supplier_id: int) -> List[PCFObject]:
        """Liste les PCF d'un fournisseur"""
        return db.query(PCFObject).filter(PCFObject.supplier_id == supplier_id).all()
    
    @staticmethod
    def list_by_campaign(db: Session, campaign_id: int) -> List[PCFObject]:
        """Liste les PCF d'une campagne"""
        return db.query(PCFObject).filter(PCFObject.campaign_id == campaign_id).all()
    
    @staticmethod
    def validate(db: Session, pcf_id: int, notes: Optional[str] = None) -> Optional[PCFObject]:
        """Valide un objet PCF"""
        pcf = db.query(PCFObject).filter(PCFObject.id == pcf_id).first()
        if pcf:
            pcf.validation_status = "validated"
            if notes:
                pcf.validation_notes = notes
            db.commit()
            db.refresh(pcf)
        return pcf
    
    @staticmethod
    def reject(db: Session, pcf_id: int, reason: str) -> Optional[PCFObject]:
        """Rejette un objet PCF"""
        pcf = db.query(PCFObject).filter(PCFObject.id == pcf_id).first()
        if pcf:
            pcf.validation_status = "rejected"
            pcf.validation_notes = reason
            db.commit()
            db.refresh(pcf)
        return pcf
    
    @staticmethod
    def get_total_emissions(db: Session, campaign_id: Optional[int] = None) -> float:
        """Calcule les émissions totales"""
        query = db.query(func.sum(PCFObject.total_emissions_kgco2e))
        if campaign_id:
            query = query.filter(PCFObject.campaign_id == campaign_id)
        result = query.scalar()
        return float(result) if result else 0.0


# ============================================================================
# KNOWLEDGE BASE CRUD
# ============================================================================

class KnowledgeService:
    """Service CRUD pour la base de connaissances"""
    
    @staticmethod
    def add_document(db: Session, data: Dict[str, Any]) -> KnowledgeDocument:
        """Ajoute un document"""
        doc = KnowledgeDocument(**data)
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc
    
    @staticmethod
    def add_chunk(db: Session, document_id: int, content: str, chunk_index: int, metadata: Dict = None) -> KnowledgeChunk:
        """Ajoute un chunk de document"""
        chunk = KnowledgeChunk(
            document_id=document_id,
            content=content,
            chunk_index=chunk_index,
            metadata=metadata or {}
        )
        db.add(chunk)
        db.commit()
        db.refresh(chunk)
        return chunk
    
    @staticmethod
    def search_by_tags(db: Session, tags: List[str]) -> List[KnowledgeDocument]:
        """Recherche des documents par tags"""
        return db.query(KnowledgeDocument).filter(
            KnowledgeDocument.tags.overlap(tags)
        ).all()
    
    @staticmethod
    def get_document_with_chunks(db: Session, document_id: int) -> Optional[Dict[str, Any]]:
        """Récupère un document avec ses chunks"""
        doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
        if doc:
            return {
                "document": doc,
                "chunks": doc.chunks
            }
        return None


# ============================================================================
# DASHBOARD / METRICS
# ============================================================================

class DashboardService:
    """Service pour le tableau de bord et métriques"""
    
    @staticmethod
    def get_overview(db: Session) -> Dict[str, Any]:
        """Récupère une vue d'ensemble pour le dashboard"""
        return {
            "suppliers": {
                "total": db.query(func.count(Supplier.id)).scalar(),
                "by_level": dict(
                    db.query(Supplier.supply_chain_level, func.count(Supplier.id))
                    .group_by(Supplier.supply_chain_level).all()
                )
            },
            "campaigns": {
                "total": db.query(func.count(Campaign.id)).scalar(),
                "active": db.query(func.count(Campaign.id)).filter(Campaign.status == "active").scalar(),
                "by_type": dict(
                    db.query(Campaign.type, func.count(Campaign.id))
                    .group_by(Campaign.type).all()
                )
            },
            "submissions": {
                "imds_total": db.query(func.count(IMDSSubmission.id)).scalar(),
                "pcf_total": db.query(func.count(PCFObject.id)).scalar(),
                "pcf_validated": db.query(func.count(PCFObject.id)).filter(
                    PCFObject.validation_status == "validated"
                ).scalar()
            },
            "emissions": {
                "total_kgco2e": float(
                    db.query(func.sum(PCFObject.total_emissions_kgco2e)).scalar() or 0
                )
            }
        }
