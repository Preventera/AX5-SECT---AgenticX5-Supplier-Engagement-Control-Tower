"""
AX5-SECT Database Seed
Script pour insérer des données de démonstration
"""

import sys
from datetime import datetime, timedelta
import random

# Ajouter le dossier parent au path pour les imports
sys.path.insert(0, '.')

from src.database import get_db_session
from src.db_models import (
    Supplier, SupplierContact, IMDSProfile, PCFProfile, SupplierHubMetadata,
    Campaign, CampaignSupplierStatus,
    IMDSSubmission, PCFObject,
    KnowledgeDocument
)


# ============================================================================
# DONNÉES DE DÉMONSTRATION
# ============================================================================

DEMO_SUPPLIERS = [
    {
        "external_id": "SUP-001",
        "name": "Bosch Automotive",
        "parent_group": "Robert Bosch GmbH",
        "country_code": "DE",
        "region": "Europe",
        "supplier_type": "component",
        "supply_chain_level": "tier1",
        "main_part_families": ["electronics", "sensors", "actuators"]
    },
    {
        "external_id": "SUP-002",
        "name": "Valeo SA",
        "parent_group": "Valeo",
        "country_code": "FR",
        "region": "Europe",
        "supplier_type": "assembly",
        "supply_chain_level": "tier1",
        "main_part_families": ["lighting", "thermal", "visibility"]
    },
    {
        "external_id": "SUP-003",
        "name": "Continental AG",
        "parent_group": "Continental",
        "country_code": "DE",
        "region": "Europe",
        "supplier_type": "component",
        "supply_chain_level": "tier1",
        "main_part_families": ["tires", "brakes", "electronics"]
    },
    {
        "external_id": "SUP-004",
        "name": "Denso Corporation",
        "parent_group": "Denso",
        "country_code": "JP",
        "region": "Asia",
        "supplier_type": "component",
        "supply_chain_level": "tier1",
        "main_part_families": ["thermal", "powertrain", "electronics"]
    },
    {
        "external_id": "SUP-005",
        "name": "ZF Friedrichshafen",
        "parent_group": "ZF Group",
        "country_code": "DE",
        "region": "Europe",
        "supplier_type": "assembly",
        "supply_chain_level": "tier1",
        "main_part_families": ["transmission", "chassis", "safety"]
    },
    {
        "external_id": "SUP-006",
        "name": "Magna International",
        "parent_group": "Magna",
        "country_code": "CA",
        "region": "North America",
        "supplier_type": "assembly",
        "supply_chain_level": "tier1",
        "main_part_families": ["body", "chassis", "seating"]
    },
    {
        "external_id": "SUP-007",
        "name": "Aisin Seiki",
        "parent_group": "Aisin",
        "country_code": "JP",
        "region": "Asia",
        "supplier_type": "component",
        "supply_chain_level": "tier1",
        "main_part_families": ["drivetrain", "body", "brakes"]
    },
    {
        "external_id": "SUP-008",
        "name": "Lear Corporation",
        "parent_group": "Lear",
        "country_code": "US",
        "region": "North America",
        "supplier_type": "assembly",
        "supply_chain_level": "tier1",
        "main_part_families": ["seating", "electrical"]
    },
    {
        "external_id": "SUP-009",
        "name": "Faurecia",
        "parent_group": "Forvia",
        "country_code": "FR",
        "region": "Europe",
        "supplier_type": "assembly",
        "supply_chain_level": "tier1",
        "main_part_families": ["interior", "seating", "clean_mobility"]
    },
    {
        "external_id": "SUP-010",
        "name": "Plastic Omnium",
        "parent_group": "Plastic Omnium",
        "country_code": "FR",
        "region": "Europe",
        "supplier_type": "component",
        "supply_chain_level": "tier1",
        "main_part_families": ["exterior", "fuel_systems", "modules"]
    },
    # Tier 2 suppliers
    {
        "external_id": "SUP-011",
        "name": "Precision Metals GmbH",
        "parent_group": None,
        "country_code": "DE",
        "region": "Europe",
        "supplier_type": "material",
        "supply_chain_level": "tier2",
        "main_part_families": ["steel", "aluminum", "castings"]
    },
    {
        "external_id": "SUP-012",
        "name": "Chemical Solutions Inc",
        "parent_group": None,
        "country_code": "US",
        "region": "North America",
        "supplier_type": "material",
        "supply_chain_level": "tier2",
        "main_part_families": ["coatings", "adhesives", "plastics"]
    },
]


DEMO_CAMPAIGNS = [
    {
        "name": "Campagne PCF Q1 2025 - Tier 1",
        "type": "PCF",
        "objective": "Collecter les PCF des 10 principaux fournisseurs Tier-1",
        "status": "active",
        "start_date": datetime(2025, 1, 15),
        "end_date": datetime(2025, 3, 31),
        "target_part_families": ["electronics", "seating", "chassis"],
        "created_by": "RSE Team"
    },
    {
        "name": "IMDS Compliance 2025",
        "type": "IMDS",
        "objective": "Mise à jour IMDS 15.0 pour tous les fournisseurs",
        "status": "active",
        "start_date": datetime(2025, 1, 1),
        "end_date": datetime(2025, 6, 30),
        "target_part_families": None,
        "created_by": "Quality Team"
    },
    {
        "name": "Campagne Mixte Scope 3",
        "type": "MIXED",
        "objective": "Améliorer la couverture données Scope 3",
        "status": "draft",
        "start_date": datetime(2025, 4, 1),
        "end_date": datetime(2025, 9, 30),
        "target_part_families": ["thermal", "powertrain"],
        "created_by": "RSE Team"
    }
]


DEMO_KNOWLEDGE_DOCS = [
    {
        "source_type": "norme",
        "title": "IMDS 15.0 - Guide PCF",
        "url": "https://imds.example.com/pcf-guide",
        "description": "Guide officiel pour la déclaration PCF dans IMDS 15.0",
        "tags": ["IMDS", "PCF", "guide"]
    },
    {
        "source_type": "norme",
        "title": "Catena-X PCF Rulebook",
        "url": "https://catena-x.net/pcf-rulebook",
        "description": "Règles de calcul PCF pour l'industrie automobile",
        "tags": ["Catena-X", "PCF", "automobile"]
    },
    {
        "source_type": "guide",
        "title": "GHG Protocol - Scope 3 Guidance",
        "url": "https://ghgprotocol.org/scope3",
        "description": "Guide pour le reporting des émissions Scope 3",
        "tags": ["GHG", "Scope3", "reporting"]
    },
    {
        "source_type": "interne",
        "title": "Procédure d'engagement fournisseurs",
        "url": None,
        "description": "Procédure interne pour les campagnes d'engagement fournisseurs",
        "tags": ["interne", "procedure", "engagement"]
    }
]


# ============================================================================
# FONCTIONS DE SEED
# ============================================================================

def seed_suppliers(db):
    """Insère les fournisseurs de démonstration"""
    print("📦 Insertion des fournisseurs...")
    
    suppliers = []
    for data in DEMO_SUPPLIERS:
        # Vérifier si le fournisseur existe déjà
        existing = db.query(Supplier).filter(Supplier.external_id == data["external_id"]).first()
        if existing:
            print(f"  ⏭️  {data['name']} existe déjà")
            suppliers.append(existing)
            continue
        
        supplier = Supplier(**data)
        db.add(supplier)
        db.flush()  # Pour obtenir l'ID
        suppliers.append(supplier)
        
        # Ajouter un contact principal
        contact = SupplierContact(
            supplier_id=supplier.id,
            full_name=f"Contact {data['name']}",
            role="Quality Manager",
            email=f"contact@{data['external_id'].lower()}.com",
            languages=["en", "fr"] if data["country_code"] in ["FR", "CA"] else ["en"],
            is_primary=True
        )
        db.add(contact)
        
        # Ajouter un profil IMDS
        imds_profile = IMDSProfile(
            supplier_id=supplier.id,
            imds_id=f"IMDS-{data['external_id']}",
            oems_served=["VW", "BMW", "Mercedes"] if data["region"] == "Europe" else ["GM", "Ford", "Toyota"],
            on_time_submission_rate=random.uniform(0.7, 0.98),
            oem_rejection_rate=random.uniform(0.02, 0.15),
            avg_submission_leadtime_days=random.randint(5, 20),
            support_level=random.choice(["low", "medium", "high"])
        )
        db.add(imds_profile)
        
        # Ajouter un profil PCF
        pcf_profile = PCFProfile(
            supplier_id=supplier.id,
            pcf_maturity=random.choice(["beginner", "intermediate", "advanced"]),
            tools_used=random.sample(["Excel", "SimaPro", "GaBi", "OpenLCA", "Sphera"], k=random.randint(1, 3)),
            pcf_count=random.randint(0, 50),
            scopes_covered=["cradle-to-gate"] if random.random() > 0.3 else ["cradle-to-gate", "A1-A3"],
            frameworks=random.sample(["ISO14067", "GHG Protocol", "Catena-X", "PEF"], k=random.randint(1, 3)),
            data_quality_score=random.uniform(50, 95)
        )
        db.add(pcf_profile)
        
        # Ajouter les métadonnées Hub
        hub_meta = SupplierHubMetadata(
            supplier_id=supplier.id,
            priority=random.choice(["A", "B", "C"]),
            regulatory_risk=random.choice(["low", "medium", "high"]),
            climate_risk=random.choice(["low", "medium", "high"]),
            program_status="active"
        )
        db.add(hub_meta)
        
        print(f"  ✅ {data['name']}")
    
    db.commit()
    return suppliers


def seed_campaigns(db, suppliers):
    """Insère les campagnes de démonstration"""
    print("\n🎯 Insertion des campagnes...")
    
    campaigns = []
    for data in DEMO_CAMPAIGNS:
        # Vérifier si la campagne existe déjà
        existing = db.query(Campaign).filter(Campaign.name == data["name"]).first()
        if existing:
            print(f"  ⏭️  {data['name']} existe déjà")
            campaigns.append(existing)
            continue
        
        campaign = Campaign(**data)
        db.add(campaign)
        db.flush()
        campaigns.append(campaign)
        
        # Ajouter des fournisseurs à la campagne (pour les campagnes actives)
        if data["status"] == "active":
            # Sélectionner des fournisseurs Tier-1
            tier1_suppliers = [s for s in suppliers if s.supply_chain_level == "tier1"]
            for supplier in random.sample(tier1_suppliers, min(len(tier1_suppliers), 8)):
                status = CampaignSupplierStatus(
                    campaign_id=campaign.id,
                    supplier_id=supplier.id,
                    status=random.choice(["not_started", "in_progress", "submitted", "validated"]),
                    reminders_sent=random.randint(0, 3),
                    progression_score=random.uniform(0, 100)
                )
                db.add(status)
        
        print(f"  ✅ {data['name']}")
    
    db.commit()
    return campaigns


def seed_submissions(db, suppliers, campaigns):
    """Insère des soumissions de démonstration"""
    print("\n📄 Insertion des soumissions...")
    
    # Trouver la campagne PCF active
    pcf_campaign = next((c for c in campaigns if c.type == "PCF" and c.status == "active"), None)
    imds_campaign = next((c for c in campaigns if c.type == "IMDS" and c.status == "active"), None)
    
    for supplier in suppliers[:8]:  # Premiers fournisseurs seulement
        # Soumissions IMDS
        if imds_campaign:
            for i in range(random.randint(1, 3)):
                imds = IMDSSubmission(
                    supplier_id=supplier.id,
                    campaign_id=imds_campaign.id,
                    internal_ref=f"INT-{supplier.external_id}-{i+1}",
                    mds_id=f"MDS-{random.randint(100000, 999999)}",
                    part_number=f"PN-{random.randint(1000, 9999)}",
                    oem=random.choice(["VW", "BMW", "Mercedes", "GM", "Ford"]),
                    status=random.choice(["draft", "submitted", "validated", "rejected"]),
                    submitted_at=datetime.now() - timedelta(days=random.randint(1, 30))
                )
                db.add(imds)
        
        # Objets PCF
        if pcf_campaign:
            for i in range(random.randint(1, 5)):
                pcf = PCFObject(
                    supplier_id=supplier.id,
                    campaign_id=pcf_campaign.id,
                    product_ref=f"PROD-{supplier.external_id}-{i+1}",
                    perimeter="cradle-to-gate",
                    reference_year=2024,
                    total_emissions_kgco2e=random.uniform(10, 500),
                    method=random.choice(["ISO 14067", "PEF", "GHG Protocol"]),
                    frameworks=["Catena-X"],
                    validation_status=random.choice(["pending", "validated", "rejected"])
                )
                db.add(pcf)
    
    db.commit()
    print(f"  ✅ Soumissions IMDS et PCF créées")


def seed_knowledge(db):
    """Insère les documents de base de connaissances"""
    print("\n📚 Insertion des documents de connaissance...")
    
    for data in DEMO_KNOWLEDGE_DOCS:
        existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.title == data["title"]).first()
        if existing:
            print(f"  ⏭️  {data['title']} existe déjà")
            continue
        
        doc = KnowledgeDocument(**data)
        db.add(doc)
        print(f"  ✅ {data['title']}")
    
    db.commit()


# ============================================================================
# MAIN
# ============================================================================

def run_seed():
    """Exécute le seed complet"""
    print("=" * 60)
    print("🌱 AX5-SECT Database Seed")
    print("=" * 60)
    
    try:
        with get_db_session() as db:
            suppliers = seed_suppliers(db)
            campaigns = seed_campaigns(db, suppliers)
            seed_submissions(db, suppliers, campaigns)
            seed_knowledge(db)
            
            print("\n" + "=" * 60)
            print("✅ Seed terminé avec succès !")
            print("=" * 60)
            
            # Afficher les stats
            print(f"\n📊 Statistiques :")
            print(f"   - Fournisseurs : {db.query(Supplier).count()}")
            print(f"   - Campagnes : {db.query(Campaign).count()}")
            print(f"   - Soumissions IMDS : {db.query(IMDSSubmission).count()}")
            print(f"   - Objets PCF : {db.query(PCFObject).count()}")
            print(f"   - Documents : {db.query(KnowledgeDocument).count()}")
            
    except Exception as e:
        print(f"\n❌ Erreur lors du seed : {e}")
        raise


if __name__ == "__main__":
    run_seed()
