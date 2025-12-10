# AX5-SECT - AgenticX5 Supplier Engagement Control Tower

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2+-purple.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

**Tour de contrôle multi-agents pour l'engagement fournisseurs IMDS & PCF**

</div>

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Reference](#api-reference)
- [Agents](#agents)
- [Base de données](#base-de-données)
- [Développement](#développement)

---

## 🎯 Vue d'ensemble

**AX5-SECT** est une application multi-agents construite sur **LangGraph** qui permet de :

- 📚 **Centraliser les connaissances** IMDS & PCF (normes, guides OEM, meilleures pratiques)
- 🏢 **Structurer une base fournisseurs** enrichie avec profils IMDS et PCF
- 🎯 **Orchestrer des campagnes** d'engagement et de collecte de données
- 📝 **Générer des contenus** opérationnels (emails, scripts, supports)
- 📊 **Automatiser** les contrôles, relances et reporting

### Cas d'usage

| Domaine | Exemples |
|---------|----------|
| **IMDS** | Conformité matériaux, arbres MDS, substances interdites, GADSL |
| **PCF** | Product Carbon Footprint, ISO 14067, Catena-X PCF Rulebook |
| **Scope 3** | Émissions fournisseurs, SBTi, CSRD |
| **Engagement** | Campagnes, relances, onboarding, KPI |

---

## 🏗️ Architecture

### Architecture Multi-Agents LangGraph

```
                    ┌─────────────────┐
                    │   Utilisateur   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  API FastAPI    │
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │      ORCHESTRATEUR           │
              │  (Analyse & Routage)         │
              └──────────────┬───────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Knowledge Miner │ │  Data Modeler   │ │Campaign Manager │
│  (Recherche)    │ │ (Modélisation)  │ │  (Campagnes)    │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │Content Generator│
                    │   (Contenus)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Synthesizer   │
                    │  (Réponse)      │
                    └─────────────────┘
```

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Orchestration** | LangGraph (Python) |
| **LLM** | Claude (Anthropic) |
| **Backend API** | FastAPI |
| **Base de données** | PostgreSQL + pgvector |
| **Graph (optionnel)** | Neo4j |
| **Frontend** | Next.js + React + Tailwind |

---

## 🚀 Installation

### Prérequis

- Python 3.11+
- PostgreSQL 15+ avec pgvector
- Clé API Anthropic

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-org/ax5-sect.git
cd ax5-sect

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Copier et configurer le .env
cp .env.example .env
# Éditer .env avec vos clés
```

### Configuration de la base de données

```bash
# Créer la base de données
createdb ax5sect

# Appliquer le schéma
psql -d ax5sect -f database/schema.sql
```

---

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Anthropic (Claude) - REQUIRED
ANTHROPIC_API_KEY=sk-ant-xxxxx

# PostgreSQL - REQUIRED
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ax5sect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Neo4j (optional)
# NEO4J_URI=bolt://localhost:7687
# NEO4J_USER=neo4j
# NEO4J_PASSWORD=your_password

# LangSmith (optional - observability)
# LANGSMITH_API_KEY=your_key
# LANGSMITH_PROJECT=ax5-sect
```

---

## 💻 Utilisation

### Lancer l'API

```bash
# Mode développement (avec hot reload)
python main.py api --reload

# Mode production
python main.py api --host 0.0.0.0 --port 8000
```

L'API sera disponible sur `http://localhost:8000`

- Documentation Swagger : `http://localhost:8000/docs`
- Documentation ReDoc : `http://localhost:8000/redoc`

### Chat interactif (CLI)

```bash
python main.py chat
```

### Démonstration

```bash
python main.py demo
```

### Exemples de requêtes API

```bash
# Chat simple
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles sont les exigences IMDS 15.0 pour le PCF?"}'

# Chat avec contexte
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Conçois une campagne PCF pour nos fournisseurs Tier-1",
    "thread_id": "session-123",
    "debug": true
  }'
```

---

## 📖 API Reference

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/chat` | Interface de chat avec les agents |
| `GET` | `/health` | Vérification de l'état |
| `GET` | `/agents` | Liste des agents disponibles |
| `GET` | `/agents/graph` | Structure du graphe d'agents |
| `POST` | `/campaigns` | Créer une campagne |
| `GET` | `/campaigns` | Lister les campagnes |
| `GET` | `/campaigns/{id}` | Dashboard d'une campagne |
| `POST` | `/suppliers` | Créer un fournisseur |
| `GET` | `/suppliers/{id}` | Profil complet d'un fournisseur |
| `GET` | `/metrics/imds` | Métriques IMDS |
| `GET` | `/metrics/pcf` | Métriques PCF |
| `GET` | `/metrics/engagement` | Métriques d'engagement |

### Modèle de requête Chat

```json
{
  "message": "string",           // Message utilisateur (requis)
  "thread_id": "string",         // ID de conversation (optionnel)
  "supplier_id": 123,            // Contexte fournisseur (optionnel)
  "campaign_id": 456,            // Contexte campagne (optionnel)
  "debug": false                 // Mode debug (optionnel)
}
```

### Modèle de réponse Chat

```json
{
  "response": "string",          // Réponse de l'assistant
  "thread_id": "string",         // ID de conversation
  "agents_called": ["agent1"],   // Agents ayant traité la requête
  "iteration_count": 2,          // Nombre d'itérations
  "task_results": [...],         // Résultats détaillés (si debug)
  "errors": [],                  // Erreurs éventuelles
  "timestamp": "2024-01-01T..."  // Horodatage
}
```

---

## 🤖 Agents

### 1. Orchestrateur

**Rôle** : Coordonne les autres agents, analyse les requêtes et assemble les réponses.

**Décisions de routage** :
- Normes, guides → Knowledge Miner
- Schémas, workflows → Data Modeler
- Campagnes, KPI → Campaign Manager
- Emails, scripts → Content Generator

### 2. Knowledge Miner

**Rôle** : Recherche et agrégation de connaissances IMDS, PCF, Scope 3.

**Capacités** :
- Synthèse de normes et réglementations
- Extraction de meilleures pratiques
- Analyse d'outils et solutions

### 3. Data Modeler

**Rôle** : Modélisation des données et workflows du Hub.

**Capacités** :
- Conception de schémas de données
- Définition d'entités et relations
- Description de workflows opérationnels

### 4. Campaign Manager

**Rôle** : Conception de campagnes d'engagement fournisseurs.

**Capacités** :
- Design de campagnes IMDS/PCF
- Définition de KPI et tableaux de bord
- Création de playbooks

### 5. Content Generator

**Rôle** : Génération de contenus opérationnels.

**Capacités** :
- Emails (lancement, relance, précision)
- Scripts de formation
- FAQ et guides
- Notes internes

---

## 🗄️ Base de données

### Entités principales

```
┌─────────────────┐     ┌─────────────────┐
│    suppliers    │────<│supplier_contacts│
└────────┬────────┘     └─────────────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
    ▼         ▼              ▼
┌─────────┐ ┌─────────┐ ┌───────────────────┐
│imds_    │ │pcf_     │ │supplier_hub_      │
│profiles │ │profiles │ │metadata           │
└─────────┘ └─────────┘ └───────────────────┘
    │           │
    │           │
    ▼           ▼
┌─────────────────────┐
│      campaigns      │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────────┐ ┌─────────────┐
│imds_        │ │pcf_objects  │
│submissions  │ │             │
└─────────────┘ └─────────────┘
```

### RAG (pgvector)

```
┌─────────────────────┐     ┌─────────────────────┐
│knowledge_documents  │────<│knowledge_chunks     │
│                     │     │ + embedding vector  │
└─────────────────────┘     └─────────────────────┘
```

---

## 🛠️ Développement

### Structure du projet

```
ax5-sect/
├── src/
│   ├── __init__.py      # Package init
│   ├── config.py        # Configuration
│   ├── models.py        # Modèles Pydantic
│   ├── state.py         # State LangGraph
│   ├── prompts.py       # Prompts des agents
│   ├── agents.py        # Implémentation des agents
│   ├── graph.py         # Graphe LangGraph
│   └── api.py           # API FastAPI
├── database/
│   └── schema.sql       # Schéma PostgreSQL
├── main.py              # Point d'entrée
├── requirements.txt     # Dépendances
├── .env.example         # Exemple de configuration
└── README.md            # Documentation
```

### Ajouter un nouvel agent

1. Définir le prompt dans `src/prompts.py`
2. Implémenter le nœud dans `src/agents.py`
3. Ajouter le type dans `src/state.py` (`AgentType`)
4. Intégrer dans le graphe `src/graph.py`

### Tests

```bash
# Lancer les tests
pytest tests/

# Avec couverture
pytest tests/ --cov=src
```

---

## 📄 Licence

Ce projet est propriétaire. © 2024 GenAISafety / AgenticX5

---

## 🤝 Support

Pour toute question ou support :
- 📧 Email : support@genaisafety.com
- 📖 Documentation : https://docs.genaisafety.com
- 🐛 Issues : GitHub Issues

---

<div align="center">

**Construit avec ❤️ par l'équipe AgenticX5**

</div>
