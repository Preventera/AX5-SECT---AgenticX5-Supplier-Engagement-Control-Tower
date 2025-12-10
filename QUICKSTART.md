# 🚀 AX5-SECT - Guide de Démarrage Rapide (Windows)

## 📋 Prérequis

- **Python 3.11+** : [Télécharger Python](https://www.python.org/downloads/)
- **PostgreSQL 15+** : [Télécharger PostgreSQL](https://www.postgresql.org/download/windows/)
- **Git** : [Télécharger Git](https://git-scm.com/download/win)
- **VS Code** : Déjà installé ✓
- **Clé API Anthropic** : [Console Anthropic](https://console.anthropic.com/)

---

## 🔧 Installation en 5 minutes

### Étape 1 : Cloner ou initialiser le repo

**Option A - Cloner depuis GitHub :**
```powershell
cd C:\Users\Mario\Documents\PROJECTS_NEW
git clone https://github.com/Preventera/AX5-SECT---AgenticX5-Supplier-Engagement-Control-Tower.git
cd "AX5-SECT---AgenticX5-Supplier-Engagement-Control-Tower"
```

**Option B - Initialiser un nouveau repo :**
```powershell
cd "C:\Users\Mario\Documents\PROJECTS_NEW\AX5-SECT - AgenticX5 Supplier Engagement Control Tower"
git init
git remote add origin https://github.com/Preventera/AX5-SECT---AgenticX5-Supplier-Engagement-Control-Tower.git
```

### Étape 2 : Setup automatique

```powershell
# Dans VS Code, ouvrir le terminal PowerShell (Ctrl+`)
.\setup.ps1
```

Ou manuellement :
```powershell
# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement
.\venv\Scripts\Activate.ps1

# Installer les dépendances
pip install -r requirements.txt

# Copier le fichier de configuration
copy .env.example .env
```

### Étape 3 : Configurer les variables d'environnement

Ouvrir `.env` et remplir :

```env
# OBLIGATOIRE - Clé API Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-votre-cle-ici

# PostgreSQL (modifier si nécessaire)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ax5sect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=votre_mot_de_passe
```

### Étape 4 : Configurer PostgreSQL

```powershell
# Ouvrir pgAdmin ou psql et créer la base
# Via psql (si dans le PATH):
psql -U postgres -c "CREATE DATABASE ax5sect;"

# Appliquer le schéma
psql -U postgres -d ax5sect -f database/schema.sql
```

### Étape 5 : Lancer l'application

```powershell
# Option 1 : API avec hot reload (développement)
python main.py api --reload

# Option 2 : Chat interactif CLI
python main.py chat

# Option 3 : Démonstration
python main.py demo
```

---

## 📡 Tester l'API

Une fois l'API lancée sur `http://localhost:8000` :

### Via le navigateur
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

### Via PowerShell
```powershell
# Test simple
Invoke-RestMethod -Uri "http://localhost:8000/health"

# Test du chat
$body = @{
    message = "Quelles sont les exigences IMDS 15.0 pour le PCF?"
    debug = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/chat" -Method Post -Body $body -ContentType "application/json"
```

### Via curl (Git Bash)
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Conçois une campagne PCF pour nos fournisseurs"}'
```

---

## 🔄 Commandes Git

### Premier push vers GitHub

```powershell
# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - AX5-SECT LangGraph multi-agent system"

# Pousser vers GitHub
git push -u origin main
```

### Workflow quotidien

```powershell
# Vérifier le statut
git status

# Ajouter les modifications
git add .

# Commit avec message descriptif
git commit -m "feat: ajout de la fonctionnalité X"

# Pousser
git push
```

### Conventions de commit

| Préfixe | Usage |
|---------|-------|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `docs:` | Documentation |
| `refactor:` | Refactoring |
| `test:` | Tests |
| `chore:` | Maintenance |

---

## 📁 Structure du projet

```
AX5-SECT/
├── src/                    # Code source principal
│   ├── __init__.py        # Package init
│   ├── config.py          # Configuration
│   ├── models.py          # Modèles Pydantic
│   ├── state.py           # State LangGraph
│   ├── prompts.py         # Prompts des agents
│   ├── agents.py          # Implémentation des agents
│   ├── graph.py           # Graphe LangGraph
│   └── api.py             # API FastAPI
├── database/
│   └── schema.sql         # Schéma PostgreSQL
├── main.py                # Point d'entrée CLI
├── requirements.txt       # Dépendances Python
├── setup.ps1              # Script setup Windows
├── run-api.bat            # Lancer l'API (double-clic)
├── .env.example           # Template configuration
├── .gitignore             # Fichiers ignorés par Git
├── README.md              # Documentation principale
└── QUICKSTART.md          # Ce fichier
```

---

## ❓ Problèmes courants

### "python" n'est pas reconnu
→ Ajouter Python au PATH Windows ou utiliser `py` au lieu de `python`

### Erreur de connexion PostgreSQL
→ Vérifier que PostgreSQL est démarré (Services Windows)
→ Vérifier les credentials dans `.env`

### Erreur API Anthropic
→ Vérifier la clé API dans `.env`
→ Vérifier la connexion internet

### Module not found
→ Vérifier que l'environnement virtuel est activé : `.\venv\Scripts\Activate.ps1`

---

## 📞 Support

- **Documentation** : README.md
- **Issues** : https://github.com/Preventera/AX5-SECT---AgenticX5-Supplier-Engagement-Control-Tower/issues
- **Email** : support@genaisafety.com
