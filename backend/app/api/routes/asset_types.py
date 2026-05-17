from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, require_manager_or_admin
from app.db.database import get_db
from app.models.asset_type import AssetType
from app.models.user import User
from app.schemas.asset_type import AssetTypeCreate, AssetTypeRead, AssetTypeUpdate

router = APIRouter(prefix="/asset-types", tags=["Asset Types"])


@router.get("", response_model=list[AssetTypeRead])
def list_asset_types(
    db: Session = Depends(get_db),
) -> list[AssetType]:
    types = db.scalars(select(AssetType).order_by(AssetType.category, AssetType.name)).all()
    return list(types)


@router.post("", response_model=AssetTypeRead, status_code=status.HTTP_201_CREATED)
def create_asset_type(
    payload: AssetTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> AssetType:
    exists = db.scalar(select(AssetType).where(AssetType.name == payload.name))
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset type already exists")

    asset_type = AssetType(name=payload.name, category=payload.category)
    db.add(asset_type)
    db.commit()
    db.refresh(asset_type)
    return asset_type


@router.put("/{type_id}", response_model=AssetTypeRead)
def update_asset_type(
    type_id: int,
    payload: AssetTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> AssetType:
    asset_type = db.get(AssetType, type_id)
    if not asset_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset type not found")

    if payload.name and payload.name != asset_type.name:
        exists = db.scalar(select(AssetType).where(AssetType.name == payload.name))
        if exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset type name already used")
        asset_type.name = payload.name

    if payload.category is not None:
        asset_type.category = payload.category

    db.commit()
    db.refresh(asset_type)
    return asset_type


@router.delete("/{type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset_type(
    type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> None:
    asset_type = db.get(AssetType, type_id)
    if not asset_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset type not found")

    db.delete(asset_type)
    db.commit()
    return None
