from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Engine creation with SQLite configuration
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False,
)

# expire_on_commit=False is crucial for FastAPI to access model properties
# after db.commit() without raising DetachedInstanceError
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    expire_on_commit=False
)

def get_db() -> Generator[Session, None, None]:
    """Dependency for providing a database session to FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
