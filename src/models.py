"""
AX5-SECT Data Models
Modèles Pydantic pour le Hub Supplier Engagement Tool - IMDS & PCF
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class SupplierType(str, Enum):
    MATIERE = "matiere"
    COMPOSANT = "composant"
    ASSEMBLAGE = "assemblage"
    SERVICE = "service"


class SupplyChainLevel(str, Enum):
    TIER_1 = "Tier-1"
    TIER_2 = "Tier-2"
    TIER_3 = "Tier-3"
    TIER_N = "Tier-N"


class PCFMaturity(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class SupportLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CampaignType(str, Enum):
    IMDS = "IMDS"
    PCF = "PCF"
    MIXED = "MIXED"


class CampaignSupplierStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    VALIDATED = "validated"
    OVERDUE = "overdue"
    REJECTED = "rejected"


class IMDSSubmissionStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    VALIDATED = "validated"
    REJECTED = "rejected"


class PCFValidationStatus(str, Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    FAILED = "failed"


class Priority(str, Enum):
    A = "A"  # Haute priorité
    B = "B"  # Moyenne priorité
    C = "C"  # Basse priorité


# ============================================================================
# FOURNISSEURS & CONTACTS
# ============================================================================

class SupplierBase(BaseModel):
    """Modèle de base pour un fournisseur"""
    external_id: Optional[str] = None
    name: str
    parent_group: Optional[str] = None
    country_code: Optional[str] = Field(None, max_length=2)
    region: Optional[str] = None
    supplier_type: Optional[SupplierType] = None
    supply_chain_level: Optional[SupplyChainLevel] = None
    main_part_families: List[str] = Field(default_factory=list)


class Supplier(SupplierBase):
    """Fournisseur complet avec métadonnées"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SupplierCreate(SupplierBase):
    """Création d'un fournisseur"""
    pass


class SupplierContact(BaseModel):
    """Contact d'un fournisseur"""
    id: Optional[int] = None
    supplier_id: int
    full_name: str
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    languages: List[str] = Field(default_factory=list)
    preferred_channels: List[str] = Field(default_factory=list)
    time_zone: Optional[str] = None
    is_primary: bool = False
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# PROFILS IMDS & PCF
# ============================================================================

class IMDSProfile(BaseModel):
    """Profil IMDS d'un fournisseur"""
    id: Optional[int] = None
    supplier_id: int
    imds_id: Optional[str] = None
    oems_served: List[str] = Field(default_factory=list)
    on_time_submission_rate: Optional[float] = Field(None, ge=0, le=1)
    oem_rejection_rate: Optional[float] = Field(None, ge=0, le=1)
    avg_submission_leadtime_days: Optional[float] = None
    support_level: Optional[SupportLevel] = None
    notes: Optional[str] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PCFProfile(BaseModel):
    """Profil PCF (Product Carbon Footprint) d'un fournisseur"""
    id: Optional[int] = None
    supplier_id: int
    pcf_maturity: Optional[PCFMaturity] = None
    tools_used: List[str] = Field(default_factory=list)
    pcf_count: int = 0
    scopes_covered: List[str] = Field(default_factory=list)
    reference_years: List[int] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    data_quality_score: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# MÉTADONNÉES HUB FOURNISSEUR
# ============================================================================

class SupplierHubMetadata(BaseModel):
    """Métadonnées de priorisation et risque pour un fournisseur"""
    id: Optional[int] = None
    supplier_id: int
    priority: Optional[Priority] = None
    regulatory_risk: Optional[float] = Field(None, ge=0, le=100)
    climate_risk: Optional[float] = Field(None, ge=0, le=100)
    program_status: Optional[str] = None
    strategic_notes: Optional[str] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# CAMPAGNES
# ============================================================================

class CampaignBase(BaseModel):
    """Modèle de base pour une campagne"""
    name: str
    type: CampaignType
    objective: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_part_families: List[str] = Field(default_factory=list)
    created_by: Optional[str] = None


class Campaign(CampaignBase):
    """Campagne complète"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CampaignCreate(CampaignBase):
    """Création d'une campagne"""
    supplier_ids: List[int] = Field(default_factory=list)


class CampaignSupplierStatusRecord(BaseModel):
    """Statut d'un fournisseur dans une campagne"""
    id: Optional[int] = None
    campaign_id: int
    supplier_id: int
    status: CampaignSupplierStatus = CampaignSupplierStatus.NOT_STARTED
    last_contact_at: Optional[datetime] = None
    reminders_sent: int = 0
    progression_score: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# SOUMISSIONS IMDS & OBJETS PCF
# ============================================================================

class IMDSSubmission(BaseModel):
    """Soumission IMDS"""
    id: Optional[int] = None
    supplier_id: int
    campaign_id: Optional[int] = None
    internal_ref: Optional[str] = None
    mds_id: Optional[str] = None
    part_number: Optional[str] = None
    oem: Optional[str] = None
    submitted_at: Optional[datetime] = None
    status: IMDSSubmissionStatus = IMDSSubmissionStatus.DRAFT
    rejection_reason: Optional[str] = None
    iteration_count: int = 0
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PCFObject(BaseModel):
    """Objet PCF (Product Carbon Footprint)"""
    id: Optional[int] = None
    supplier_id: int
    campaign_id: Optional[int] = None
    product_ref: Optional[str] = None
    perimeter: Optional[str] = None  # 'cradle-to-gate', 'A1-A3', etc.
    reference_year: Optional[int] = None
    total_emissions_kgco2e: Optional[float] = None
    method: Optional[str] = None  # 'ISO 14067', 'PEF', 'GHG Product'
    frameworks: List[str] = Field(default_factory=list)
    emission_factor_sources: List[str] = Field(default_factory=list)
    uncertainty: Optional[str] = None
    validation_status: PCFValidationStatus = PCFValidationStatus.PENDING
    validation_notes: Optional[str] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# TÂCHES & ÉVÉNEMENTS (AGENTIC)
# ============================================================================

class Task(BaseModel):
    """Tâche pour les agents"""
    id: Optional[int] = None
    type: str  # 'reminder', 'audit', 'data_check', etc.
    status: TaskStatus = TaskStatus.PENDING
    payload: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Event(BaseModel):
    """Événement système"""
    id: Optional[int] = None
    event_type: str  # 'CAMPAIGN_CREATED', 'IMDS_REJECTED', etc.
    supplier_id: Optional[int] = None
    campaign_id: Optional[int] = None
    data: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# RAG - DOCUMENTS & CHUNKS
# ============================================================================

class KnowledgeDocument(BaseModel):
    """Document de la base de connaissances"""
    id: Optional[int] = None
    source_type: str  # 'norme', 'guide_oem', 'blog', 'interne'
    title: str
    url: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class KnowledgeChunk(BaseModel):
    """Chunk de document pour RAG"""
    id: Optional[int] = None
    document_id: int
    chunk_index: int
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    # Note: embedding vector géré séparément par pgvector
    
    class Config:
        from_attributes = True


# ============================================================================
# MODÈLES COMPOSITES (VUES ENRICHIES)
# ============================================================================

class SupplierFullProfile(BaseModel):
    """Vue complète d'un fournisseur avec tous ses profils"""
    supplier: Supplier
    contacts: List[SupplierContact] = Field(default_factory=list)
    imds_profile: Optional[IMDSProfile] = None
    pcf_profile: Optional[PCFProfile] = None
    metadata: Optional[SupplierHubMetadata] = None
    active_campaigns: List[Campaign] = Field(default_factory=list)
    recent_submissions: List[IMDSSubmission] = Field(default_factory=list)
    recent_pcf_objects: List[PCFObject] = Field(default_factory=list)


class CampaignDashboard(BaseModel):
    """Tableau de bord d'une campagne"""
    campaign: Campaign
    total_suppliers: int = 0
    suppliers_not_started: int = 0
    suppliers_in_progress: int = 0
    suppliers_submitted: int = 0
    suppliers_validated: int = 0
    suppliers_overdue: int = 0
    suppliers_rejected: int = 0
    completion_rate: float = 0.0
    avg_progression_score: float = 0.0


# ============================================================================
# KPI & MÉTRIQUES
# ============================================================================

class IMDSMetrics(BaseModel):
    """Métriques IMDS globales"""
    total_submissions: int = 0
    submissions_validated: int = 0
    submissions_rejected: int = 0
    avg_cycle_time_days: float = 0.0
    rejection_rate: float = 0.0
    top_rejection_reasons: List[Dict[str, Any]] = Field(default_factory=list)


class PCFMetrics(BaseModel):
    """Métriques PCF globales"""
    total_pcf_objects: int = 0
    pcf_validated: int = 0
    pcf_coverage_rate: float = 0.0  # % des produits avec PCF
    avg_emissions_kgco2e: float = 0.0
    primary_data_rate: float = 0.0  # % données primaires vs génériques


class SupplierEngagementMetrics(BaseModel):
    """Métriques d'engagement fournisseurs"""
    total_suppliers: int = 0
    active_campaigns: int = 0
    avg_response_rate: float = 0.0
    avg_data_quality_score: float = 0.0
    suppliers_by_priority: Dict[str, int] = Field(default_factory=dict)
    suppliers_by_maturity: Dict[str, int] = Field(default_factory=dict)
