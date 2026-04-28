from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.user import UserRole


class UserBase(BaseModel):
    username: str
    email: str
    full_name: str | None = None
    role: UserRole = UserRole.USER
    is_active: bool = True

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Simple email validation that allows internal domains like .local"""
        if '@' not in v:
            raise ValueError('Invalid email address')
        parts = v.split('@')
        if len(parts) != 2 or not parts[0] or not parts[1]:
            raise ValueError('Invalid email address')
        return v.lower()


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str | None) -> str | None:
        """Simple email validation that allows internal domains like .local"""
        if v is None:
            return v
        if '@' not in v:
            raise ValueError('Invalid email address')
        parts = v.split('@')
        if len(parts) != 2 or not parts[0] or not parts[1]:
            raise ValueError('Invalid email address')
        return v.lower()


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
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class TokenPayload(BaseModel):
    sub: str | None = None
    role: str | None = None
