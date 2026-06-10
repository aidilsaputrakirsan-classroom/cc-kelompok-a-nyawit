import logging
import os
import time

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
from app.db.init_db import init_db, seed_admin_user, seed_categories, seed_locations, seed_asset_types
from app.models import Asset, AssetType, BorrowLog, Category, User, Location, Transaction  # noqa: F401 - imported for SQLAlchemy registration

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="IT Asset Management API",
    description="Backend API untuk Sistem Manajemen Aset IT dengan Autentikasi JWT",
    version="1.1.0",
)

# Configure CORS from environment variable `ALLOW_ORIGINS` (comma-separated)
# Default to http://localhost for local development. Do NOT use `*` in production.
allow_origins_env = os.getenv("ALLOW_ORIGINS", "http://localhost")
allow_origins = [o.strip() for o in allow_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
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

    last_error: Exception | None = None
    # Attempt to initialize DB with retries
    for attempt in range(1, 6):
        try:
            logger.info("Creating database tables (attempt %s/5)...", attempt)
            init_db()
            logger.info("Database tables created successfully")

            # Only run seeding if AUTO_SEED environment variable is truthy
            auto_seed = os.getenv("AUTO_SEED", "false").lower() in ("1", "true", "yes")

            if auto_seed:
                db: Session = SessionLocal()
                try:
                    logger.info("Seeding initial data (AUTO_SEED enabled)...")
                    seed_categories(db)
                    logger.info("Categories seeded")
                    seed_asset_types(db)
                    logger.info("Asset types seeded")
                    seed_locations(db)
                    logger.info("Locations seeded")
                    seed_admin_user(db)
                    logger.info("Admin user seeded")
                except Exception as seed_error:
                    logger.error(f"Error during seeding: {seed_error}")
                    db.rollback()
                    raise
                finally:
                    db.close()
            else:
                logger.info("AUTO_SEED not enabled - skipping data seeding on startup")

            logger.info("Startup complete!")
            return
        except Exception as error:
            last_error = error
            logger.error(f"Startup error on attempt {attempt}: {error}")
            if attempt < 5:
                time.sleep(5)

    logger.error("Database initialization failed after retries, but continuing startup to expose health check errors.")
