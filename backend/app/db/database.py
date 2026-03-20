from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Engine creation with best practices for Docker/Production
engine = create_engine(
    settings.database_url,
    # pool_pre_ping=True checks the connection before every request
    # Highly recommended for databases in Docker containers
    pool_pre_ping=True,
    # echo=False prevents excessive logging, set to True for debugging SQL queries
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
