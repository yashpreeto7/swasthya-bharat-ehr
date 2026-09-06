from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Swasthya Bharat EHR"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"
    SECRET_KEY: str = "medindia_dev_secret_key_8f7b2c9a1d4e3f6a5b0c8d7e6f5a4b3c"

    # JWT
    JWT_SECRET_KEY: str = "medindia_jwt_dev_secret_2026_96328350_963e_40b2_ba8b_675dba744c55"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # Database: SQLite async for local zero-config, PostgreSQL for production
    DATABASE_URL: str = "sqlite+aiosqlite:///./.tmp/medindia_dev.db"
    POSTGRES_DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/medindia_healthos"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # AI Configuration
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    AI_MODEL_NAME: str = "gemini-2.5-flash"

    model_config = {
        "env_file": str(BASE_DIR / ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()
