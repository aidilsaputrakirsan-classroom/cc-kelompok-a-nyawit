import logging

# Configure detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.db.database import SessionLocal
from app.db.init_db import init_db, seed_admin_user, seed_categories, seed_locations, seed_assets
from app.models import Asset, BorrowLog, Category, User, Location, Transaction  # noqa: F401 - imported for SQLAlchemy registration

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="IT Asset Management API",
    description="Backend API untuk Sistem Manajemen Aset IT dengan Autentikasi JWT",
    version="1.1.0",
)

# Configure CORS - allow all origins for Docker deployment
# In production, restrict this to your specific domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        logger.info("Creating database tables...")
        init_db()
        logger.info("Database tables created successfully")
        
        # Seed initial data
        db: Session = SessionLocal()
        try:
            logger.info("Seeding initial data...")
            seed_categories(db)
            logger.info("Categories seeded")
            seed_locations(db)
            logger.info("Locations seeded")
            seed_assets(db)
            logger.info("Assets seeded")
            seed_admin_user(db)
            logger.info("Admin user seeded")
        except Exception as seed_error:
            logger.error(f"Error during seeding: {seed_error}")
            db.rollback()
        finally:
            db.close()
        
        logger.info("Startup complete!")
    except Exception as e:
        logger.error(f"Startup error: {e}")
        logger.warning(f"Database not ready yet, skipping initialization: {e}")
        logger.info("Application will retry connections during requests")
