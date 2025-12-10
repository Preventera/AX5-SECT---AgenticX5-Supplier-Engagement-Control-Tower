"""
AX5-SECT - Point d'entrée principal

Lance l'API FastAPI ou exécute des commandes CLI.
"""

import argparse
import asyncio
import sys
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent))


def run_api(host: str = "0.0.0.0", port: int = 8000, reload: bool = False):
    """Lance l'API FastAPI"""
    import uvicorn
    uvicorn.run(
        "src.api:app",
        host=host,
        port=port,
        reload=reload
    )


async def run_demo():
    """Exécute une démonstration du système"""
    from src.graph import create_ax5sect_app, run_ax5sect
    from langgraph.checkpoint.memory import MemorySaver
    
    print("=" * 60)
    print("🚀 AX5-SECT - Démonstration")
    print("=" * 60)
    
    # Créer l'application
    memory = MemorySaver()
    app = create_ax5sect_app(checkpointer=memory)
    
    # Requêtes de démonstration
    demo_queries = [
        "Quelles sont les principales exigences du PCF dans IMDS 15.0 ?",
        "Conçois une campagne PCF pour engager nos 50 fournisseurs Tier-1 les plus émissifs en Mauricie",
        "Génère un email de lancement pour cette campagne PCF",
    ]
    
    for i, query in enumerate(demo_queries, 1):
        print(f"\n{'=' * 60}")
        print(f"📝 Requête {i}: {query}")
        print("=" * 60)
        
        result = await run_ax5sect(
            user_input=query,
            app=app,
            config={"configurable": {"thread_id": f"demo-{i}"}},
            debug=True
        )
        
        print(f"\n🤖 Agents appelés: {', '.join(result['agents_called'])}")
        print(f"🔄 Itérations: {result['iteration_count']}")
        print(f"\n📄 Réponse:\n{result['response'][:2000]}...")
        
        if result.get("errors"):
            print(f"\n⚠️ Erreurs: {result['errors']}")
    
    print("\n" + "=" * 60)
    print("✅ Démonstration terminée")
    print("=" * 60)


async def interactive_chat():
    """Lance une session de chat interactive"""
    from src.graph import create_ax5sect_app, run_ax5sect
    from langgraph.checkpoint.memory import MemorySaver
    
    print("=" * 60)
    print("🤖 AX5-SECT - Chat Interactif")
    print("=" * 60)
    print("Tapez 'quit' ou 'exit' pour quitter")
    print("Tapez 'debug on/off' pour activer/désactiver le mode debug")
    print("=" * 60)
    
    memory = MemorySaver()
    app = create_ax5sect_app(checkpointer=memory)
    thread_id = "interactive-session"
    debug = False
    
    while True:
        try:
            user_input = input("\n👤 Vous: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ["quit", "exit", "q"]:
                print("👋 Au revoir!")
                break
            
            if user_input.lower() == "debug on":
                debug = True
                print("🔧 Mode debug activé")
                continue
            
            if user_input.lower() == "debug off":
                debug = False
                print("🔧 Mode debug désactivé")
                continue
            
            print("\n⏳ Traitement en cours...")
            
            result = await run_ax5sect(
                user_input=user_input,
                app=app,
                config={"configurable": {"thread_id": thread_id}},
                debug=debug
            )
            
            print(f"\n🤖 AX5-SECT ({', '.join(result['agents_called'])}):")
            print(result['response'])
            
            if debug and result.get('task_results'):
                print(f"\n🔧 Debug - Résultats des tâches:")
                for tr in result['task_results']:
                    print(f"  - {tr['agent']}: {tr['task_type']} ({'✓' if tr['success'] else '✗'})")
        
        except KeyboardInterrupt:
            print("\n👋 Au revoir!")
            break
        except Exception as e:
            print(f"\n❌ Erreur: {e}")


def main():
    """Point d'entrée principal"""
    parser = argparse.ArgumentParser(
        description="AX5-SECT - AgenticX5 Supplier Engagement Control Tower"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Commandes disponibles")
    
    # Commande: api
    api_parser = subparsers.add_parser("api", help="Lance l'API FastAPI")
    api_parser.add_argument("--host", default="0.0.0.0", help="Host (défaut: 0.0.0.0)")
    api_parser.add_argument("--port", type=int, default=8000, help="Port (défaut: 8000)")
    api_parser.add_argument("--reload", action="store_true", help="Activer le hot reload")
    
    # Commande: demo
    subparsers.add_parser("demo", help="Exécute une démonstration")
    
    # Commande: chat
    subparsers.add_parser("chat", help="Lance un chat interactif")
    
    # Commande: version
    subparsers.add_parser("version", help="Affiche la version")
    
    args = parser.parse_args()
    
    if args.command == "api":
        run_api(host=args.host, port=args.port, reload=args.reload)
    
    elif args.command == "demo":
        asyncio.run(run_demo())
    
    elif args.command == "chat":
        asyncio.run(interactive_chat())
    
    elif args.command == "version":
        print("AX5-SECT v1.0.0")
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
