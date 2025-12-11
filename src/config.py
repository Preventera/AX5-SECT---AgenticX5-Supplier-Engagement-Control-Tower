"""
AX5-SECT Configuration
Configuration centralisée pour l'application AgenticX5 Supplier Engagement Control Tower
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os


class Settings(BaseSettings):
    """Configuration de l'application AX5-SECT"""
    
    # Application
    app_name: str = "AX5-SECT"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Mode Mock (pour développer sans crédits API)
    mock_mode: bool = Field(default=True, env="MOCK_MODE")
    
    # Anthropic (Claude)
    anthropic_api_key: str = Field(default="", env="ANTHROPIC_API_KEY")
    claude_model: str = "claude-sonnet-4-20250514"
    claude_max_tokens: int = 4096
    
    # PostgreSQL
    postgres_host: str = Field(default="localhost", env="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, env="POSTGRES_PORT")
    postgres_db: str = Field(default="ax5sect", env="POSTGRES_DB")
    postgres_user: str = Field(default="postgres", env="POSTGRES_USER")
    postgres_password: str = Field(..., env="POSTGRES_PASSWORD")
    
    @property
    def postgres_url(self) -> str:
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    @property
    def postgres_async_url(self) -> str:
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    # Neo4j (optionnel)
    neo4j_uri: Optional[str] = Field(default=None, env="NEO4J_URI")
    neo4j_user: Optional[str] = Field(default=None, env="NEO4J_USER")
    neo4j_password: Optional[str] = Field(default=None, env="NEO4J_PASSWORD")
    
    # LangSmith (observabilité)
    langsmith_api_key: Optional[str] = Field(default=None, env="LANGSMITH_API_KEY")
    langsmith_project: str = Field(default="ax5-sect", env="LANGSMITH_PROJECT")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Instance globale
settings = Settings()


# Template .env pour référence
ENV_TEMPLATE = """
# AX5-SECT Environment Variables

# Anthropic (Claude) - REQUIRED
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# PostgreSQL - REQUIRED
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ax5sect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password_here

# Neo4j (optional)
# NEO4J_URI=bolt://localhost:7687
# NEO4J_USER=neo4j
# NEO4J_PASSWORD=your_neo4j_password_here

# LangSmith (optional - for observability)
# LANGSMITH_API_KEY=your_langsmith_api_key_here
# LANGSMITH_PROJECT=ax5-sect
"""
