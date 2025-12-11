"""
AX5-SECT ORM Models
Modèles SQLAlchemy pour PostgreSQL
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Numeric, 
    DateTime, ForeignKey, Enum, ARRAY, JSON
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

import enum


Base = declarative_base()


# ============================================================================
# ENUMS
# ============================================================================

class SupplierType(str, enum.Enum):
    MATERIAL = "material"
    COMPONENT = "component"
    ASSEMBLY = "assembly"
    SERVICE = "service"


class SupplyChainLevel(str, enum.Enum):
    TIER1 = "tier1"
    TIER2 = "tier2"
    TIER3 = "tier3"
    TIER4 = "tier4"


class CampaignType(str, enum.Enum):
    IMDS = "IMDS"
    PCF = "PCF"
    MIXED = "MIXED"


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class SubmissionStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    VALIDATED = "validated"
    REJECTED = "rejected"
    OVERDUE = "overdue"


class ValidationStatus(str, enum.Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"


class PCFMaturity(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class IMDSSupportLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ============================================================================
# SUPPLIERS
# ============================================================================

class Supplier(Base):
    """Table des fournisseurs"""
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(128), unique=True, index=True)
    name = Column(Text, nullable=False)
    parent_group = Column(Text)
    country_code = Column(String(2))
    region = Column(Text)
    supplier_type = Column(String(50))
    supply_chain_level = Column(String(20))
    main_part_families = Column(ARRAY(Text))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relations
    contacts = relationship("SupplierContact", back_populates="supplier")
    imds_profile = relationship("IMDSProfile", back_populates="supplier", uselist=False)
    pcf_profile = relationship("PCFProfile", back_populates="supplier", uselist=False)
    hub_metadata = relationship("SupplierHubMetadata", back_populates="supplier", uselist=False)


class SupplierContact(Base):
    """Contacts des fournisseurs"""
    __tablename__ = "supplier_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    full_name = Column(Text, nullable=False)
    role = Column(Text)
    email = Column(Text)
    phone = Column(Text)
    languages = Column(ARRAY(Text))
    preferred_channels = Column(ARRAY(Text))
    time_zone = Column(Text)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relations
    supplier = relationship("Supplier", back_populates="contacts")


class IMDSProfile(Base):
    """Profils IMDS des fournisseurs"""
    __tablename__ = "imds_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), unique=True, nullable=False)
    imds_id = Column(Text)
    oems_served = Column(ARRAY(Text))
    on_time_submission_rate = Column(Numeric(5, 4))
    oem_rejection_rate = Column(Numeric(5, 4))
    avg_submission_leadtime_days = Column(Numeric(10, 2))
    support_level = Column(String(20))
    notes = Column(Text)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relations
    supplier = relationship("Supplier", back_populates="imds_profile")


class PCFProfile(Base):
    """Profils PCF des fournisseurs"""
    __tablename__ = "pcf_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), unique=True, nullable=False)
    pcf_maturity = Column(String(20))
    tools_used = Column(ARRAY(Text))
    pcf_count = Column(Integer, default=0)
    scopes_covered = Column(ARRAY(Text))
    reference_years = Column(ARRAY(Integer))
    frameworks = Column(ARRAY(Text))
    data_quality_score = Column(Numeric(5, 2))
    notes = Column(Text)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relations
    supplier = relationship("Supplier", back_populates="pcf_profile")


class SupplierHubMetadata(Base):
    """Métadonnées Hub pour les fournisseurs"""
    __tablename__ = "supplier_hub_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), unique=True, nullable=False)
    priority = Column(String(1))  # A, B, C
    regulatory_risk = Column(String(20))
    climate_risk = Column(String(20))
    program_status = Column(String(50))
    strategic_notes = Column(Text)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relations
    supplier = relationship("Supplier", back_populates="hub_metadata")


# ============================================================================
# CAMPAIGNS
# ============================================================================

class Campaign(Base):
    """Campagnes d'engagement fournisseurs"""
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    type = Column(String(20), nullable=False)
    objective = Column(Text)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    target_part_families = Column(ARRAY(Text))
    status = Column(String(20), default="draft")
    created_by = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relations
    supplier_statuses = relationship("CampaignSupplierStatus", back_populates="campaign")
    imds_submissions = relationship("IMDSSubmission", back_populates="campaign")
    pcf_objects = relationship("PCFObject", back_populates="campaign")


class CampaignSupplierStatus(Base):
    """Statut des fournisseurs dans une campagne"""
    __tablename__ = "campaign_supplier_status"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    status = Column(String(20), default="not_started")
    last_contact_at = Column(DateTime)
    reminders_sent = Column(Integer, default=0)
    progression_score = Column(Numeric(5, 2))
    notes = Column(Text)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relations
    campaign = relationship("Campaign", back_populates="supplier_statuses")
    supplier = relationship("Supplier")


# ============================================================================
# SUBMISSIONS
# ============================================================================

class IMDSSubmission(Base):
    """Soumissions IMDS"""
    __tablename__ = "imds_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    internal_ref = Column(Text)
    mds_id = Column(Text)
    part_number = Column(Text)
    oem = Column(Text)
    submitted_at = Column(DateTime)
    status = Column(String(20), default="draft")
    rejection_reason = Column(Text)
    iteration_count = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relations
    supplier = relationship("Supplier")
    campaign = relationship("Campaign", back_populates="imds_submissions")


class PCFObject(Base):
    """Objets PCF (Product Carbon Footprint)"""
    __tablename__ = "pcf_objects"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    product_ref = Column(Text)
    perimeter = Column(Text)
    reference_year = Column(Integer)
    total_emissions_kgco2e = Column(Numeric(12, 4))
    method = Column(Text)
    frameworks = Column(ARRAY(Text))
    emission_factor_sources = Column(ARRAY(Text))
    uncertainty = Column(Text)
    validation_status = Column(String(20), default="pending")
    validation_notes = Column(Text)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relations
    supplier = relationship("Supplier")
    campaign = relationship("Campaign", back_populates="pcf_objects")


# ============================================================================
# TASKS & EVENTS
# ============================================================================

class Task(Base):
    """Tâches du système"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Text)
    status = Column(String(20), default="pending")
    payload = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Event(Base):
    """Événements du système"""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(Text)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    data = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())


# ============================================================================
# KNOWLEDGE BASE (RAG)
# ============================================================================

class KnowledgeDocument(Base):
    """Documents de la base de connaissances"""
    __tablename__ = "knowledge_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(Text)
    title = Column(Text)
    url = Column(Text)
    description = Column(Text)
    tags = Column(ARRAY(Text))
    created_at = Column(DateTime, server_default=func.now())
    
    # Relations
    chunks = relationship("KnowledgeChunk", back_populates="document")


class KnowledgeChunk(Base):
    """Chunks de documents pour le RAG"""
    __tablename__ = "knowledge_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("knowledge_documents.id"), nullable=False)
    chunk_index = Column(Integer)
    content = Column(Text)
    # Note: Le champ embedding vector(1536) est géré par pgvector, pas SQLAlchemy standard
    chunk_metadata = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relations
    document = relationship("KnowledgeDocument", back_populates="chunks")
