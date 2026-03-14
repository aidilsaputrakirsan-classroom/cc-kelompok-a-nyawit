from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class BorrowLog(Base):
    __tablename__ = "borrow_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    user_name: Mapped[str] = mapped_column(String(150), nullable=False)
    department: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)
    borrowed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    returned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    asset = relationship("Asset", back_populates="borrow_logs")
