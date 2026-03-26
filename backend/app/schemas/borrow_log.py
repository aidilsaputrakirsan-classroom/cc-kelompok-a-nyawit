from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BorrowLogBase(BaseModel):
    asset_id: int
    user_name: str
    department: str | None = None
    notes: str | None = None


class BorrowLogCreate(BorrowLogBase):
    pass


class BorrowLogReturn(BaseModel):
    notes: str | None = None


class BorrowLogRead(BorrowLogBase):
    id: int
    borrowed_at: datetime
    returned_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
