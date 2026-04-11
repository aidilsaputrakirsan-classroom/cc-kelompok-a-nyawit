from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, require_manager_or_admin
from app.db.database import get_db
from app.models.asset import Asset, AssetStatus
from app.models.category import Category
from app.models.user import User
from app.schemas.asset import AssetCreate, AssetRead, AssetUpdate

router = APIRouter(prefix="/assets", tags=["Assets"])


def _validate_relations(db: Session, category_id: int, location_id: int | None = None) -> None:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")
    
    if location_id is not None:
        from app.models.location import Location
        location = db.get(Location, location_id)
        if not location:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Location not found")


@router.post("", response_model=AssetRead, status_code=status.HTTP_201_CREATED)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> Asset:
    _validate_relations(db, payload.category_id, payload.location_id)

    code_exists = db.scalar(select(Asset).where(Asset.asset_code == payload.asset_code))
    if code_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset code already exists")

    if payload.serial_number:
        serial_exists = db.scalar(select(Asset).where(Asset.serial_number == payload.serial_number))
        if serial_exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Serial number already exists")

    asset_data = payload.model_dump()
    asset_data["created_by"] = current_user.id
    
    # If location_id is provided, get location name from database
    if payload.location_id:
        from app.models.location import Location
        location = db.get(Location, payload.location_id)
        if location:
            asset_data["location"] = location.name
    
    asset = Asset(**asset_data)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.get("", response_model=list[AssetRead])
def list_assets(
    status_filter: AssetStatus | None = Query(default=None, alias="status"),
    category_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[Asset]:
    from sqlalchemy.orm import joinedload
    stmt = select(Asset).options(
        joinedload(Asset.category),
        joinedload(Asset.location_ref)
    ).order_by(Asset.created_at.desc())
    if status_filter:
        stmt = stmt.where(Asset.status == status_filter)
    if category_id:
        stmt = stmt.where(Asset.category_id == category_id)

    assets = db.scalars(stmt).all()
    return list(assets)


@router.get("/{asset_id}", response_model=AssetRead)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Asset:
    from sqlalchemy.orm import joinedload
    stmt = select(Asset).options(
        joinedload(Asset.category),
        joinedload(Asset.location_ref)
    ).where(Asset.id == asset_id)
    asset = db.scalar(stmt)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset


@router.put("/{asset_id}", response_model=AssetRead)
def update_asset(
    asset_id: int,
    payload: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> Asset:
    from sqlalchemy.orm import joinedload
    stmt = select(Asset).options(
        joinedload(Asset.category),
        joinedload(Asset.location_ref)
    ).where(Asset.id == asset_id)
    asset = db.scalar(stmt)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "category_id" in update_data and update_data["category_id"] is not None:
        _validate_relations(db, update_data["category_id"], update_data.get("location_id"))

    if "serial_number" in update_data and update_data["serial_number"]:
        serial_exists = db.scalar(
            select(Asset).where(
                Asset.serial_number == update_data["serial_number"],
                Asset.id != asset_id,
            )
        )
        if serial_exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Serial number already exists")

    # If location_id is provided, get location name from database
    if "location_id" in update_data and update_data["location_id"]:
        from app.models.location import Location
        location = db.get(Location, update_data["location_id"])
        if location:
            update_data["location"] = location.name

    for key, value in update_data.items():
        setattr(asset, key, value)

    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> None:
    from sqlalchemy.orm import joinedload
    stmt = select(Asset).options(
        joinedload(Asset.category),
        joinedload(Asset.location_ref)
    ).where(Asset.id == asset_id)
    asset = db.scalar(stmt)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    db.delete(asset)
    db.commit()
    return None
