import logging

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.database import engine
from app.models import Base, Category, User, UserRole

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db() -> None:
    """Initialize database tables."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")


def seed_categories(db: Session) -> None:
    """Seed initial categories if none exist."""
    existing = db.query(Category).first()
    if existing:
        logger.info("Categories already exist, skipping seed")
        return

    logger.info("Seeding default categories...")
    
    # Categories that match the frontend expectations
    categories = [
        Category(name="Hardware", description="Laptops, Desktops, Servers, Tablets, Smartphones"),
        Category(name="Software", description="Software Licenses, OS Licenses, Cloud Subscriptions, Antivirus"),
        Category(name="Peripherals", description="Monitors, Keyboards, Mice, Printers, Webcams, Headsets"),
    ]
    
    for category in categories:
        db.add(category)
    
    db.commit()
    logger.info(f"Seeded {len(categories)} default categories")


def seed_admin_user(db: Session) -> None:
    """Seed admin user if no users exist."""
    existing = db.query(User).first()
    if existing:
        logger.info("Users already exist, skipping admin seed")
        return

    logger.info("Seeding default admin user...")
    
    admin_user = User(
        username="admin",
        email="admin@itasset.local",
        full_name="System Administrator",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    
    db.add(admin_user)
    db.commit()
    logger.info("Created default admin user: admin / admin123")
    logger.info("IMPORTANT: Please change the default password after first login!")
