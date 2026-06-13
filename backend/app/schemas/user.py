"""Pydantic schemas for user authentication and management with strict validation."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str | None = Field(default=None, max_length=200)
    role: UserRole = UserRole.USER
    is_active: bool = True

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Username tidak boleh kosong")
        return value


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not any(char.isupper() for char in value):
            raise ValueError("Password harus mengandung minimal 1 huruf besar")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password harus mengandung minimal 1 angka")
        return value


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, max_length=200)
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not any(char.isupper() for char in value):
            raise ValueError("Password harus mengandung minimal 1 huruf besar")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password harus mengandung minimal 1 angka")
        return value


class AssetBrief(BaseModel):
    id: int
    asset_code: str
    name: str
    type: str
    location: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserReadWithAssets(UserRead):
    created_assets: list[AssetBrief]
    asset_count: int


class UserLogin(BaseModel):
    username: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class TokenPayload(BaseModel):
    sub: str | None = None
    role: str | None = None
