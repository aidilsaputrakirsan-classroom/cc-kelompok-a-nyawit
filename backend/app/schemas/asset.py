from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.asset import AssetStatus, AssetCondition


class AssetBase(BaseModel):
    asset_code: str
    name: str
    type: str
    category_id: int
    location: str
    status: AssetStatus = AssetStatus.AVAILABLE
    assigned_to: str | None = None
    purchase_date: date | None = None
    last_update: date | None = None
    condition: AssetCondition = AssetCondition.GOOD
    value: int = 0
    serial_number: str | None = None
    brand: str | None = None
    model: str | None = None
    specs: str | None = None
    ip_address: str | None = None
    mac_address: str | None = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_code: str | None = None
    name: str | None = None
    type: str | None = None
    category_id: int | None = None
    location: str | None = None
    status: AssetStatus | None = None
    assigned_to: str | None = None
    purchase_date: date | None = None
    last_update: date | None = None
    condition: AssetCondition | None = None
    value: int | None = None
    serial_number: str | None = None
    brand: str | None = None
    model: str | None = None
    specs: str | None = None
    ip_address: str | None = None
    mac_address: str | None = None


class CategoryBrief(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class AssetRead(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: CategoryBrief | None = None

    model_config = ConfigDict(from_attributes=True)
