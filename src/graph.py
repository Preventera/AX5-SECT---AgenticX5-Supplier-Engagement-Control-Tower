"""
AX5-SECT LangGraph
Définition du graphe multi-agents pour la Control Tower
"""

from typing import Literal, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from .state import (
    AX5SECTState, AgentType, create_initial_state,
    StateHelpers, MessageRole, AgentMessage, BusinessContext
)
from .agents import (
    orchestrator_node,
    knowledge_miner_node,
    data_modeler_node,
    campaign_manager_node,
    content_generator_node,
    synthesizer_node,
)


# ============================================================================
# FONCTIONS DE ROUTAGE (EDGES CONDITIONNELS)
# ============================================================================

def route_after_orchestrator(state: AX5SECTState) -> str:
    """
    Décide où aller après l'orchestrateur.
    
    Returns:
        - "end" si réponse directe ou pas d'agents à appeler
        - "knowledge_miner", "data_modeler", "campaign_manager", "content_generator"
          selon le premier agent dans la queue
    """
    # Si réponse directe fournie, terminer
    if state.get("final_response"):
        return "end"
    
    # Récupérer la queue d'agents
    agent_queue = state.get("agent_queue", [])
    
    if not agent_queue:
        # Pas d'agents à appeler, aller à la synthèse
        return "synthesizer"
    
    # Router vers le premier agent de la queue
    first_agent = agent_queue[0]
    
    agent_routes = {
        AgentType.KNOWLEDGE_MINER: "knowledge_miner",
        AgentType.DATA_MODELER: "data_modeler",
        AgentType.CAMPAIGN_MANAGER: "campaign_manager",
        AgentType.CONTENT_GENERATOR: "content_generator",
    }
    
    return agent_routes.get(first_agent, "synthesizer")


def route_after_agent(state: AX5SECTState) -> str:
    """
    Décide où aller après un agent spécialisé.
    
    Returns:
        - Le prochain agent dans la queue
        - "synthesizer" si la queue est vide
        - "end" si trop d'itérations
    """
    # Vérifier le nombre d'itérations
    iteration_count = state.get("iteration_count", 0)
    max_iterations = state.get("max_iterations", 10)
    
    if iteration_count >= max_iterations:
        return "synthesizer"
    
    # Retirer l'agent qui vient d'être appelé de la queue
    agent_queue = state.get("agent_queue", [])
    agents_called = state.get("agents_called", [])
    
    # La queue devrait déjà avoir été mise à jour, mais vérifions
    remaining_agents = [a for a in agent_queue if a not in agents_called]
    
    if not remaining_agents:
        return "synthesizer"
    
    # Router vers le prochain agent
    next_agent = remaining_agents[0]
    
    agent_routes = {
        AgentType.KNOWLEDGE_MINER: "knowledge_miner",
        AgentType.DATA_MODELER: "data_modeler",
        AgentType.CAMPAIGN_MANAGER: "campaign_manager",
        AgentType.CONTENT_GENERATOR: "content_generator",
    }
    
    return agent_routes.get(next_agent, "synthesizer")


def should_continue(state: AX5SECTState) -> str:
    """
    Vérifie si on doit continuer ou terminer.
    """
    if state.get("final_response"):
        return "end"
    return "continue"


# ============================================================================
# NŒUD DE PRÉPARATION DE LA QUEUE
# ============================================================================

def prepare_queue_node(state: AX5SECTState) -> dict:
    """
    Prépare la queue d'agents en retirant ceux déjà appelés.
    Incrémente le compteur d'itérations.
    """
    agent_queue = state.get("agent_queue", [])
    agents_called = state.get("agents_called", [])
    
    # Filtrer les agents déjà appelés
    remaining = [a for a in agent_queue if a not in agents_called]
    
    return {
        "agent_queue": remaining,
        "iteration_count": state.get("iteration_count", 0) + 1
    }


# ============================================================================
# CONSTRUCTION DU GRAPHE
# ============================================================================

def build_ax5sect_graph() -> StateGraph:
    """
    Construit et retourne le graphe LangGraph AX5-SECT.
    
    Architecture du graphe :
    
    START
      │
      ▼
    [orchestrator] ─────────────────────────────────────┐
      │                                                  │
      │ (route_after_orchestrator)                       │
      │                                                  │
      ├──► [knowledge_miner] ──► [prepare_queue] ──┐    │
      │                                             │    │
      ├──► [data_modeler] ──────► [prepare_queue] ──┤    │
      │                                             │    │
      ├──► [campaign_manager] ──► [prepare_queue] ──┤    │
      │                                             │    │
      ├──► [content_generator]─► [prepare_queue] ──┤    │
      │                                             │    │
      │         ┌──────────────────────────────────┘    │
      │         │                                        │
      │         ▼                                        │
      │   (route_after_agent)                            │
      │         │                                        │
      │         ├──► [next_agent] ──► ...               │
      │         │                                        │
      │         └──► [synthesizer]                       │
      │                   │                              │
      │                   ▼                              │
      └─────────────────► END ◄─────────────────────────┘
    """
    
    # Créer le graphe avec le type de state
    workflow = StateGraph(AX5SECTState)
    
    # =========================================================================
    # AJOUTER LES NŒUDS
    # =========================================================================
    
    # Orchestrateur (point d'entrée)
    workflow.add_node("orchestrator", orchestrator_node)
    
    # Agents spécialisés
    workflow.add_node("knowledge_miner", knowledge_miner_node)
    workflow.add_node("data_modeler", data_modeler_node)
    workflow.add_node("campaign_manager", campaign_manager_node)
    workflow.add_node("content_generator", content_generator_node)
    
    # Nœud de préparation de queue
    workflow.add_node("prepare_queue", prepare_queue_node)
    
    # Nœud de synthèse
    workflow.add_node("synthesizer", synthesizer_node)
    
    # =========================================================================
    # DÉFINIR LE POINT D'ENTRÉE
    # =========================================================================
    
    workflow.set_entry_point("orchestrator")
    
    # =========================================================================
    # AJOUTER LES EDGES CONDITIONNELS
    # =========================================================================
    
    # Après l'orchestrateur : router vers le premier agent ou terminer
    workflow.add_conditional_edges(
        "orchestrator",
        route_after_orchestrator,
        {
            "knowledge_miner": "knowledge_miner",
            "data_modeler": "data_modeler",
            "campaign_manager": "campaign_manager",
            "content_generator": "content_generator",
            "synthesizer": "synthesizer",
            "end": END,
        }
    )
    
    # Après chaque agent : passer par prepare_queue
    workflow.add_edge("knowledge_miner", "prepare_queue")
    workflow.add_edge("data_modeler", "prepare_queue")
    workflow.add_edge("campaign_manager", "prepare_queue")
    workflow.add_edge("content_generator", "prepare_queue")
    
    # Après prepare_queue : router vers le prochain agent ou synthèse
    workflow.add_conditional_edges(
        "prepare_queue",
        route_after_agent,
        {
            "knowledge_miner": "knowledge_miner",
            "data_modeler": "data_modeler",
            "campaign_manager": "campaign_manager",
            "content_generator": "content_generator",
            "synthesizer": "synthesizer",
        }
    )
    
    # Après synthèse : terminer
    workflow.add_edge("synthesizer", END)
    
    return workflow


# ============================================================================
# COMPILATION ET EXÉCUTION
# ============================================================================

def create_ax5sect_app(checkpointer: Optional[MemorySaver] = None):
    """
    Crée et compile l'application AX5-SECT.
    
    Args:
        checkpointer: Optionnel, pour persister l'état entre les appels
    
    Returns:
        Application LangGraph compilée
    """
    workflow = build_ax5sect_graph()
    
    if checkpointer:
        return workflow.compile(checkpointer=checkpointer)
    
    return workflow.compile()


async def run_ax5sect(
    user_input: str,
    app=None,
    config: Optional[dict] = None,
    debug: bool = False
) -> dict:
    """
    Exécute une requête sur AX5-SECT.
    
    Args:
        user_input: La demande de l'utilisateur
        app: L'application compilée (optionnel, sera créée si non fournie)
        config: Configuration LangGraph (thread_id, etc.)
        debug: Mode debug
    
    Returns:
        Dictionnaire avec la réponse finale et les métadonnées
    """
    if app is None:
        app = create_ax5sect_app()
    
    # Créer le state initial
    initial_state = create_initial_state(user_input, debug=debug)
    
    # Configuration par défaut
    if config is None:
        config = {"configurable": {"thread_id": "default"}}
    
    # Exécuter le graphe
    final_state = await app.ainvoke(initial_state, config=config)
    
    # Extraire les résultats
    return {
        "response": final_state.get("final_response", ""),
        "agents_called": [a.value for a in final_state.get("agents_called", [])],
        "task_results": [
            {
                "agent": r.agent.value,
                "task_type": r.task_type,
                "success": r.success,
                "result": r.result if debug else None,
            }
            for r in final_state.get("task_results", [])
        ],
        "iteration_count": final_state.get("iteration_count", 0),
        "errors": final_state.get("errors", []),
    }


def run_ax5sect_sync(
    user_input: str,
    app=None,
    config: Optional[dict] = None,
    debug: bool = False
) -> dict:
    """
    Version synchrone de run_ax5sect.
    """
    if app is None:
        app = create_ax5sect_app()
    
    initial_state = create_initial_state(user_input, debug=debug)
    
    if config is None:
        config = {"configurable": {"thread_id": "default"}}
    
    final_state = app.invoke(initial_state, config=config)
    
    return {
        "response": final_state.get("final_response", ""),
        "agents_called": [a.value for a in final_state.get("agents_called", [])],
        "task_results": [
            {
                "agent": r.agent.value,
                "task_type": r.task_type,
                "success": r.success,
                "result": r.result if debug else None,
            }
            for r in final_state.get("task_results", [])
        ],
        "iteration_count": final_state.get("iteration_count", 0),
        "errors": final_state.get("errors", []),
    }


# ============================================================================
# EXEMPLE D'UTILISATION
# ============================================================================

if __name__ == "__main__":
    import asyncio
    
    async def main():
        # Créer l'application avec persistence mémoire
        memory = MemorySaver()
        app = create_ax5sect_app(checkpointer=memory)
        
        # Exemple de requête
        result = await run_ax5sect(
            "Conçois une campagne PCF pour engager nos 50 fournisseurs Tier-1 les plus émissifs",
            app=app,
            config={"configurable": {"thread_id": "demo-1"}},
            debug=True
        )
        
        print("=== Résultat AX5-SECT ===")
        print(f"Agents appelés : {result['agents_called']}")
        print(f"Itérations : {result['iteration_count']}")
        print(f"\nRéponse :\n{result['response']}")
    
    asyncio.run(main())
