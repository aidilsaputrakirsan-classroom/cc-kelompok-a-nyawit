import logging

from fastapi import FastAPI
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.db.database import SessionLocal
from app.db.init_db import init_db, seed_admin_user, seed_categories
from app.models import Asset, BorrowLog, Category, User  # noqa: F401 - imported for SQLAlchemy registration

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="IT Asset Management API",
    description="Backend API untuk Sistem Manajemen Aset IT dengan Autentikasi JWT",
    version="1.1.0",
)

app.include_router(api_router)


@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {"message": "IT Asset Management API is running", "version": "1.1.0"}


@app.on_event("startup")
def on_startup() -> None:
    """Initialize database and seed data on startup."""
    logger.info("Starting up IT Asset Management API...")
    
    try:
        # Create database tables
        init_db()
        
        # Seed initial data
        db: Session = SessionLocal()
        try:
            seed_categories(db)
            seed_admin_user(db)
        finally:
            db.close()
        
        logger.info("Startup complete!")
    except Exception as e:
        logger.warning(f"Database not ready yet, skipping initialization: {e}")
        logger.info("Application will retry connections during requests")
