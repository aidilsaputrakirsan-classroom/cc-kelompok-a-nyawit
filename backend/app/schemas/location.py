from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LocationBase(BaseModel):
    name: str
    address: str | None = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: str | None = None
    address: str | None = None


class LocationRead(LocationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    asset_count: int = 0

    model_config = ConfigDict(from_attributes=True)
