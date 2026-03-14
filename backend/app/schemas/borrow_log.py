from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BorrowLogCreate(BaseModel):
    asset_id: int
    user_name: str
    department: str | None = None
    notes: str | None = None


class BorrowLogReturn(BaseModel):
    notes: str | None = None


class BorrowLogRead(BaseModel):
    id: int
    asset_id: int
    user_name: str
    department: str | None
    notes: str | None
    borrowed_at: datetime
    returned_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
