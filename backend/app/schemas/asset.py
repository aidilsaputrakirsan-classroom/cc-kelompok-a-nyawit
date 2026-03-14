from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.asset import AssetStatus


class AssetBase(BaseModel):
    asset_code: str
    serial_number: str | None = None
    brand: str
    model: str
    specs: str | None = None
    ip_address: str | None = None
    mac_address: str | None = None
    purchase_date: date | None = None
    location: str | None = None
    status: AssetStatus = AssetStatus.AVAILABLE
    category_id: int


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    serial_number: str | None = None
    brand: str | None = None
    model: str | None = None
    specs: str | None = None
    ip_address: str | None = None
    mac_address: str | None = None
    purchase_date: date | None = None
    location: str | None = None
    status: AssetStatus | None = None
    category_id: int | None = None


class AssetRead(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
