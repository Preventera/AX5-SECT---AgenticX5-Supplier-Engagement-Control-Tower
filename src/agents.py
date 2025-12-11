"""
AX5-SECT Agents
Implémentation des 5 agents spécialisés comme nœuds LangGraph
"""

import json
import re
from typing import Dict, Any, Optional, List
from datetime import datetime

from .state import (
    AX5SECTState, AgentType, MessageRole, AgentMessage, 
    TaskResult, StateHelpers, BusinessContext
)
from .prompts import get_agent_prompt
from .mock_responses import (
    get_mock_orchestrator_response,
    get_mock_knowledge_response,
    get_mock_data_modeler_response,
    get_mock_campaign_response,
    get_mock_content_response,
    generate_mock_synthesis
)


# ============================================================================
# CONFIGURATION MODE MOCK
# ============================================================================

def is_mock_mode() -> bool:
    """Vérifie si le mode mock est activé"""
    from .config import settings
    return settings.mock_mode


# ============================================================================
# CLIENT ANTHROPIC
# ============================================================================

def get_anthropic_client():
    """Crée un client Anthropic (lazy initialization)"""
    from anthropic import Anthropic
    from .config import settings
    return Anthropic(api_key=settings.anthropic_api_key)


def call_claude(
    system_prompt: str,
    user_message: str,
    model: str = "claude-sonnet-4-20250514",
    max_tokens: int = 4096,
    temperature: float = 0.7
) -> str:
    """Appelle Claude avec un prompt système et un message utilisateur"""
    # Mode mock : ne pas appeler l'API
    if is_mock_mode():
        return json.dumps({"mock": True, "message": "Mode démonstration actif"})
    
    client = get_anthropic_client()
    
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )
    
    return response.content[0].text


def parse_json_response(response: str) -> Dict[str, Any]:
    """Parse une réponse JSON, même si elle est entourée de markdown"""
    # Essayer de trouver un bloc JSON dans la réponse
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
    if json_match:
        json_str = json_match.group(1)
    else:
        # Essayer de parser directement
        json_str = response
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        # Si le parsing échoue, retourner la réponse brute
        return {"raw_response": response, "parse_error": True}


# ============================================================================
# AGENT 1 - ORCHESTRATEUR
# ============================================================================

def orchestrator_node(state: AX5SECTState) -> Dict[str, Any]:
    """
    Nœud Orchestrateur : analyse la requête et décide du routage
    """
    user_input = state["user_input"]
    
    # MODE MOCK : utiliser les réponses simulées
    if is_mock_mode():
        parsed = get_mock_orchestrator_response(user_input)
        agent_names = parsed.get("agents_to_call", [])
        agent_mapping = {
            "knowledge_miner": AgentType.KNOWLEDGE_MINER,
            "data_modeler": AgentType.DATA_MODELER,
            "campaign_manager": AgentType.CAMPAIGN_MANAGER,
            "content_generator": AgentType.CONTENT_GENERATOR,
        }
        agents_to_call = [agent_mapping[name] for name in agent_names if name in agent_mapping]
        
        return {
            "routing_decision": parsed,
            "agent_queue": agents_to_call,
            "current_agent": AgentType.ORCHESTRATOR,
            "messages": [AgentMessage(
                role=MessageRole.ASSISTANT,
                content=f"[MOCK] Analyse terminée. Agents : {[a.value for a in agents_to_call]}",
                agent=AgentType.ORCHESTRATOR
            )]
        }
    
    # MODE NORMAL : appeler Claude
    # Construire le contexte pour l'orchestrateur
    context_parts = []
    
    # Ajouter l'historique des messages si présent
    if state.get("messages"):
        history = StateHelpers.format_conversation_history(state, max_messages=10)
        context_parts.append(f"## Historique récent\n{history}")
    
    # Ajouter les résultats des agents précédents si présent
    if state.get("task_results"):
        results_summary = StateHelpers.format_task_results_summary(state)
        context_parts.append(f"## Résultats des agents\n{results_summary}")
    
    # Ajouter le contexte métier si présent
    biz_ctx = state.get("business_context")
    if biz_ctx:
        if biz_ctx.current_supplier_id:
            context_parts.append(f"Fournisseur actif : ID {biz_ctx.current_supplier_id}")
        if biz_ctx.current_campaign_id:
            context_parts.append(f"Campagne active : ID {biz_ctx.current_campaign_id}")
    
    context_str = "\n\n".join(context_parts) if context_parts else "Pas de contexte additionnel."
    
    # Construire le message pour l'orchestrateur
    orchestrator_message = f"""## Contexte
{context_str}

## Demande utilisateur
{user_input}

Analyse cette demande et décide quels agents doivent être appelés (dans quel ordre) pour y répondre au mieux."""
    
    # Appeler Claude
    system_prompt = get_agent_prompt("orchestrator")
    response = call_claude(system_prompt, orchestrator_message)
    
    # Parser la réponse
    parsed = parse_json_response(response)
    
    # Déterminer les agents à appeler
    agents_to_call = []
    if not parsed.get("parse_error"):
        agent_names = parsed.get("agents_to_call", [])
        agent_mapping = {
            "knowledge_miner": AgentType.KNOWLEDGE_MINER,
            "data_modeler": AgentType.DATA_MODELER,
            "campaign_manager": AgentType.CAMPAIGN_MANAGER,
            "content_generator": AgentType.CONTENT_GENERATOR,
        }
        for name in agent_names:
            if name in agent_mapping:
                agents_to_call.append(agent_mapping[name])
    
    # Préparer le résultat
    result_updates = {
        "routing_decision": parsed,
        "agent_queue": agents_to_call,
        "current_agent": AgentType.ORCHESTRATOR,
        "messages": [AgentMessage(
            role=MessageRole.ASSISTANT,
            content=f"Analyse de la demande terminée. Agents à appeler : {[a.value for a in agents_to_call]}",
            agent=AgentType.ORCHESTRATOR
        )]
    }
    
    # Si réponse directe (pas d'agents à appeler)
    if not agents_to_call and parsed.get("direct_response"):
        result_updates["final_response"] = parsed["direct_response"]
    
    return result_updates


# ============================================================================
# AGENT 2 - KNOWLEDGE MINER
# ============================================================================

def knowledge_miner_node(state: AX5SECTState) -> Dict[str, Any]:
    """
    Nœud Knowledge Miner : recherche et agrégation de connaissances
    """
    user_input = state["user_input"]
    
    # MODE MOCK : utiliser les réponses simulées
    if is_mock_mode():
        parsed = get_mock_knowledge_response()
        task_result = TaskResult(
            task_type="knowledge_research",
            success=True,
            result=parsed,
            agent=AgentType.KNOWLEDGE_MINER
        )
        return {
            "task_results": [task_result],
            "last_agent_result": task_result,
            "agents_called": state.get("agents_called", []) + [AgentType.KNOWLEDGE_MINER],
            "messages": [AgentMessage(
                role=MessageRole.ASSISTANT,
                content=f"[MOCK] Recherche terminée : {parsed.get('topic', 'IMDS/PCF')}",
                agent=AgentType.KNOWLEDGE_MINER
            )]
        }
    
    # MODE NORMAL : appeler Claude
    routing = state.get("routing_decision", {})
    
    # Construire le message pour le Knowledge Miner
    context_parts = [f"## Demande originale\n{user_input}"]
    
    if routing.get("analysis"):
        context_parts.append(f"## Analyse de l'orchestrateur\n{routing['analysis']}")
    
    # Ajouter les résultats RAG si disponibles
    biz_ctx = state.get("business_context")
    if biz_ctx and biz_ctx.rag_results:
        rag_context = "\n".join([f"- {r.get('title', 'Document')}: {r.get('excerpt', '')[:200]}" 
                                  for r in biz_ctx.rag_results[:5]])
        context_parts.append(f"## Résultats RAG disponibles\n{rag_context}")
    
    message = "\n\n".join(context_parts) + "\n\nEffectue ta recherche et agrégation sur ce sujet."
    
    # Appeler Claude
    system_prompt = get_agent_prompt("knowledge_miner")
    response = call_claude(system_prompt, message)
    
    # Parser la réponse
    parsed = parse_json_response(response)
    
    # Créer le résultat de tâche
    task_result = TaskResult(
        task_type="knowledge_research",
        success=not parsed.get("parse_error", False),
        result=parsed,
        agent=AgentType.KNOWLEDGE_MINER,
        error=parsed.get("raw_response") if parsed.get("parse_error") else None
    )
    
    return {
        "task_results": [task_result],
        "last_agent_result": task_result,
        "agents_called": state.get("agents_called", []) + [AgentType.KNOWLEDGE_MINER],
        "messages": [AgentMessage(
            role=MessageRole.ASSISTANT,
            content=f"Recherche terminée sur le sujet : {parsed.get('topic', user_input[:50])}",
            agent=AgentType.KNOWLEDGE_MINER
        )]
    }


# ============================================================================
# AGENT 3 - DATA MODELER
# ============================================================================

def data_modeler_node(state: AX5SECTState) -> Dict[str, Any]:
    """
    Nœud Data Modeler : modélisation des données et workflows
    """
    user_input = state["user_input"]
    
    # MODE MOCK : utiliser les réponses simulées
    if is_mock_mode():
        parsed = get_mock_data_modeler_response()
        task_result = TaskResult(
            task_type="data_modeling",
            success=True,
            result=parsed,
            agent=AgentType.DATA_MODELER
        )
        return {
            "task_results": [task_result],
            "last_agent_result": task_result,
            "agents_called": state.get("agents_called", []) + [AgentType.DATA_MODELER],
            "messages": [AgentMessage(
                role=MessageRole.ASSISTANT,
                content=f"[MOCK] Modélisation terminée : {parsed.get('scope', 'Hub IMDS/PCF')}",
                agent=AgentType.DATA_MODELER
            )]
        }
    
    # MODE NORMAL : appeler Claude
    routing = state.get("routing_decision", {})
    
    # Construire le contexte avec les résultats précédents
    context_parts = [f"## Demande originale\n{user_input}"]
    
    if routing.get("analysis"):
        context_parts.append(f"## Analyse de l'orchestrateur\n{routing['analysis']}")
    
    # Ajouter les résultats du Knowledge Miner si disponibles
    for result in state.get("task_results", []):
        if result.agent == AgentType.KNOWLEDGE_MINER and result.success:
            km_result = result.result
            if isinstance(km_result, dict) and not km_result.get("parse_error"):
                context_parts.append(f"## Recherche préalable\n{json.dumps(km_result.get('research_summary', {}), indent=2, ensure_ascii=False)}")
    
    message = "\n\n".join(context_parts) + "\n\nPropose une modélisation adaptée à ce besoin."
    
    # Appeler Claude
    system_prompt = get_agent_prompt("data_modeler")
    response = call_claude(system_prompt, message)
    
    # Parser la réponse
    parsed = parse_json_response(response)
    
    # Créer le résultat de tâche
    task_result = TaskResult(
        task_type="data_modeling",
        success=not parsed.get("parse_error", False),
        result=parsed,
        agent=AgentType.DATA_MODELER,
        error=parsed.get("raw_response") if parsed.get("parse_error") else None
    )
    
    return {
        "task_results": [task_result],
        "last_agent_result": task_result,
        "agents_called": state.get("agents_called", []) + [AgentType.DATA_MODELER],
        "messages": [AgentMessage(
            role=MessageRole.ASSISTANT,
            content=f"Modélisation terminée. Scope : {parsed.get('scope', 'Non défini')}",
            agent=AgentType.DATA_MODELER
        )]
    }


# ============================================================================
# AGENT 4 - CAMPAIGN MANAGER
# ============================================================================

def campaign_manager_node(state: AX5SECTState) -> Dict[str, Any]:
    """
    Nœud Campaign Manager : conception de campagnes et KPI
    """
    user_input = state["user_input"]
    
    # MODE MOCK : utiliser les réponses simulées
    if is_mock_mode():
        parsed = get_mock_campaign_response()
        task_result = TaskResult(
            task_type="campaign_design",
            success=True,
            result=parsed,
            agent=AgentType.CAMPAIGN_MANAGER
        )
        return {
            "task_results": [task_result],
            "last_agent_result": task_result,
            "agents_called": state.get("agents_called", []) + [AgentType.CAMPAIGN_MANAGER],
            "messages": [AgentMessage(
                role=MessageRole.ASSISTANT,
                content=f"[MOCK] Campagne conçue : {parsed.get('campaign_design', {}).get('name', 'Campagne PCF')}",
                agent=AgentType.CAMPAIGN_MANAGER
            )]
        }
    
    # MODE NORMAL : appeler Claude
    routing = state.get("routing_decision", {})
    
    # Construire le contexte
    context_parts = [f"## Demande originale\n{user_input}"]
    
    if routing.get("analysis"):
        context_parts.append(f"## Analyse de l'orchestrateur\n{routing['analysis']}")
    
    # Ajouter les résultats pertinents des agents précédents
    for result in state.get("task_results", []):
        if result.success and isinstance(result.result, dict):
            if result.agent == AgentType.KNOWLEDGE_MINER:
                if result.result.get("best_practices"):
                    context_parts.append(f"## Meilleures pratiques identifiées\n{result.result.get('best_practices')}")
            elif result.agent == AgentType.DATA_MODELER:
                if result.result.get("workflows"):
                    context_parts.append(f"## Workflows modélisés\n{json.dumps(result.result.get('workflows', []), indent=2, ensure_ascii=False)}")
    
    message = "\n\n".join(context_parts) + "\n\nConçois une campagne et un playbook adaptés."
    
    # Appeler Claude
    system_prompt = get_agent_prompt("campaign_manager")
    response = call_claude(system_prompt, message)
    
    # Parser la réponse
    parsed = parse_json_response(response)
    
    # Créer le résultat de tâche
    task_result = TaskResult(
        task_type="campaign_design",
        success=not parsed.get("parse_error", False),
        result=parsed,
        agent=AgentType.CAMPAIGN_MANAGER,
        error=parsed.get("raw_response") if parsed.get("parse_error") else None
    )
    
    return {
        "task_results": [task_result],
        "last_agent_result": task_result,
        "agents_called": state.get("agents_called", []) + [AgentType.CAMPAIGN_MANAGER],
        "messages": [AgentMessage(
            role=MessageRole.ASSISTANT,
            content=f"Conception de campagne terminée : {parsed.get('campaign_design', {}).get('name', 'Campagne')}",
            agent=AgentType.CAMPAIGN_MANAGER
        )]
    }


# ============================================================================
# AGENT 5 - CONTENT GENERATOR
# ============================================================================

def content_generator_node(state: AX5SECTState) -> Dict[str, Any]:
    """
    Nœud Content Generator : génération de contenus opérationnels
    """
    user_input = state["user_input"]
    
    # MODE MOCK : utiliser les réponses simulées
    if is_mock_mode():
        parsed = get_mock_content_response()
        task_result = TaskResult(
            task_type="content_generation",
            success=True,
            result=parsed,
            agent=AgentType.CONTENT_GENERATOR
        )
        return {
            "task_results": [task_result],
            "last_agent_result": task_result,
            "agents_called": state.get("agents_called", []) + [AgentType.CONTENT_GENERATOR],
            "messages": [AgentMessage(
                role=MessageRole.ASSISTANT,
                content=f"[MOCK] Contenu généré : {parsed.get('content_type', 'email')}",
                agent=AgentType.CONTENT_GENERATOR
            )]
        }
    
    # MODE NORMAL : appeler Claude
    routing = state.get("routing_decision", {})
    
    # Construire le contexte
    context_parts = [f"## Demande originale\n{user_input}"]
    
    if routing.get("analysis"):
        context_parts.append(f"## Analyse de l'orchestrateur\n{routing['analysis']}")
    
    # Ajouter le contexte de campagne si disponible
    for result in state.get("task_results", []):
        if result.agent == AgentType.CAMPAIGN_MANAGER and result.success:
            campaign_design = result.result.get("campaign_design", {})
            if campaign_design:
                context_parts.append(f"## Contexte de campagne\n{json.dumps(campaign_design, indent=2, ensure_ascii=False)}")
    
    # Ajouter le contexte métier
    biz_ctx = state.get("business_context")
    if biz_ctx:
        if biz_ctx.loaded_supplier:
            context_parts.append(f"## Fournisseur cible\n{json.dumps(biz_ctx.loaded_supplier, indent=2, ensure_ascii=False)}")
    
    message = "\n\n".join(context_parts) + "\n\nGénère le contenu demandé."
    
    # Appeler Claude
    system_prompt = get_agent_prompt("content_generator")
    response = call_claude(system_prompt, message)
    
    # Parser la réponse
    parsed = parse_json_response(response)
    
    # Créer le résultat de tâche
    task_result = TaskResult(
        task_type="content_generation",
        success=not parsed.get("parse_error", False),
        result=parsed,
        agent=AgentType.CONTENT_GENERATOR,
        error=parsed.get("raw_response") if parsed.get("parse_error") else None
    )
    
    return {
        "task_results": [task_result],
        "last_agent_result": task_result,
        "agents_called": state.get("agents_called", []) + [AgentType.CONTENT_GENERATOR],
        "messages": [AgentMessage(
            role=MessageRole.ASSISTANT,
            content=f"Contenu généré : {parsed.get('content_type', 'document')}",
            agent=AgentType.CONTENT_GENERATOR
        )]
    }


# ============================================================================
# NŒUD DE SYNTHÈSE FINALE
# ============================================================================

def synthesizer_node(state: AX5SECTState) -> Dict[str, Any]:
    """
    Nœud de synthèse : compile tous les résultats en une réponse finale
    """
    user_input = state["user_input"]
    task_results = state.get("task_results", [])
    agents_called = state.get("agents_called", [])
    
    if not task_results:
        return {"final_response": "Je n'ai pas pu traiter votre demande. Veuillez reformuler."}
    
    # MODE MOCK : utiliser la synthèse simulée
    if is_mock_mode():
        agent_names = [a.value for a in agents_called] if agents_called else ["knowledge_miner"]
        final_response = generate_mock_synthesis(user_input, agent_names)
        return {
            "final_response": final_response,
            "messages": [AgentMessage(
                role=MessageRole.ASSISTANT,
                content="[MOCK] Synthèse terminée.",
                agent=AgentType.ORCHESTRATOR
            )]
        }
    
    # MODE NORMAL : appeler Claude pour la synthèse
    # Construire le prompt de synthèse
    synthesis_prompt = """Tu es un assistant expert en IMDS, PCF et Supplier Engagement.

Tu dois synthétiser les résultats de plusieurs agents spécialisés en une réponse claire et complète pour l'utilisateur.

Règles :
- Présente une réponse cohérente et structurée
- Utilise le français
- Mets en avant les points clés et actions recommandées
- Sois concis mais complet
- Adapte le niveau de détail à la demande originale"""
    
    # Compiler les résultats
    results_compilation = []
    for result in task_results:
        if result.success:
            results_compilation.append(f"## Résultat de {result.agent.value}\n{json.dumps(result.result, indent=2, ensure_ascii=False)}")
    
    synthesis_message = f"""## Demande originale de l'utilisateur
{user_input}

## Résultats des agents spécialisés
{chr(10).join(results_compilation)}

Synthétise ces résultats en une réponse claire et actionnable pour l'utilisateur."""
    
    # Appeler Claude pour la synthèse
    final_response = call_claude(synthesis_prompt, synthesis_message, temperature=0.5)
    
    return {
        "final_response": final_response,
        "messages": [AgentMessage(
            role=MessageRole.ASSISTANT,
            content="Synthèse terminée.",
            agent=AgentType.ORCHESTRATOR
        )]
    }


# ============================================================================
# MAPPING DES NŒUDS
# ============================================================================

AGENT_NODES = {
    AgentType.ORCHESTRATOR: orchestrator_node,
    AgentType.KNOWLEDGE_MINER: knowledge_miner_node,
    AgentType.DATA_MODELER: data_modeler_node,
    AgentType.CAMPAIGN_MANAGER: campaign_manager_node,
    AgentType.CONTENT_GENERATOR: content_generator_node,
}


def get_agent_node(agent_type: AgentType):
    """Récupère la fonction de nœud pour un type d'agent"""
    return AGENT_NODES.get(agent_type)
