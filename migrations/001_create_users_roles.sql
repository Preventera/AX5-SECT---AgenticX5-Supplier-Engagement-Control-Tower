-- =====================================================
-- AX5-SECT : Table Users avec Rôles
-- =====================================================

-- Table des utilisateurs avec rôles
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  
  -- Identité
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  
  -- Rôle (enum)
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  -- Valeurs possibles: 'admin', 'quality_manager', 'data_steward', 'viewer'
  
  -- Organisation
  department VARCHAR(100),
  job_title VARCHAR(100),
  
  -- Préférences
  language VARCHAR(10) DEFAULT 'fr',
  theme VARCHAR(20) DEFAULT 'dark',
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Table des permissions par rôle (référence)
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  permission VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role, permission)
);

-- Insérer les permissions par défaut
INSERT INTO role_permissions (role, permission) VALUES
  -- Admin : tout
  ('admin', 'suppliers:read'),
  ('admin', 'suppliers:write'),
  ('admin', 'suppliers:delete'),
  ('admin', 'campaigns:read'),
  ('admin', 'campaigns:write'),
  ('admin', 'campaigns:delete'),
  ('admin', 'imds:read'),
  ('admin', 'imds:write'),
  ('admin', 'imds:validate'),
  ('admin', 'pcf:read'),
  ('admin', 'pcf:write'),
  ('admin', 'pcf:validate'),
  ('admin', 'users:read'),
  ('admin', 'users:write'),
  ('admin', 'settings:read'),
  ('admin', 'settings:write'),
  ('admin', 'chat:use'),
  
  -- Quality Manager : validation IMDS/PCF
  ('quality_manager', 'suppliers:read'),
  ('quality_manager', 'suppliers:write'),
  ('quality_manager', 'campaigns:read'),
  ('quality_manager', 'campaigns:write'),
  ('quality_manager', 'imds:read'),
  ('quality_manager', 'imds:write'),
  ('quality_manager', 'imds:validate'),
  ('quality_manager', 'pcf:read'),
  ('quality_manager', 'pcf:write'),
  ('quality_manager', 'pcf:validate'),
  ('quality_manager', 'chat:use'),
  
  -- Data Steward : gestion données
  ('data_steward', 'suppliers:read'),
  ('data_steward', 'suppliers:write'),
  ('data_steward', 'campaigns:read'),
  ('data_steward', 'imds:read'),
  ('data_steward', 'imds:write'),
  ('data_steward', 'pcf:read'),
  ('data_steward', 'pcf:write'),
  ('data_steward', 'chat:use'),
  
  -- Viewer : lecture seule
  ('viewer', 'suppliers:read'),
  ('viewer', 'campaigns:read'),
  ('viewer', 'imds:read'),
  ('viewer', 'pcf:read'),
  ('viewer', 'chat:use')
ON CONFLICT (role, permission) DO NOTHING;

-- Créer un utilisateur admin par défaut
INSERT INTO users (email, name, role, department, job_title, language)
VALUES 
  ('admin@agenticx5.com', 'Admin RSE', 'admin', 'RSE / Achats', 'Responsable RSE', 'fr'),
  ('quality@agenticx5.com', 'Marie Qualité', 'quality_manager', 'Qualité', 'Quality Manager', 'fr'),
  ('data@agenticx5.com', 'Jean Data', 'data_steward', 'IT / Data', 'Data Steward', 'fr')
ON CONFLICT (email) DO NOTHING;

-- Vue pour obtenir les permissions d'un utilisateur
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  rp.permission
FROM users u
LEFT JOIN role_permissions rp ON u.role = rp.role
WHERE u.is_active = true;
