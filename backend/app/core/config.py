import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = BASE_DIR / "data" / "it_asset.db"
DEFAULT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    app_name: str = "IT Asset Management API"
    app_env: str = "development"
    database_url: str = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"
    
    # JWT Settings
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("database_url")
    @classmethod
    def normalize_sqlite_path(cls, value: str) -> str:
        """Normalize relative sqlite paths to backend directory for stable runtime behavior."""
        if value.startswith("sqlite:///./"):
            relative_path = value.removeprefix("sqlite:///./")
            absolute_path = (BASE_DIR / relative_path).resolve()
            return f"sqlite:///{absolute_path.as_posix()}"

        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
