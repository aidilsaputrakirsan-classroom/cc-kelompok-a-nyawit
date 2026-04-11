import logging
from datetime import date

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.database import engine
from app.models import Base, Category, User, UserRole, Location, Asset, AssetStatus, AssetCondition

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
        email="admin@company.com",
        full_name="System Administrator",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    
    db.add(admin_user)
    
    # Add IT user
    it_user = User(
        username="it",
        email="it@company.com",
        full_name="IT Staff",
        hashed_password=get_password_hash("it123"),
        role=UserRole.USER,
        is_active=True,
    )
    db.add(it_user)
    
    # Add Tech user
    tech_user = User(
        username="tech",
        email="tech@company.com",
        full_name="Tech Support",
        hashed_password=get_password_hash("tech123"),
        role=UserRole.USER,
        is_active=True,
    )
    db.add(tech_user)
    
    db.commit()
    logger.info("Created default users:")
    logger.info("  - admin / admin123")
    logger.info("  - it / it123")
    logger.info("  - tech / tech123")
    logger.info("IMPORTANT: Please change the default passwords after first login!")


def seed_locations(db: Session) -> None:
    """Seed initial locations if none exist."""
    existing = db.query(Location).first()
    if existing:
        logger.info("Locations already exist, skipping seed")
        return

    logger.info("Seeding default locations...")
    
    # Storage locations for IT assets (Rack, Cabinet, Floor)
    locations = [
        Location(name="Rack A", address="Storage Rack A"),
        Location(name="Rack B", address="Storage Rack B"),
        Location(name="Rack C", address="Storage Rack C"),
        Location(name="Rack D", address="Storage Rack D"),
        Location(name="Rack E", address="Storage Rack E"),
        Location(name="Rack F", address="Storage Rack F"),
        Location(name="Lemari Kaca", address="Glass Cabinet"),
        Location(name="Lantai", address="On Floor"),
    ]
    
    for location in locations:
        db.add(location)
    
    db.commit()
    logger.info(f"Seeded {len(locations)} default locations")


def seed_assets(db: Session) -> None:
    """Seed initial assets if none exist."""
    existing = db.query(Asset).first()
    if existing:
        logger.info("Assets already exist, skipping seed")
        return

    logger.info("Seeding default assets...")
    
    # Get category IDs
    hardware_cat = db.query(Category).filter(Category.name == "Hardware").first()
    peripherals_cat = db.query(Category).filter(Category.name == "Peripherals").first()
    
    if not hardware_cat or not peripherals_cat:
        logger.warning("Categories not found, skipping asset seed")
        return
    
    # Get location IDs
    locations = db.query(Location).all()
    if not locations:
        logger.warning("Locations not found, skipping asset seed")
        return
    
    # Sample assets: Thin Client, PC Desktop, IP Phone
    assets = [
        Asset(
            asset_code="TC-001",
            name="Thin Client HP T630",
            type="Thin Client",
            category_id=hardware_cat.id,
            location_id=locations[0].id,
            status=AssetStatus.AVAILABLE,
            assigned_to="Unassigned",
            purchase_date=date(2024, 1, 15),
            last_update=date(2024, 1, 15),
            condition=AssetCondition.GOOD,
            serial_number="SNTC001",
            brand="HP",
            model="T630"
        ),
        Asset(
            asset_code="TC-002",
            name="Thin Client HP T630",
            type="Thin Client",
            category_id=hardware_cat.id,
            location_id=locations[0].id,
            status=AssetStatus.AVAILABLE,
            assigned_to="Unassigned",
            purchase_date=date(2024, 1, 15),
            last_update=date(2024, 1, 15),
            condition=AssetCondition.GOOD,
            serial_number="SNTC002",
            brand="HP",
            model="T630"
        ),
        Asset(
            asset_code="DESK-001",
            name="PC Desktop Dell OptiPlex",
            type="Desktop",
            category_id=hardware_cat.id,
            location_id=locations[1].id,
            status=AssetStatus.IN_USE,
            assigned_to="John Smith",
            purchase_date=date(2023, 6, 1),
            last_update=date(2024, 2, 1),
            condition=AssetCondition.EXCELLENT,
            serial_number="SNDesk001",
            brand="Dell",
            model="OptiPlex 7090"
        ),
        Asset(
            asset_code="DESK-002",
            name="PC Desktop Dell OptiPlex",
            type="Desktop",
            category_id=hardware_cat.id,
            location_id=locations[1].id,
            status=AssetStatus.IN_USE,
            assigned_to="Sarah Johnson",
            purchase_date=date(2023, 6, 1),
            last_update=date(2024, 2, 1),
            condition=AssetCondition.GOOD,
            serial_number="SNDesk002",
            brand="Dell",
            model="OptiPlex 7090"
        ),
        Asset(
            asset_code="DESK-003",
            name="PC Desktop Lenovo ThinkCentre",
            type="Desktop",
            category_id=hardware_cat.id,
            location_id=locations[2].id,
            status=AssetStatus.AVAILABLE,
            assigned_to="Unassigned",
            purchase_date="2023-08-15",
            last_update="2023-08-15",
            condition=AssetCondition.GOOD,
            serial_number="SNDesk003",
            brand="Lenovo",
            model="ThinkCentre M70q"
        ),
        Asset(
            asset_code="IPPH-001",
            name="IP Phone Cisco 8841",
            type="IP Phone",
            category_id=peripherals_cat.id,
            location_id=locations[0].id,
            status=AssetStatus.IN_USE,
            assigned_to="John Smith",
            purchase_date="2023-03-10",
            last_update="2024-01-20",
            condition=AssetCondition.GOOD,
            serial_number="SNIP001",
            brand="Cisco",
            model="8841"
        ),
        Asset(
            asset_code="IPPH-002",
            name="IP Phone Cisco 8841",
            type="IP Phone",
            category_id=peripherals_cat.id,
            location_id=locations[0].id,
            status=AssetStatus.IN_USE,
            assigned_to="Sarah Johnson",
            purchase_date="2023-03-10",
            last_update="2024-01-20",
            condition=AssetCondition.GOOD,
            serial_number="SNIP002",
            brand="Cisco",
            model="8841"
        ),
        Asset(
            asset_code="IPPH-003",
            name="IP Phone Yealink T46S",
            type="IP Phone",
            category_id=peripherals_cat.id,
            location_id=locations[1].id,
            status=AssetStatus.AVAILABLE,
            assigned_to="Unassigned",
            purchase_date="2023-05-20",
            last_update="2023-05-20",
            condition=AssetCondition.EXCELLENT,
            serial_number="SNIP003",
            brand="Yealink",
            model="T46S"
        ),
    ]
    
    for asset in assets:
        db.add(asset)
    
    db.commit()
    logger.info(f"Seeded {len(assets)} default assets")
