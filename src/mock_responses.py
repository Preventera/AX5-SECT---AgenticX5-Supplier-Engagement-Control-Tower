"""
AX5-SECT Mock Responses
Réponses simulées pour développer sans crédits API Anthropic
"""

import json
import random
from datetime import datetime
from typing import Dict, Any


# ============================================================================
# RÉPONSES MOCK PAR AGENT
# ============================================================================

MOCK_ORCHESTRATOR_RESPONSES = [
    {
        "analysis": "Demande analysée : recherche d'informations sur les exigences IMDS/PCF",
        "agents_to_call": ["knowledge_miner"],
        "reasoning": "Cette demande nécessite une recherche dans la base de connaissances IMDS/PCF",
        "sequence": "1. Knowledge Miner pour la recherche"
    },
    {
        "analysis": "Demande analysée : conception de campagne d'engagement fournisseurs",
        "agents_to_call": ["knowledge_miner", "campaign_manager", "content_generator"],
        "reasoning": "Campagne complète nécessitant recherche, conception et contenus",
        "sequence": "1. Knowledge Miner → 2. Campaign Manager → 3. Content Generator"
    },
    {
        "analysis": "Demande analysée : génération de contenu opérationnel",
        "agents_to_call": ["content_generator"],
        "reasoning": "Demande de génération de contenu (email, script, etc.)",
        "sequence": "1. Content Generator"
    },
    {
        "analysis": "Demande analysée : modélisation de données",
        "agents_to_call": ["data_modeler"],
        "reasoning": "Demande de schéma ou workflow",
        "sequence": "1. Data Modeler"
    }
]


MOCK_KNOWLEDGE_MINER_RESPONSES = {
    "topic": "IMDS 15.0 & Product Carbon Footprint (PCF)",
    "research_summary": {
        "context": """IMDS 15.0 introduit la fonctionnalité PCF (Product Carbon Footprint) permettant 
aux fournisseurs de déclarer l'empreinte carbone de leurs produits directement dans le système IMDS.
Cette évolution répond aux exigences croissantes de transparence environnementale dans l'industrie automobile.""",
        
        "regulatory_framework": """
- **IMDS Recommendation 027** : Règles et directives pour le reporting des données PCF
- **Catena-X PCF Rulebook** : Standardisation des calculs PCF dans l'automobile
- **ISO 14067** : Norme internationale pour la quantification de l'empreinte carbone des produits
- **GHG Protocol Product Standard** : Méthodologie de calcul des émissions produit""",
        
        "tools_solutions": """
- Module PCF intégré à IMDS 15.0
- Plateformes de collecte PCF (Manufacture 2030, Sphera)
- Outils de calcul ACV (SimaPro, GaBi, OpenLCA)
- Connecteurs Catena-X pour l'échange de données""",
        
        "best_practices": """
1. Commencer par les fournisseurs Tier-1 à fort volume
2. Fournir des templates et guides aux fournisseurs
3. Proposer des sessions de formation
4. Mettre en place un support dédié
5. Définir des KPI de suivi (taux de réponse, qualité des données)""",
        
        "hub_implications": """
- Intégrer un module de collecte PCF dans le Hub
- Connecter les données PCF aux profils fournisseurs existants
- Automatiser les relances et validations
- Créer des tableaux de bord de suivi PCF"""
    },
    "key_takeaways": [
        "IMDS 15.0 permet désormais la déclaration PCF directe",
        "Alignement avec Catena-X PCF Rulebook requis",
        "Les fournisseurs ont besoin d'accompagnement",
        "La qualité des données est critique pour le Scope 3"
    ],
    "recommended_actions": [
        "Évaluer la maturité PCF des fournisseurs clés",
        "Planifier une campagne pilote PCF",
        "Préparer les supports de formation",
        "Définir les KPI de suivi"
    ],
    "future_fiches": [
        "Fiche IMDS 15.0 - Exigences PCF",
        "Fiche Catena-X PCF Rulebook",
        "Guide de collecte PCF fournisseurs"
    ]
}


MOCK_DATA_MODELER_RESPONSES = {
    "scope": "Modélisation du suivi des soumissions PCF fournisseurs",
    "entities": [
        {
            "name": "pcf_submissions",
            "description": "Soumissions PCF des fournisseurs",
            "fields": [
                {"name": "id", "type": "integer", "usage": "Identifiant unique"},
                {"name": "supplier_id", "type": "integer", "usage": "Référence au fournisseur"},
                {"name": "product_ref", "type": "string", "usage": "Référence produit"},
                {"name": "total_emissions_kgco2e", "type": "decimal", "usage": "Émissions totales en kg CO2e"},
                {"name": "methodology", "type": "string", "usage": "Méthodologie utilisée (ISO 14067, PEF, etc.)"},
                {"name": "perimeter", "type": "string", "usage": "Périmètre (cradle-to-gate, etc.)"},
                {"name": "reference_year", "type": "integer", "usage": "Année de référence"},
                {"name": "validation_status", "type": "enum", "usage": "pending, validated, rejected"},
                {"name": "submitted_at", "type": "timestamp", "usage": "Date de soumission"},
                {"name": "validated_at", "type": "timestamp", "usage": "Date de validation"}
            ],
            "relations": ["suppliers", "campaigns", "pcf_validation_history"]
        }
    ],
    "workflows": [
        {
            "name": "PCF Submission Workflow",
            "actors": ["Fournisseur", "Équipe Qualité", "Équipe RSE", "Hub AX5-SECT"],
            "steps": [
                "1. Fournisseur reçoit la demande de PCF",
                "2. Fournisseur complète le formulaire PCF",
                "3. Hub valide automatiquement la complétude",
                "4. Équipe RSE vérifie la cohérence des données",
                "5. Validation ou demande de correction",
                "6. Intégration dans le reporting Scope 3"
            ],
            "checkpoints": [
                "Validation complétude (automatique)",
                "Contrôle cohérence (humain)",
                "Approbation finale"
            ],
            "events": [
                "PCF_SUBMITTED",
                "PCF_VALIDATED",
                "PCF_REJECTED",
                "CORRECTION_REQUESTED"
            ]
        }
    ],
    "sql_schema": """
CREATE TABLE pcf_submissions (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    product_ref VARCHAR(100),
    total_emissions_kgco2e DECIMAL(12,4),
    methodology VARCHAR(50),
    perimeter VARCHAR(50),
    reference_year INTEGER,
    validation_status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP,
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
""",
    "implementation_notes": "Ce modèle s'intègre au schéma existant du Hub AX5-SECT. La table pcf_submissions complète la table pcf_objects déjà définie."
}


MOCK_CAMPAIGN_MANAGER_RESPONSES = {
    "campaign_design": {
        "name": "Campagne PCF Fournisseurs Tier-1 - Q1 2025",
        "type": "PCF",
        "objectives": [
            "Collecter les données PCF de 50 fournisseurs prioritaires",
            "Atteindre 80% de couverture des émissions Scope 3 achats",
            "Améliorer la qualité des données PCF (>70% données primaires)"
        ],
        "target": {
            "segment": "Fournisseurs Tier-1 à fort volume d'achats",
            "criteria": [
                "Volume d'achats > 1M€/an",
                "Catégories à forte intensité carbone",
                "Fournisseurs stratégiques"
            ],
            "estimated_suppliers": 50
        },
        "timeline": {
            "start_date": "2025-01-15",
            "phases": [
                {
                    "name": "Phase 1 - Préparation",
                    "duration_weeks": 2,
                    "activities": ["Segmentation finale", "Préparation des supports", "Formation équipes"]
                },
                {
                    "name": "Phase 2 - Lancement",
                    "duration_weeks": 1,
                    "activities": ["Envoi des invitations", "Webinaire de lancement"]
                },
                {
                    "name": "Phase 3 - Collecte",
                    "duration_weeks": 6,
                    "activities": ["Support fournisseurs", "Relances", "Validation des données"]
                },
                {
                    "name": "Phase 4 - Clôture",
                    "duration_weeks": 2,
                    "activities": ["Analyse des résultats", "Rapport final", "Retour d'expérience"]
                }
            ]
        },
        "channels": ["email", "portail Hub", "webinaire", "support téléphonique"],
        "roles": {
            "quality": "Validation technique des données PCF",
            "rse": "Pilotage campagne, analyse Scope 3",
            "achats": "Relation fournisseurs, escalades"
        }
    },
    "kpis": [
        {"name": "Taux de réponse", "formula": "Fournisseurs ayant soumis / Total ciblés", "target": "90%", "frequency": "weekly"},
        {"name": "Taux de validation", "formula": "PCF validés / PCF soumis", "target": "85%", "frequency": "weekly"},
        {"name": "Couverture émissions", "formula": "Émissions couvertes par PCF / Émissions totales achats", "target": "80%", "frequency": "monthly"},
        {"name": "Qualité données", "formula": "PCF avec données primaires / Total PCF", "target": "70%", "frequency": "monthly"}
    ],
    "playbook": {
        "steps": [
            {"step": 1, "action": "Finaliser la liste des 50 fournisseurs", "owner": "RSE + Achats", "checklist": ["Validation volumes", "Vérification contacts"]},
            {"step": 2, "action": "Préparer les templates PCF", "owner": "RSE", "checklist": ["Template Excel", "Guide méthodologique"]},
            {"step": 3, "action": "Configurer le portail Hub", "owner": "IT", "checklist": ["Formulaires PCF", "Automatisation relances"]},
            {"step": 4, "action": "Envoyer les invitations", "owner": "RSE", "checklist": ["Email personnalisé", "Lien portail"]},
            {"step": 5, "action": "Organiser le webinaire", "owner": "RSE", "checklist": ["Présentation", "FAQ", "Enregistrement"]},
            {"step": 6, "action": "Suivre et relancer", "owner": "RSE + Achats", "checklist": ["Dashboard hebdo", "Relances J+7, J+14, J+21"]},
            {"step": 7, "action": "Valider les soumissions", "owner": "Qualité + RSE", "checklist": ["Contrôle complétude", "Contrôle cohérence"]},
            {"step": 8, "action": "Produire le rapport", "owner": "RSE", "checklist": ["KPIs", "Analyse", "Recommandations"]}
        ],
        "escalation_rules": [
            "Fournisseur sans réponse après 3 relances → escalade Achats",
            "PCF avec données incohérentes → contact direct RSE",
            "Blocage technique → support IT dédié"
        ],
        "automation_opportunities": [
            "Relances automatiques via Hub",
            "Validation automatique de complétude",
            "Calcul automatique des KPIs",
            "Alertes sur fournisseurs en retard"
        ]
    }
}


MOCK_CONTENT_GENERATOR_RESPONSES = {
    "content_type": "email",
    "target_audience": "Fournisseurs Tier-1 en retard sur leur soumission PCF",
    "objective": "Relancer les fournisseurs pour obtenir leurs données PCF",
    "tone": "professionnel mais incitatif",
    "content": {
        "subject": "🔔 Rappel : Votre déclaration PCF attendue - Action requise",
        "short_version": """Bonjour,

Nous n'avons pas encore reçu votre déclaration Product Carbon Footprint (PCF) dans le cadre de notre campagne de collecte.

La date limite approche. Merci de compléter votre soumission via notre portail avant le [DATE].

Pour toute question, notre équipe est à votre disposition.

Cordialement,
L'équipe RSE""",
        
        "detailed_version": """Bonjour [NOM DU CONTACT],

Dans le cadre de notre programme d'engagement fournisseurs sur les enjeux climatiques, nous vous avions sollicité pour obtenir les données Product Carbon Footprint (PCF) de vos produits fournis.

À ce jour, nous n'avons pas encore reçu votre soumission.

**Pourquoi c'est important :**
- Ces données sont essentielles pour notre reporting Scope 3
- Elles nous permettent d'identifier ensemble des leviers de réduction d'émissions
- La réglementation CSRD renforce nos obligations de transparence

**Comment procéder :**
1. Connectez-vous à notre portail : [LIEN]
2. Complétez le formulaire PCF pour vos produits principaux
3. Joignez les justificatifs si disponibles

**Besoin d'aide ?**
- Guide méthodologique : [LIEN]
- FAQ : [LIEN]
- Support : [EMAIL] ou [TÉLÉPHONE]

La date limite de soumission est fixée au **[DATE]**.

Nous restons à votre disposition pour vous accompagner dans cette démarche.

Cordialement,

[NOM]
Équipe RSE / Développement Durable
[ENTREPRISE]""",
        
        "call_to_action": "Compléter la soumission PCF sur le portail avant la date limite"
    },
    "variants": [
        {
            "variant_name": "Version urgente (dernière relance)",
            "content": """⚠️ DERNIÈRE RELANCE - Action immédiate requise

Bonjour,

Malgré nos précédents rappels, nous n'avons toujours pas reçu votre déclaration PCF.

La date limite est dans 48h. Sans réponse de votre part, nous serons contraints d'utiliser des facteurs d'émission par défaut, moins favorables.

Merci de compléter votre soumission dès que possible : [LIEN]

L'équipe RSE"""
        }
    ],
    "usage_notes": "Personnaliser avec le nom du contact, les dates, et les liens spécifiques au portail. Adapter le ton selon l'historique de la relation avec le fournisseur."
}


# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def get_mock_orchestrator_response(user_input: str) -> Dict[str, Any]:
    """Retourne une réponse mock de l'orchestrateur basée sur le contenu"""
    user_lower = user_input.lower()
    
    if any(word in user_lower for word in ["campagne", "campaign", "engager", "engage"]):
        return MOCK_ORCHESTRATOR_RESPONSES[1]
    elif any(word in user_lower for word in ["email", "relance", "script", "contenu"]):
        return MOCK_ORCHESTRATOR_RESPONSES[2]
    elif any(word in user_lower for word in ["modèle", "schéma", "workflow", "données"]):
        return MOCK_ORCHESTRATOR_RESPONSES[3]
    else:
        return MOCK_ORCHESTRATOR_RESPONSES[0]


def get_mock_knowledge_response() -> Dict[str, Any]:
    """Retourne une réponse mock du Knowledge Miner"""
    return MOCK_KNOWLEDGE_MINER_RESPONSES


def get_mock_data_modeler_response() -> Dict[str, Any]:
    """Retourne une réponse mock du Data Modeler"""
    return MOCK_DATA_MODELER_RESPONSES


def get_mock_campaign_response() -> Dict[str, Any]:
    """Retourne une réponse mock du Campaign Manager"""
    return MOCK_CAMPAIGN_MANAGER_RESPONSES


def get_mock_content_response() -> Dict[str, Any]:
    """Retourne une réponse mock du Content Generator"""
    return MOCK_CONTENT_GENERATOR_RESPONSES


def generate_mock_synthesis(user_input: str, agents_called: list) -> str:
    """Génère une synthèse mock basée sur les agents appelés"""
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    synthesis_parts = [
        f"## 🤖 Réponse AX5-SECT (Mode Démonstration)",
        f"*Généré le {timestamp}*\n",
        f"**Votre demande :** {user_input}\n",
        f"**Agents mobilisés :** {', '.join(agents_called)}\n",
        "---\n"
    ]
    
    if "knowledge_miner" in agents_called:
        km = MOCK_KNOWLEDGE_MINER_RESPONSES
        synthesis_parts.append("### 📚 Recherche & Connaissances\n")
        synthesis_parts.append(km["research_summary"]["context"] + "\n")
        synthesis_parts.append("\n**Points clés :**")
        for point in km["key_takeaways"]:
            synthesis_parts.append(f"- {point}")
        synthesis_parts.append("\n")
    
    if "campaign_manager" in agents_called:
        cm = MOCK_CAMPAIGN_MANAGER_RESPONSES
        synthesis_parts.append("### 🎯 Conception de Campagne\n")
        synthesis_parts.append(f"**Campagne proposée :** {cm['campaign_design']['name']}\n")
        synthesis_parts.append("**Objectifs :**")
        for obj in cm['campaign_design']['objectives']:
            synthesis_parts.append(f"- {obj}")
        synthesis_parts.append(f"\n**Cible :** {cm['campaign_design']['target']['estimated_suppliers']} fournisseurs")
        synthesis_parts.append(f"\n**Durée :** {sum(p['duration_weeks'] for p in cm['campaign_design']['timeline']['phases'])} semaines\n")
    
    if "content_generator" in agents_called:
        cg = MOCK_CONTENT_GENERATOR_RESPONSES
        synthesis_parts.append("### ✉️ Contenu Généré\n")
        synthesis_parts.append(f"**Type :** {cg['content_type']}")
        synthesis_parts.append(f"\n**Objet :** {cg['content']['subject']}\n")
        synthesis_parts.append("**Aperçu :**")
        synthesis_parts.append(f"```\n{cg['content']['short_version'][:500]}...\n```\n")
    
    if "data_modeler" in agents_called:
        dm = MOCK_DATA_MODELER_RESPONSES
        synthesis_parts.append("### 📊 Modélisation Proposée\n")
        synthesis_parts.append(f"**Scope :** {dm['scope']}\n")
        synthesis_parts.append("**Entités définies :**")
        for entity in dm['entities']:
            synthesis_parts.append(f"- `{entity['name']}` : {entity['description']}")
        synthesis_parts.append("\n")
    
    synthesis_parts.append("---")
    synthesis_parts.append("\n⚠️ *Mode démonstration actif. Activez les crédits API Anthropic pour des réponses IA complètes.*")
    
    return "\n".join(synthesis_parts)
