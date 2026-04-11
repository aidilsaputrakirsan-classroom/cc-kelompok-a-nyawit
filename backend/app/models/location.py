from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    address: Mapped[str | None] = mapped_column(default=None)
    
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        default=func.now(), onupdate=func.now()
    )

    # Relationship to assets at this location
    assets: Mapped[list["Asset"]] = relationship("Asset", back_populates="location_ref")


# Import Asset for relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.asset import Asset
