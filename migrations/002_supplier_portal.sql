-- =====================================================
-- AX5-SECT : Portail Fournisseur - Tokens d'accès
-- =====================================================

-- Table des tokens d'accès pour les fournisseurs
CREATE TABLE IF NOT EXISTS supplier_access_tokens (
  id SERIAL PRIMARY KEY,
  
  -- Lien avec le fournisseur
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  
  -- Lien avec la campagne (optionnel)
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Token unique
  token VARCHAR(64) UNIQUE NOT NULL,
  
  -- Contact associé
  contact_email VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  
  -- Validité
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Utilisation
  last_used_at TIMESTAMP,
  use_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_tokens_token ON supplier_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_supplier ON supplier_access_tokens(supplier_id);
CREATE INDEX IF NOT EXISTS idx_tokens_email ON supplier_access_tokens(contact_email);

-- Table des soumissions fournisseurs via portail
CREATE TABLE IF NOT EXISTS portal_submissions (
  id SERIAL PRIMARY KEY,
  
  -- Liens
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  campaign_id INTEGER REFERENCES campaigns(id),
  token_id INTEGER REFERENCES supplier_access_tokens(id),
  
  -- Type de soumission
  submission_type VARCHAR(20) NOT NULL, -- 'imds' ou 'pcf'
  
  -- Données IMDS (si type = imds)
  mds_id VARCHAR(50),
  part_number VARCHAR(100),
  part_name VARCHAR(255),
  oem VARCHAR(100),
  
  -- Données PCF (si type = pcf)
  product_name VARCHAR(255),
  emissions_total DECIMAL(12,4),
  emissions_unit VARCHAR(20) DEFAULT 'kg CO2e',
  perimeter VARCHAR(50),
  methodology VARCHAR(50),
  reference_year INTEGER,
  
  -- Fichiers joints (JSON array)
  attachments JSONB DEFAULT '[]',
  
  -- Notes
  notes TEXT,
  
  -- Statut
  status VARCHAR(30) DEFAULT 'draft', -- draft, submitted, under_review, validated, rejected
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  review_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_portal_submissions_supplier ON portal_submissions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_portal_submissions_status ON portal_submissions(status);

-- Fonction pour générer un token unique
CREATE OR REPLACE FUNCTION generate_supplier_token()
RETURNS VARCHAR(64) AS $$
DECLARE
  new_token VARCHAR(64);
BEGIN
  -- Génère un token de 64 caractères (hex)
  new_token := encode(gen_random_bytes(32), 'hex');
  RETURN new_token;
END;
$$ LANGUAGE plpgsql;

-- Vue pour les soumissions avec infos fournisseur
CREATE OR REPLACE VIEW portal_submissions_view AS
SELECT 
  ps.*,
  s.name as supplier_name,
  s.email as supplier_email,
  c.name as campaign_name
FROM portal_submissions ps
LEFT JOIN suppliers s ON ps.supplier_id = s.id
LEFT JOIN campaigns c ON ps.campaign_id = c.id;
