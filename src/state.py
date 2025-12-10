"""
AX5-SECT LangGraph State
Définition du state partagé entre tous les agents du système
"""

from typing import TypedDict, Annotated, List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
import operator


# ============================================================================
# TYPES DE BASE
# ============================================================================

class AgentType(str, Enum):
    """Types d'agents disponibles"""
    ORCHESTRATOR = "orchestrator"
    KNOWLEDGE_MINER = "knowledge_miner"
    DATA_MODELER = "data_modeler"
    CAMPAIGN_MANAGER = "campaign_manager"
    CONTENT_GENERATOR = "content_generator"


class MessageRole(str, Enum):
    """Rôles des messages"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"


# ============================================================================
# MESSAGES
# ============================================================================

class AgentMessage(BaseModel):
    """Message échangé entre agents ou avec l'utilisateur"""
    role: MessageRole
    content: str
    agent: Optional[AgentType] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TaskRequest(BaseModel):
    """Requête de tâche pour un agent"""
    task_type: str
    description: str
    context: Dict[str, Any] = Field(default_factory=dict)
    priority: int = 1  # 1 = haute, 3 = basse
    requested_by: Optional[AgentType] = None
    deadline: Optional[datetime] = None


class TaskResult(BaseModel):
    """Résultat d'une tâche d'agent"""
    task_type: str
    success: bool
    result: Any
    error: Optional[str] = None
    agent: AgentType
    execution_time_ms: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ============================================================================
# CONTEXTE MÉTIER
# ============================================================================

class BusinessContext(BaseModel):
    """Contexte métier actuel de la conversation"""
    # IDs actifs
    current_supplier_id: Optional[int] = None
    current_campaign_id: Optional[int] = None
    current_submission_id: Optional[int] = None
    
    # Filtres actifs
    active_filters: Dict[str, Any] = Field(default_factory=dict)
    
    # Données chargées
    loaded_supplier: Optional[Dict[str, Any]] = None
    loaded_campaign: Optional[Dict[str, Any]] = None
    loaded_submissions: List[Dict[str, Any]] = Field(default_factory=list)
    loaded_pcf_objects: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Résultats de recherche RAG
    rag_results: List[Dict[str, Any]] = Field(default_factory=list)
    
    # KPIs calculés
    cached_metrics: Dict[str, Any] = Field(default_factory=dict)


# ============================================================================
# LANGGRAPH STATE
# ============================================================================

def add_messages(left: List[AgentMessage], right: List[AgentMessage]) -> List[AgentMessage]:
    """Reducer pour accumuler les messages"""
    return left + right


def merge_task_results(left: List[TaskResult], right: List[TaskResult]) -> List[TaskResult]:
    """Reducer pour accumuler les résultats de tâches"""
    return left + right


class AX5SECTState(TypedDict):
    """
    State principal du graphe LangGraph AX5-SECT
    
    Ce state est partagé entre tous les nœuds (agents) du graphe.
    Les annotations définissent comment les valeurs sont fusionnées
    quand plusieurs branches convergent.
    """
    
    # =========================================================================
    # MESSAGES & CONVERSATION
    # =========================================================================
    
    # Historique des messages (accumulé)
    messages: Annotated[List[AgentMessage], add_messages]
    
    # Message utilisateur original de ce tour
    user_input: str
    
    # Réponse finale à retourner à l'utilisateur
    final_response: Optional[str]
    
    # =========================================================================
    # ROUTAGE & ORCHESTRATION
    # =========================================================================
    
    # Agent actuellement actif
    current_agent: Optional[AgentType]
    
    # File d'attente des agents à appeler
    agent_queue: List[AgentType]
    
    # Agents déjà appelés dans ce tour
    agents_called: List[AgentType]
    
    # Décision de routage de l'orchestrateur
    routing_decision: Optional[Dict[str, Any]]
    
    # Nombre d'itérations (pour éviter les boucles infinies)
    iteration_count: int
    max_iterations: int
    
    # =========================================================================
    # RÉSULTATS DES AGENTS
    # =========================================================================
    
    # Résultats des tâches (accumulés)
    task_results: Annotated[List[TaskResult], merge_task_results]
    
    # Résultat du dernier agent appelé
    last_agent_result: Optional[TaskResult]
    
    # =========================================================================
    # CONTEXTE MÉTIER
    # =========================================================================
    
    # Contexte métier actuel
    business_context: BusinessContext
    
    # =========================================================================
    # ERREURS & DEBUG
    # =========================================================================
    
    # Erreurs rencontrées
    errors: List[str]
    
    # Mode debug
    debug_mode: bool


def create_initial_state(user_input: str, debug: bool = False) -> AX5SECTState:
    """Crée un state initial pour une nouvelle requête"""
    return AX5SECTState(
        messages=[],
        user_input=user_input,
        final_response=None,
        current_agent=None,
        agent_queue=[],
        agents_called=[],
        routing_decision=None,
        iteration_count=0,
        max_iterations=10,
        task_results=[],
        last_agent_result=None,
        business_context=BusinessContext(),
        errors=[],
        debug_mode=debug,
    )


# ============================================================================
# HELPERS POUR MANIPULATION DU STATE
# ============================================================================

class StateHelpers:
    """Fonctions utilitaires pour manipuler le state"""
    
    @staticmethod
    def add_message(state: AX5SECTState, role: MessageRole, content: str, 
                    agent: Optional[AgentType] = None) -> Dict[str, Any]:
        """Ajoute un message au state (retourne le patch)"""
        message = AgentMessage(role=role, content=content, agent=agent)
        return {"messages": [message]}
    
    @staticmethod
    def add_task_result(state: AX5SECTState, task_type: str, success: bool,
                        result: Any, agent: AgentType, 
                        error: Optional[str] = None) -> Dict[str, Any]:
        """Ajoute un résultat de tâche (retourne le patch)"""
        task_result = TaskResult(
            task_type=task_type,
            success=success,
            result=result,
            agent=agent,
            error=error
        )
        return {
            "task_results": [task_result],
            "last_agent_result": task_result
        }
    
    @staticmethod
    def set_routing(state: AX5SECTState, agents_to_call: List[AgentType],
                    reasoning: str) -> Dict[str, Any]:
        """Définit le routage (retourne le patch)"""
        return {
            "agent_queue": agents_to_call,
            "routing_decision": {
                "agents": [a.value for a in agents_to_call],
                "reasoning": reasoning,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    
    @staticmethod
    def increment_iteration(state: AX5SECTState) -> Dict[str, Any]:
        """Incrémente le compteur d'itérations"""
        return {"iteration_count": state["iteration_count"] + 1}
    
    @staticmethod
    def should_continue(state: AX5SECTState) -> bool:
        """Vérifie si on peut continuer les itérations"""
        return (
            state["iteration_count"] < state["max_iterations"] and
            len(state.get("agent_queue", [])) > 0
        )
    
    @staticmethod
    def get_next_agent(state: AX5SECTState) -> Optional[AgentType]:
        """Récupère le prochain agent à appeler"""
        queue = state.get("agent_queue", [])
        if queue:
            return queue[0]
        return None
    
    @staticmethod
    def pop_agent_from_queue(state: AX5SECTState) -> Dict[str, Any]:
        """Retire le premier agent de la queue"""
        queue = state.get("agent_queue", [])
        if queue:
            current = queue[0]
            return {
                "agent_queue": queue[1:],
                "current_agent": current,
                "agents_called": state.get("agents_called", []) + [current]
            }
        return {}
    
    @staticmethod
    def format_conversation_history(state: AX5SECTState, 
                                     max_messages: int = 20) -> str:
        """Formate l'historique de conversation pour le contexte LLM"""
        messages = state.get("messages", [])[-max_messages:]
        formatted = []
        for msg in messages:
            role_str = msg.role.value.upper()
            agent_str = f" ({msg.agent.value})" if msg.agent else ""
            formatted.append(f"{role_str}{agent_str}: {msg.content}")
        return "\n".join(formatted)
    
    @staticmethod
    def format_task_results_summary(state: AX5SECTState) -> str:
        """Formate un résumé des résultats de tâches"""
        results = state.get("task_results", [])
        if not results:
            return "Aucun résultat de tâche."
        
        summary = []
        for r in results:
            status = "✓" if r.success else "✗"
            summary.append(f"{status} {r.agent.value} - {r.task_type}")
        return "\n".join(summary)
