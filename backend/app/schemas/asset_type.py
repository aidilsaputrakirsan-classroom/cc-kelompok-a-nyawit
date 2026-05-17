from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AssetTypeBase(BaseModel):
    name: str
    category: str


class AssetTypeCreate(AssetTypeBase):
    pass


class AssetTypeUpdate(BaseModel):
    name: str | None = None
    category: str | None = None


class AssetTypeRead(AssetTypeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
