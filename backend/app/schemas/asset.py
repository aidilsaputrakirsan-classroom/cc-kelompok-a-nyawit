"""Pydantic schemas for asset management with strict input validation."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.asset import AssetCondition, AssetStatus


class AssetBase(BaseModel):
    asset_code: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., min_length=1, max_length=100)
    category_id: int = Field(..., ge=1)
    location: str | None = Field(default=None, max_length=200)
    location_id: int | None = Field(default=None, ge=1)
    status: AssetStatus = AssetStatus.AVAILABLE
    quantity: int = Field(default=1, ge=0, le=999_999)
    assigned_to: str | None = Field(default=None, max_length=200)
    purchase_date: date | None = None
    last_update: date | None = None
    condition: AssetCondition = AssetCondition.GOOD
    serial_number: str | None = Field(default=None, max_length=200)
    brand: str | None = Field(default=None, max_length=100)
    model: str | None = Field(default=None, max_length=100)
    ip_address: str | None = Field(default=None, max_length=45)
    mac_address: str | None = Field(default=None, max_length=17)
    created_by: int | None = None

    @field_validator("asset_code", "name", "type")
    @classmethod
    def strip_and_validate_required_string(cls, value: str) -> str:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise ValueError("Field ini tidak boleh kosong")
        return value

    @field_validator("location", "assigned_to", "serial_number", "brand", "model")
    @classmethod
    def strip_optional_strings(cls, value: str | None) -> str | None:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return None
        return value


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_code: str | None = Field(default=None, min_length=1, max_length=100)
    name: str | None = Field(default=None, min_length=1, max_length=200)
    type: str | None = Field(default=None, min_length=1, max_length=100)
    category_id: int | None = Field(default=None, ge=1)
    location: str | None = Field(default=None, max_length=200)
    location_id: int | None = Field(default=None, ge=1)
    status: AssetStatus | None = None
    quantity: int | None = Field(default=None, ge=0, le=999_999)
    assigned_to: str | None = Field(default=None, max_length=200)
    purchase_date: date | None = None
    last_update: date | None = None
    condition: AssetCondition | None = None
    serial_number: str | None = Field(default=None, max_length=200)
    brand: str | None = Field(default=None, max_length=100)
    model: str | None = Field(default=None, max_length=100)
    ip_address: str | None = Field(default=None, max_length=45)
    mac_address: str | None = Field(default=None, max_length=17)
    created_by: int | None = None

    @field_validator("asset_code", "name", "type")
    @classmethod
    def strip_and_validate_optional_string(cls, value: str | None) -> str | None:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise ValueError("Field ini tidak boleh kosong")
        return value

    @field_validator("location", "assigned_to", "serial_number", "brand", "model")
    @classmethod
    def strip_optional_strings(cls, value: str | None) -> str | None:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return None
        return value


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
