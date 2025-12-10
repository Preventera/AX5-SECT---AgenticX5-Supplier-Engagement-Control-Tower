-- ============================================================================
-- AX5-SECT - Schema PostgreSQL
-- Base de données pour le Hub Supplier Engagement Tool - IMDS & PCF
-- ============================================================================

-- Extension pgvector pour les embeddings RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- TABLES FOURNISSEURS & CONTACTS
-- ============================================================================

-- Table principale des fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(128),              -- Code ERP / fournisseur externe
    name TEXT NOT NULL,
    parent_group TEXT,                      -- Groupe / maison-mère
    country_code CHAR(2),
    region TEXT,
    supplier_type TEXT,                     -- 'matiere', 'composant', 'assemblage', 'service'
    supply_chain_level TEXT,                -- 'Tier-1', 'Tier-2', 'Tier-3', 'Tier-N'
    main_part_families TEXT[],              -- ex: '{chassis,interior,powertrain}'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_suppliers_external_id ON suppliers(external_id);
CREATE INDEX idx_suppliers_country ON suppliers(country_code);
CREATE INDEX idx_suppliers_type ON suppliers(supplier_type);

-- Contacts des fournisseurs
CREATE TABLE IF NOT EXISTS supplier_contacts (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT,                              -- 'qualité', 'RSE', 'ventes', 'IT', 'direction'
    email TEXT,
    phone TEXT,
    languages TEXT[],                       -- '{fr,en,de}'
    preferred_channels TEXT[],              -- '{email,portal,teams}'
    time_zone TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contacts_supplier ON supplier_contacts(supplier_id);
CREATE INDEX idx_contacts_email ON supplier_contacts(email);

-- ============================================================================
-- PROFILS IMDS & PCF
-- ============================================================================

-- Profil IMDS d'un fournisseur
CREATE TABLE IF NOT EXISTS imds_profiles (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE UNIQUE,
    imds_id TEXT,                           -- Numéro IMDS du fournisseur
    oems_served TEXT[],                     -- '{OEM1,OEM2,OEM3}'
    on_time_submission_rate NUMERIC(5,4),   -- 0.0000 à 1.0000
    oem_rejection_rate NUMERIC(5,4),        -- 0.0000 à 1.0000
    avg_submission_leadtime_days NUMERIC(6,2),
    support_level TEXT CHECK (support_level IN ('low', 'medium', 'high')),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_imds_profiles_imds_id ON imds_profiles(imds_id);

-- Profil PCF d'un fournisseur
CREATE TABLE IF NOT EXISTS pcf_profiles (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE UNIQUE,
    pcf_maturity TEXT CHECK (pcf_maturity IN ('beginner', 'intermediate', 'advanced')),
    tools_used TEXT[],                      -- '{Excel,M2030,Sphera,custom}'
    pcf_count INTEGER DEFAULT 0,            -- Nombre de PCF produits disponibles
    scopes_covered TEXT[],                  -- '{cradle-to-gate,A1-A3,full-lifecycle}'
    reference_years INTEGER[],              -- '{2023,2024}'
    frameworks TEXT[],                      -- '{ISO14067,GHG,Catena-X,PEF}'
    data_quality_score NUMERIC(5,2),        -- 0 à 100
    notes TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Métadonnées Hub pour priorisation
CREATE TABLE IF NOT EXISTS supplier_hub_metadata (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE UNIQUE,
    priority CHAR(1) CHECK (priority IN ('A', 'B', 'C')),
    regulatory_risk NUMERIC(5,2),           -- 0 à 100
    climate_risk NUMERIC(5,2),              -- 0 à 100
    program_status TEXT,                    -- 'non_engaged', 'in_progress', 'advanced'
    strategic_notes TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hub_metadata_priority ON supplier_hub_metadata(priority);

-- ============================================================================
-- CAMPAGNES
-- ============================================================================

-- Campagnes IMDS / PCF
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('IMDS', 'PCF', 'MIXED')) NOT NULL,
    objective TEXT,
    start_date DATE,
    end_date DATE,
    target_part_families TEXT[],
    created_by TEXT,                        -- Utilisateur ou système
    status TEXT DEFAULT 'draft',            -- 'draft', 'active', 'paused', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- Statut d'un fournisseur dans une campagne
CREATE TABLE IF NOT EXISTS campaign_supplier_status (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started',      -- 'not_started', 'in_progress', 'submitted', 'validated', 'overdue', 'rejected'
    last_contact_at TIMESTAMP,
    reminders_sent INTEGER DEFAULT 0,
    progression_score NUMERIC(5,2),         -- 0 à 100
    notes TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (campaign_id, supplier_id)
);

CREATE INDEX idx_campaign_status_campaign ON campaign_supplier_status(campaign_id);
CREATE INDEX idx_campaign_status_supplier ON campaign_supplier_status(supplier_id);
CREATE INDEX idx_campaign_status_status ON campaign_supplier_status(status);

-- ============================================================================
-- SOUMISSIONS IMDS & OBJETS PCF
-- ============================================================================

-- Soumissions IMDS
CREATE TABLE IF NOT EXISTS imds_submissions (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    internal_ref TEXT,                      -- Référence interne
    mds_id TEXT,                            -- ID MDS dans IMDS
    part_number TEXT,
    oem TEXT,
    submitted_at TIMESTAMP,
    status TEXT DEFAULT 'draft',            -- 'draft', 'submitted', 'validated', 'rejected'
    rejection_reason TEXT,
    iteration_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_imds_submissions_supplier ON imds_submissions(supplier_id);
CREATE INDEX idx_imds_submissions_campaign ON imds_submissions(campaign_id);
CREATE INDEX idx_imds_submissions_status ON imds_submissions(status);
CREATE INDEX idx_imds_submissions_mds_id ON imds_submissions(mds_id);

-- Objets PCF (Product Carbon Footprint)
CREATE TABLE IF NOT EXISTS pcf_objects (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    product_ref TEXT,                       -- Code produit / pièce
    perimeter TEXT,                         -- 'cradle-to-gate', 'A1-A3', 'full-lifecycle'
    reference_year INTEGER,
    total_emissions_kgco2e NUMERIC(12,4),
    method TEXT,                            -- 'ISO 14067', 'PEF', 'GHG Product'
    frameworks TEXT[],                      -- '{Catena-X,ISO14067}'
    emission_factor_sources TEXT[],         -- '{Ecoinvent,GaBi,internal}'
    uncertainty TEXT,
    validation_status TEXT DEFAULT 'pending', -- 'pending', 'validated', 'rejected'
    validation_notes TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pcf_objects_supplier ON pcf_objects(supplier_id);
CREATE INDEX idx_pcf_objects_campaign ON pcf_objects(campaign_id);
CREATE INDEX idx_pcf_objects_validation ON pcf_objects(validation_status);
CREATE INDEX idx_pcf_objects_product ON pcf_objects(product_ref);

-- ============================================================================
-- TÂCHES & ÉVÉNEMENTS (AGENTIC)
-- ============================================================================

-- Tâches pour les agents
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,                     -- 'reminder', 'audit', 'data_check', 'report'
    status TEXT DEFAULT 'pending',          -- 'pending', 'in_progress', 'done', 'failed'
    payload JSONB,                          -- Contexte et paramètres
    scheduled_at TIMESTAMP,
    executed_at TIMESTAMP,
    result JSONB,
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_scheduled ON tasks(scheduled_at);

-- Événements système (audit trail)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,               -- 'CAMPAIGN_CREATED', 'IMDS_REJECTED', 'PCF_SUBMITTED', etc.
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    user_id TEXT,                           -- Utilisateur ou agent
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_supplier ON events(supplier_id);
CREATE INDEX idx_events_campaign ON events(campaign_id);
CREATE INDEX idx_events_created ON events(created_at);

-- ============================================================================
-- RAG - DOCUMENTS & CHUNKS (PGVECTOR)
-- ============================================================================

-- Documents de la base de connaissances
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id SERIAL PRIMARY KEY,
    source_type TEXT NOT NULL,              -- 'norme', 'guide_oem', 'blog', 'interne', 'fiche'
    title TEXT NOT NULL,
    url TEXT,
    description TEXT,
    tags TEXT[],                            -- '{IMDS,PCF,Scope3,Catena-X}'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_knowledge_docs_source ON knowledge_documents(source_type);
CREATE INDEX idx_knowledge_docs_tags ON knowledge_documents USING GIN(tags);

-- Chunks pour le RAG
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),                 -- Dimension pour OpenAI text-embedding-3-small
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_knowledge_chunks_doc ON knowledge_chunks(document_id);

-- Index HNSW pour recherche vectorielle rapide
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- VUES UTILES
-- ============================================================================

-- Vue complète d'un fournisseur
CREATE OR REPLACE VIEW v_supplier_full AS
SELECT 
    s.*,
    ip.imds_id,
    ip.on_time_submission_rate,
    ip.oem_rejection_rate,
    ip.support_level as imds_support_level,
    pp.pcf_maturity,
    pp.pcf_count,
    pp.data_quality_score as pcf_quality_score,
    hm.priority,
    hm.regulatory_risk,
    hm.climate_risk,
    hm.program_status
FROM suppliers s
LEFT JOIN imds_profiles ip ON s.id = ip.supplier_id
LEFT JOIN pcf_profiles pp ON s.id = pp.supplier_id
LEFT JOIN supplier_hub_metadata hm ON s.id = hm.supplier_id;

-- Vue tableau de bord campagne
CREATE OR REPLACE VIEW v_campaign_dashboard AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.type as campaign_type,
    c.status as campaign_status,
    c.start_date,
    c.end_date,
    COUNT(css.id) as total_suppliers,
    COUNT(CASE WHEN css.status = 'not_started' THEN 1 END) as not_started,
    COUNT(CASE WHEN css.status = 'in_progress' THEN 1 END) as in_progress,
    COUNT(CASE WHEN css.status = 'submitted' THEN 1 END) as submitted,
    COUNT(CASE WHEN css.status = 'validated' THEN 1 END) as validated,
    COUNT(CASE WHEN css.status = 'overdue' THEN 1 END) as overdue,
    COUNT(CASE WHEN css.status = 'rejected' THEN 1 END) as rejected,
    ROUND(
        COUNT(CASE WHEN css.status IN ('submitted', 'validated') THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(css.id), 0) * 100, 
        2
    ) as completion_rate,
    ROUND(AVG(css.progression_score), 2) as avg_progression
FROM campaigns c
LEFT JOIN campaign_supplier_status css ON c.id = css.campaign_id
GROUP BY c.id, c.name, c.type, c.status, c.start_date, c.end_date;

-- ============================================================================
-- TRIGGERS POUR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à toutes les tables avec updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trigger_update_%I_updated_at ON %I;
            CREATE TRIGGER trigger_update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- ============================================================================
-- DONNÉES DE DÉMONSTRATION (OPTIONNEL)
-- ============================================================================

-- Insérer quelques fournisseurs de démonstration
INSERT INTO suppliers (external_id, name, country_code, region, supplier_type, supply_chain_level, main_part_families)
VALUES 
    ('SUP-001', 'Marmen Inc.', 'CA', 'Mauricie', 'composant', 'Tier-1', '{structures,éoliennes}'),
    ('SUP-002', 'Kruger Wayagamack', 'CA', 'Mauricie', 'matiere', 'Tier-1', '{papier,carton}'),
    ('SUP-003', 'Ambiance Bois Structures', 'CA', 'Mauricie', 'composant', 'Tier-1', '{bois,structures}'),
    ('SUP-004', 'AGT Robotique', 'CA', 'Mauricie', 'assemblage', 'Tier-2', '{robotique,automation}'),
    ('SUP-005', 'Olymel La Fernandière', 'CA', 'Mauricie', 'assemblage', 'Tier-1', '{agroalimentaire}')
ON CONFLICT DO NOTHING;

-- Créer les profils IMDS pour les fournisseurs
INSERT INTO imds_profiles (supplier_id, imds_id, oems_served, on_time_submission_rate, support_level)
SELECT id, 'IMDS-' || id, '{OEM1,OEM2}', 0.85, 'medium'
FROM suppliers
WHERE NOT EXISTS (SELECT 1 FROM imds_profiles WHERE supplier_id = suppliers.id);

-- Créer les profils PCF
INSERT INTO pcf_profiles (supplier_id, pcf_maturity, tools_used, pcf_count, frameworks)
SELECT id, 'beginner', '{Excel}', 0, '{ISO14067}'
FROM suppliers
WHERE NOT EXISTS (SELECT 1 FROM pcf_profiles WHERE supplier_id = suppliers.id);

-- Créer les métadonnées Hub
INSERT INTO supplier_hub_metadata (supplier_id, priority, program_status)
SELECT id, 'B', 'non_engaged'
FROM suppliers
WHERE NOT EXISTS (SELECT 1 FROM supplier_hub_metadata WHERE supplier_id = suppliers.id);

COMMENT ON SCHEMA public IS 'AX5-SECT - AgenticX5 Supplier Engagement Control Tower Database Schema';
