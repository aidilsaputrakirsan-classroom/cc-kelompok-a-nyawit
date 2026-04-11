import enum
from datetime import date, datetime

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


# Forward reference for User and Location
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User
    from app.models.location import Location


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
    # Location reference
    location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), default=None)
    # Legacy location field (for backward compatibility)
    location: Mapped[str | None] = mapped_column(default=None)
    status: Mapped[AssetStatus] = mapped_column(default=AssetStatus.AVAILABLE)
    assigned_to: Mapped[str | None] = mapped_column(default=None)
    purchase_date: Mapped[date | None] = mapped_column(default=None)
    last_update: Mapped[date | None] = mapped_column(default=None)
    condition: Mapped[AssetCondition] = mapped_column(default=AssetCondition.GOOD)
    
    # Additional technical fields
    serial_number: Mapped[str | None] = mapped_column(unique=True, default=None)
    brand: Mapped[str | None] = mapped_column(default=None)
    model: Mapped[str | None] = mapped_column(default=None)
    ip_address: Mapped[str | None] = mapped_column(default=None)
    mac_address: Mapped[str | None] = mapped_column(default=None)
    
    # Track who created this asset
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), default=None)
    
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        default=func.now(), onupdate=func.now()
    )

    category: Mapped["Category"] = relationship("Category", back_populates="assets")
    creator: Mapped["User | None"] = relationship("User", back_populates="created_assets")
    location_ref: Mapped["Location | None"] = relationship("Location", back_populates="assets")


# Add relationship to Category model
from app.models.category import Category

Category.assets = relationship("Asset", back_populates="category")

# Add relationship to Location model
from app.models.location import Location

Location.assets = relationship("Asset", back_populates="location_ref")
