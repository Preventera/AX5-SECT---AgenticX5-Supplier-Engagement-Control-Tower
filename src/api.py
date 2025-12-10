"""
AX5-SECT FastAPI Application
API REST pour la Control Tower AgenticX5 Supplier Engagement
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from contextlib import asynccontextmanager

from langgraph.checkpoint.memory import MemorySaver

from .graph import create_ax5sect_app, run_ax5sect
from .state import BusinessContext
from .models import (
    CampaignCreate, Campaign, CampaignDashboard,
    SupplierCreate, Supplier, SupplierFullProfile,
    IMDSMetrics, PCFMetrics, SupplierEngagementMetrics
)


# ============================================================================
# CONFIGURATION GLOBALE
# ============================================================================

# Stockage en mémoire pour le checkpointer (à remplacer par PostgreSQL en prod)
memory_saver = MemorySaver()
ax5sect_app = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager pour l'application FastAPI"""
    global ax5sect_app
    
    # Startup
    print("🚀 Démarrage d'AX5-SECT Control Tower...")
    ax5sect_app = create_ax5sect_app(checkpointer=memory_saver)
    print("✅ Graphe LangGraph initialisé")
    
    yield
    
    # Shutdown
    print("👋 Arrêt d'AX5-SECT Control Tower...")


# ============================================================================
# APPLICATION FASTAPI
# ============================================================================

app = FastAPI(
    title="AX5-SECT - AgenticX5 Supplier Engagement Control Tower",
    description="""
    API de la tour de contrôle AgenticX5 pour l'engagement fournisseurs IMDS & PCF.
    
    ## Fonctionnalités
    
    - **Chat** : Interface conversationnelle avec les agents IA
    - **Campagnes** : Gestion des campagnes IMDS et PCF
    - **Fournisseurs** : Base de données fournisseurs enrichie
    - **KPI** : Tableaux de bord et métriques
    
    ## Agents disponibles
    
    - **Orchestrateur** : Coordination des agents
    - **Knowledge Miner** : Recherche et agrégation de connaissances
    - **Data Modeler** : Modélisation des données et workflows
    - **Campaign Manager** : Conception de campagnes et KPI
    - **Content Generator** : Génération de contenus opérationnels
    """,
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# MODÈLES DE REQUÊTE/RÉPONSE
# ============================================================================

class ChatRequest(BaseModel):
    """Requête de chat"""
    message: str = Field(..., description="Message de l'utilisateur")
    thread_id: Optional[str] = Field(None, description="ID de conversation pour la persistence")
    supplier_id: Optional[int] = Field(None, description="ID du fournisseur en contexte")
    campaign_id: Optional[int] = Field(None, description="ID de la campagne en contexte")
    debug: bool = Field(False, description="Mode debug")


class ChatResponse(BaseModel):
    """Réponse de chat"""
    response: str = Field(..., description="Réponse de l'assistant")
    thread_id: str = Field(..., description="ID de conversation")
    agents_called: List[str] = Field(default_factory=list, description="Agents ayant traité la requête")
    iteration_count: int = Field(0, description="Nombre d'itérations")
    task_results: Optional[List[Dict[str, Any]]] = Field(None, description="Résultats détaillés (mode debug)")
    errors: List[str] = Field(default_factory=list, description="Erreurs rencontrées")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    """Réponse du health check"""
    status: str
    version: str
    timestamp: datetime


# ============================================================================
# ENDPOINTS - HEALTH & INFO
# ============================================================================

@app.get("/", tags=["Info"])
async def root():
    """Page d'accueil de l'API"""
    return {
        "name": "AX5-SECT Control Tower",
        "version": "1.0.0",
        "description": "AgenticX5 Supplier Engagement Control Tower - IMDS & PCF",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Info"])
async def health_check():
    """Vérification de l'état de l'application"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow()
    )


# ============================================================================
# ENDPOINTS - CHAT (INTERFACE PRINCIPALE)
# ============================================================================

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Interface de chat avec les agents AX5-SECT.
    
    Envoie un message et reçois une réponse coordonnée par les agents spécialisés.
    
    ## Exemples de requêtes
    
    - "Quelles sont les exigences IMDS 15.0 pour le PCF?"
    - "Conçois une campagne PCF pour nos fournisseurs Tier-1"
    - "Génère un email de relance pour les fournisseurs en retard"
    - "Propose un modèle de données pour suivre les soumissions"
    """
    global ax5sect_app
    
    if ax5sect_app is None:
        raise HTTPException(status_code=503, detail="Application non initialisée")
    
    # Générer un thread_id si non fourni
    thread_id = request.thread_id or str(uuid.uuid4())
    
    # Configurer le contexte
    config = {"configurable": {"thread_id": thread_id}}
    
    try:
        # Exécuter la requête
        result = await run_ax5sect(
            user_input=request.message,
            app=ax5sect_app,
            config=config,
            debug=request.debug
        )
        
        return ChatResponse(
            response=result["response"],
            thread_id=thread_id,
            agents_called=result["agents_called"],
            iteration_count=result["iteration_count"],
            task_results=result["task_results"] if request.debug else None,
            errors=result.get("errors", [])
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement : {str(e)}")


@app.post("/chat/stream", tags=["Chat"])
async def chat_stream(request: ChatRequest):
    """
    Interface de chat avec streaming (à implémenter avec SSE).
    
    Note: Cette fonctionnalité nécessite une implémentation SSE complète.
    """
    # TODO: Implémenter le streaming avec Server-Sent Events
    raise HTTPException(status_code=501, detail="Streaming non encore implémenté")


# ============================================================================
# ENDPOINTS - CAMPAGNES
# ============================================================================

@app.post("/campaigns", response_model=Campaign, tags=["Campagnes"])
async def create_campaign(campaign: CampaignCreate):
    """
    Crée une nouvelle campagne IMDS ou PCF.
    
    Note: Endpoint placeholder - nécessite connexion à la base de données.
    """
    # TODO: Implémenter avec PostgreSQL
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


@app.get("/campaigns", response_model=List[Campaign], tags=["Campagnes"])
async def list_campaigns(
    type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Liste les campagnes avec filtres optionnels.
    """
    # TODO: Implémenter avec PostgreSQL
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


@app.get("/campaigns/{campaign_id}", response_model=CampaignDashboard, tags=["Campagnes"])
async def get_campaign_dashboard(campaign_id: int):
    """
    Récupère le tableau de bord d'une campagne.
    """
    # TODO: Implémenter avec PostgreSQL
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


# ============================================================================
# ENDPOINTS - FOURNISSEURS
# ============================================================================

@app.post("/suppliers", response_model=Supplier, tags=["Fournisseurs"])
async def create_supplier(supplier: SupplierCreate):
    """
    Crée un nouveau fournisseur.
    """
    # TODO: Implémenter avec PostgreSQL
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


@app.get("/suppliers", response_model=List[Supplier], tags=["Fournisseurs"])
async def list_suppliers(
    priority: Optional[str] = None,
    country: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Liste les fournisseurs avec filtres optionnels.
    """
    # TODO: Implémenter avec PostgreSQL
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


@app.get("/suppliers/{supplier_id}", response_model=SupplierFullProfile, tags=["Fournisseurs"])
async def get_supplier_profile(supplier_id: int):
    """
    Récupère le profil complet d'un fournisseur (IMDS + PCF + campagnes).
    """
    # TODO: Implémenter avec PostgreSQL
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


# ============================================================================
# ENDPOINTS - KPI & MÉTRIQUES
# ============================================================================

@app.get("/metrics/imds", response_model=IMDSMetrics, tags=["Métriques"])
async def get_imds_metrics():
    """
    Récupère les métriques IMDS globales.
    """
    # TODO: Implémenter avec PostgreSQL
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


@app.get("/metrics/pcf", response_model=PCFMetrics, tags=["Métriques"])
async def get_pcf_metrics():
    """
    Récupère les métriques PCF globales.
    """
    # TODO: Implémenter avec PostgreSQL
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


@app.get("/metrics/engagement", response_model=SupplierEngagementMetrics, tags=["Métriques"])
async def get_engagement_metrics():
    """
    Récupère les métriques d'engagement fournisseurs.
    """
    # TODO: Implémenter avec PostgreSQL
    raise HTTPException(status_code=501, detail="Endpoint en cours d'implémentation")


# ============================================================================
# ENDPOINTS - AGENTS (DEBUG/ADMIN)
# ============================================================================

@app.get("/agents", tags=["Agents"])
async def list_agents():
    """
    Liste les agents disponibles et leur description.
    """
    return {
        "agents": [
            {
                "id": "orchestrator",
                "name": "Orchestrateur",
                "description": "Coordonne les autres agents et assemble les réponses"
            },
            {
                "id": "knowledge_miner",
                "name": "Knowledge Miner",
                "description": "Recherche et agrégation de connaissances IMDS/PCF"
            },
            {
                "id": "data_modeler",
                "name": "Data Modeler",
                "description": "Modélisation des données et workflows"
            },
            {
                "id": "campaign_manager",
                "name": "Campaign Manager",
                "description": "Conception de campagnes et KPI"
            },
            {
                "id": "content_generator",
                "name": "Content Generator",
                "description": "Génération de contenus opérationnels"
            }
        ]
    }


@app.get("/agents/graph", tags=["Agents"])
async def get_agent_graph():
    """
    Retourne la structure du graphe d'agents (pour visualisation).
    """
    return {
        "nodes": [
            {"id": "orchestrator", "type": "entry"},
            {"id": "knowledge_miner", "type": "agent"},
            {"id": "data_modeler", "type": "agent"},
            {"id": "campaign_manager", "type": "agent"},
            {"id": "content_generator", "type": "agent"},
            {"id": "prepare_queue", "type": "utility"},
            {"id": "synthesizer", "type": "output"},
        ],
        "edges": [
            {"from": "orchestrator", "to": "knowledge_miner", "condition": "if knowledge needed"},
            {"from": "orchestrator", "to": "data_modeler", "condition": "if modeling needed"},
            {"from": "orchestrator", "to": "campaign_manager", "condition": "if campaign needed"},
            {"from": "orchestrator", "to": "content_generator", "condition": "if content needed"},
            {"from": "orchestrator", "to": "synthesizer", "condition": "if direct response"},
            {"from": "knowledge_miner", "to": "prepare_queue"},
            {"from": "data_modeler", "to": "prepare_queue"},
            {"from": "campaign_manager", "to": "prepare_queue"},
            {"from": "content_generator", "to": "prepare_queue"},
            {"from": "prepare_queue", "to": "synthesizer", "condition": "if queue empty"},
            {"from": "prepare_queue", "to": "next_agent", "condition": "if queue not empty"},
            {"from": "synthesizer", "to": "END"},
        ]
    }


# ============================================================================
# POINT D'ENTRÉE
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
