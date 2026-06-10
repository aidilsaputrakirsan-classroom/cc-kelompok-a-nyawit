from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional

from app.models.transaction import TransactionType


class TransactionBase(BaseModel):
    asset_id: int
    from_location_id: Optional[int] = None
    to_location_id: Optional[int] = None
    transaction_type: TransactionType = TransactionType.IN
    quantity: int = Field(default=1, ge=0)
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    id: int
    created_by: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionUpdate(BaseModel):
    from_location_id: Optional[int] = None
    to_location_id: Optional[int] = None
    transaction_type: Optional[TransactionType] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    notes: Optional[str] = Field(default=None, max_length=1000)