"""
AX5-SECT FastAPI Application
API REST pour la Control Tower AgenticX5 Supplier Engagement
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from contextlib import asynccontextmanager

from langgraph.checkpoint.memory import MemorySaver

from .graph import create_ax5sect_app, run_ax5sect
from .state import BusinessContext

# Import des routers API
from .api_suppliers import router as suppliers_router
from .api_campaigns import router as campaigns_router
from .api_dashboard import router as dashboard_router


# ============================================================================
# CONFIGURATION GLOBALE
# ============================================================================

memory_saver = MemorySaver()
ax5sect_app = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager pour l'application FastAPI"""
    global ax5sect_app
    print("🚀 Démarrage d'AX5-SECT Control Tower...")
    ax5sect_app = create_ax5sect_app(checkpointer=memory_saver)
    print("✅ Graphe LangGraph initialisé")
    yield
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# INCLURE LES ROUTERS API
# ============================================================================

app.include_router(suppliers_router)
app.include_router(campaigns_router)
app.include_router(dashboard_router)


# ============================================================================
# MODÈLES DE REQUÊTE/RÉPONSE
# ============================================================================

class ChatRequest(BaseModel):
    message: str = Field(..., description="Message de l'utilisateur")
    thread_id: Optional[str] = Field(None, description="ID de conversation")
    supplier_id: Optional[int] = Field(None, description="ID du fournisseur en contexte")
    campaign_id: Optional[int] = Field(None, description="ID de la campagne en contexte")
    debug: bool = Field(False, description="Mode debug")


class ChatResponse(BaseModel):
    response: str = Field(..., description="Réponse de l'assistant")
    thread_id: str = Field(..., description="ID de conversation")
    agents_called: List[str] = Field(default_factory=list)
    iteration_count: int = Field(0)
    task_results: Optional[List[Dict[str, Any]]] = Field(None)
    errors: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime


# ============================================================================
# ENDPOINTS - HEALTH & INFO
# ============================================================================

@app.get("/", tags=["Info"])
async def root():
    return {
        "name": "AX5-SECT Control Tower",
        "version": "1.0.0",
        "description": "AgenticX5 Supplier Engagement Control Tower - IMDS & PCF",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Info"])
async def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow()
    )


# ============================================================================
# ENDPOINTS - CHAT
# ============================================================================

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """Interface de chat avec les agents AX5-SECT."""
    global ax5sect_app

    if ax5sect_app is None:
        raise HTTPException(status_code=503, detail="Application non initialisée")

    thread_id = request.thread_id or str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}

    try:
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
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@app.post("/chat/stream", tags=["Chat"])
async def chat_stream(request: ChatRequest):
    raise HTTPException(status_code=501, detail="Streaming non encore implémenté")


# ============================================================================
# ENDPOINTS - AGENTS (DEBUG)
# ============================================================================

@app.get("/agents", tags=["Agents"])
async def list_agents():
    return {
        "agents": [
            {"id": "orchestrator", "name": "Orchestrateur", "description": "Coordonne les autres agents"},
            {"id": "knowledge_miner", "name": "Knowledge Miner", "description": "Recherche et agrégation de connaissances"},
            {"id": "data_modeler", "name": "Data Modeler", "description": "Modélisation des données et workflows"},
            {"id": "campaign_manager", "name": "Campaign Manager", "description": "Conception de campagnes et KPI"},
            {"id": "content_generator", "name": "Content Generator", "description": "Génération de contenus opérationnels"}
        ]
    }


@app.get("/agents/graph", tags=["Agents"])
async def get_agent_graph():
    return {
        "nodes": [
            {"id": "orchestrator", "type": "entry"},
            {"id": "knowledge_miner", "type": "agent"},
            {"id": "data_modeler", "type": "agent"},
            {"id": "campaign_manager", "type": "agent"},
            {"id": "content_generator", "type": "agent"},
            {"id": "synthesizer", "type": "output"},
        ],
        "edges": [
            {"from": "orchestrator", "to": "knowledge_miner"},
            {"from": "orchestrator", "to": "data_modeler"},
            {"from": "orchestrator", "to": "campaign_manager"},
            {"from": "orchestrator", "to": "content_generator"},
            {"from": "orchestrator", "to": "synthesizer"},
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
