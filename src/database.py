"""
AX5-SECT Database Connection
Connexion PostgreSQL avec SQLAlchemy
"""

from contextlib import contextmanager
from typing import Generator, Optional
import logging

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from .config import settings

logger = logging.getLogger(__name__)


# ============================================================================
# DATABASE ENGINE
# ============================================================================

def get_database_url() -> str:
    """Construit l'URL de connexion PostgreSQL"""
    return (
        f"postgresql://{settings.postgres_user}:{settings.postgres_password}"
        f"@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_db}"
    )


def create_db_engine(echo: bool = False):
    """Crée le moteur SQLAlchemy"""
    return create_engine(
        get_database_url(),
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        echo=echo
    )


# Engine global (lazy initialization)
_engine = None


def get_engine():
    """Récupère ou crée le moteur de base de données"""
    global _engine
    if _engine is None:
        _engine = create_db_engine(echo=settings.debug)
    return _engine


# Session factory
_SessionLocal = None


def get_session_factory():
    """Récupère ou crée la factory de sessions"""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine()
        )
    return _SessionLocal


# ============================================================================
# SESSION MANAGEMENT
# ============================================================================

def get_db() -> Generator[Session, None, None]:
    """
    Générateur de session pour FastAPI Depends
    Usage: db: Session = Depends(get_db)
    """
    SessionLocal = get_session_factory()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager pour utilisation hors FastAPI
    Usage: with get_db_session() as db: ...
    """
    SessionLocal = get_session_factory()
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ============================================================================
# HEALTH CHECK & UTILITIES
# ============================================================================

def check_db_connection() -> dict:
    """Vérifie la connexion à la base de données"""
    try:
        with get_db_session() as db:
            result = db.execute(text("SELECT 1 as health"))
            row = result.fetchone()
            if row and row[0] == 1:
                return {"status": "healthy", "database": settings.postgres_db}
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return {"status": "unhealthy", "error": str(e)}
    
    return {"status": "unknown"}


def get_table_counts() -> dict:
    """Récupère le nombre d'enregistrements dans les tables principales"""
    tables = [
        "suppliers",
        "campaigns", 
        "imds_submissions",
        "pcf_objects",
        "knowledge_documents"
    ]
    
    counts = {}
    try:
        with get_db_session() as db:
            for table in tables:
                try:
                    result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    row = result.fetchone()
                    counts[table] = row[0] if row else 0
                except Exception:
                    counts[table] = -1  # Table n'existe pas
    except Exception as e:
        logger.error(f"Failed to get table counts: {e}")
        return {"error": str(e)}
    
    return counts


# ============================================================================
# CRUD HELPERS
# ============================================================================

class DatabaseError(Exception):
    """Exception personnalisée pour les erreurs de base de données"""
    pass


def execute_query(query: str, params: dict = None) -> list:
    """Exécute une requête SELECT et retourne les résultats"""
    try:
        with get_db_session() as db:
            result = db.execute(text(query), params or {})
            return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        raise DatabaseError(f"Query failed: {e}")


def execute_insert(query: str, params: dict = None) -> Optional[int]:
    """Exécute une requête INSERT et retourne l'ID inséré"""
    try:
        with get_db_session() as db:
            result = db.execute(text(query + " RETURNING id"), params or {})
            row = result.fetchone()
            return row[0] if row else None
    except Exception as e:
        logger.error(f"Insert execution failed: {e}")
        raise DatabaseError(f"Insert failed: {e}")


def execute_update(query: str, params: dict = None) -> int:
    """Exécute une requête UPDATE et retourne le nombre de lignes affectées"""
    try:
        with get_db_session() as db:
            result = db.execute(text(query), params or {})
            return result.rowcount
    except Exception as e:
        logger.error(f"Update execution failed: {e}")
        raise DatabaseError(f"Update failed: {e}")
