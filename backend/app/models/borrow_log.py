from datetime import datetime

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class BorrowLog(Base):
    __tablename__ = "borrow_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"))
    user_name: Mapped[str]
    department: Mapped[str | None] = mapped_column(default=None)
    notes: Mapped[str | None] = mapped_column(default=None)
    borrowed_at: Mapped[datetime] = mapped_column(default=func.now())
    returned_at: Mapped[datetime | None] = mapped_column(default=None)

    asset: Mapped["Asset"] = relationship("Asset", back_populates="borrow_logs")


# Add relationship to Asset model
from app.models.asset import Asset

Asset.borrow_logs = relationship("BorrowLog", back_populates="asset")
