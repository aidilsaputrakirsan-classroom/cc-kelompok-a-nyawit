from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.asset import AssetStatus, AssetCondition


class AssetBase(BaseModel):
    asset_code: str
    name: str = Field(max_length=200)
    type: str
    category_id: int
    location: str | None = None
    location_id: int | None = None
    status: AssetStatus = AssetStatus.AVAILABLE
    quantity: int = Field(default=1, ge=0)
    assigned_to: str | None = None
    purchase_date: date | None = None
    last_update: date | None = None
    condition: AssetCondition = AssetCondition.GOOD
    serial_number: str | None = None
    brand: str | None = None
    model: str | None = None
    ip_address: str | None = None
    mac_address: str | None = None
    created_by: int | None = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_code: str | None = None
    name: str | None = Field(default=None, max_length=200)
    type: str | None = None
    category_id: int | None = None
    location: str | None = None
    location_id: int | None = None
    status: AssetStatus | None = None
    quantity: int | None = Field(default=None, ge=0)
    assigned_to: str | None = None
    purchase_date: date | None = None
    last_update: date | None = None
    condition: AssetCondition | None = None
    serial_number: str | None = None
    brand: str | None = None
    model: str | None = None
    ip_address: str | None = None
    mac_address: str | None = None
    created_by: int | None = None


class CategoryBrief(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class LocationBrief(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class AssetRead(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: CategoryBrief | None = None
    location_ref: LocationBrief | None = None

    model_config = ConfigDict(from_attributes=True, extra='ignore')
