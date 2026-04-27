import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TransactionType(str, enum.Enum):
    ADJUSTMENT_OUT = "adjustment out"
    ADJUSTMENT_IN = "adjustment in"
    MUTASI_IN = "mutasi in"
    MUTASI_OUT = "mutasi out"
    IN = "in"
    OUT = "out"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"))
    from_location_id: Mapped[Optional[int]] = mapped_column(ForeignKey("locations.id"))
    to_location_id: Mapped[Optional[int]] = mapped_column(ForeignKey("locations.id"))
    transaction_type: Mapped[TransactionType] = mapped_column(default=TransactionType.IN)
    quantity: Mapped[int] = mapped_column(default=1)
    notes: Mapped[Optional[str]] = mapped_column(default=None)
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    asset: Mapped["Asset"] = relationship("Asset")
    from_location: Mapped[Optional["Location"]] = relationship("Location", foreign_keys=[from_location_id])
    to_location: Mapped[Optional["Location"]] = relationship("Location", foreign_keys=[to_location_id])
    creator: Mapped[Optional["User"]] = relationship("User")