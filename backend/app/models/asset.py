import enum
from datetime import date, datetime

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AssetStatus(str, enum.Enum):
    IN_USE = "In Use"
    AVAILABLE = "Available"
    UNDER_MAINTENANCE = "Under Maintenance"
    RETIRED = "Retired"


class AssetCondition(str, enum.Enum):
    EXCELLENT = "Excellent"
    GOOD = "Good"
    FAIR = "Fair"
    POOR = "Poor"


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # Frontend-style asset code (e.g., "HAR-0001")
    asset_code: Mapped[str] = mapped_column(unique=True, index=True)
    # Asset name (e.g., "Laptop 1")
    name: Mapped[str]
    # Asset type (e.g., "Laptop", "Software License")
    type: Mapped[str]
    # Category reference
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    location: Mapped[str]
    status: Mapped[AssetStatus] = mapped_column(default=AssetStatus.AVAILABLE)
    assigned_to: Mapped[str | None] = mapped_column(default=None)
    purchase_date: Mapped[date | None] = mapped_column(default=None)
    last_update: Mapped[date | None] = mapped_column(default=None)
    condition: Mapped[AssetCondition] = mapped_column(default=AssetCondition.GOOD)
    value: Mapped[int] = mapped_column(default=0)
    
    # Additional technical fields
    serial_number: Mapped[str | None] = mapped_column(unique=True, default=None)
    brand: Mapped[str | None] = mapped_column(default=None)
    model: Mapped[str | None] = mapped_column(default=None)
    specs: Mapped[str | None] = mapped_column(default=None)
    ip_address: Mapped[str | None] = mapped_column(default=None)
    mac_address: Mapped[str | None] = mapped_column(default=None)
    
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        default=func.now(), onupdate=func.now()
    )

    category: Mapped["Category"] = relationship("Category", back_populates="assets")


# Add relationship to Category model
from app.models.category import Category

Category.assets = relationship("Asset", back_populates="category")
