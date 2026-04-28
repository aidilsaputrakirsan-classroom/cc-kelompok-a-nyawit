from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_manager_or_admin
from app.models.location import Location
from app.models.asset import Asset
from app.models.user import User
from app.schemas.location import LocationCreate, LocationRead, LocationUpdate

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("", response_model=list[LocationRead])
def list_locations(
    db: Session = Depends(get_db),
) -> list[dict]:
    """List all locations with asset count."""
    locations = db.scalars(select(Location).order_by(Location.name)).all()
    
    result = []
    for loc in locations:
        # Count assets at this location using direct query
        asset_count = db.scalar(
            select(func.count(Asset.id))
            .where(Asset.location_id == loc.id)
        ) or 0
        
        result.append({
            "id": loc.id,
            "name": loc.name,
            "address": loc.address,
            "created_at": loc.created_at,
            "updated_at": loc.updated_at,
            "asset_count": asset_count
        })
    
    return result


@router.get("/{location_id}", response_model=LocationRead)
def get_location(
    location_id: int,
    db: Session = Depends(get_db),
) -> dict:
    """Get a specific location by ID with asset count."""
    location = db.get(Location, location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )
    
    # Count assets at this location using direct query
    asset_count = db.scalar(
        select(func.count(Asset.id))
        .where(Asset.location_id == location_id)
    ) or 0
    
    return {
        "id": location.id,
        "name": location.name,
        "address": location.address,
        "created_at": location.created_at,
        "updated_at": location.updated_at,
        "asset_count": asset_count
    }


@router.post("", response_model=LocationRead, status_code=status.HTTP_201_CREATED)
def create_location(
    payload: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> Location:
    """Create a new location (admin only)."""
    # Check if name already exists
    existing = db.scalar(select(Location).where(Location.name == payload.name))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location name already exists",
        )
    
    location = Location(
        name=payload.name,
        address=payload.address,
    )
    
    db.add(location)
    db.commit()
    db.refresh(location)
    
    return {
        "id": location.id,
        "name": location.name,
        "address": location.address,
        "created_at": location.created_at,
        "updated_at": location.updated_at,
        "asset_count": 0
    }


@router.put("/{location_id}", response_model=LocationRead)
def update_location(
    location_id: int,
    payload: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> dict:
    """Update a location (admin only)."""
    location = db.get(Location, location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )
    
    update_data = payload.model_dump(exclude_unset=True)
    
    # Check name uniqueness if being updated
    if "name" in update_data and update_data["name"] and update_data["name"] != location.name:
        existing = db.scalar(select(Location).where(Location.name == update_data["name"]))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Location name already exists",
            )
        location.name = update_data["name"]
    
    if "address" in update_data:
        location.address = update_data["address"]
    
    db.commit()
    db.refresh(location)
    
    # Count assets at this location using direct query
    asset_count = db.scalar(
        select(func.count(Asset.id))
        .where(Asset.location_id == location_id)
    ) or 0
    
    return {
        "id": location.id,
        "name": location.name,
        "address": location.address,
        "created_at": location.created_at,
        "updated_at": location.updated_at,
        "asset_count": asset_count
    }


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> None:
    """Delete a location (admin only)."""
    location = db.get(Location, location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )
    
    # Check if location has assets using direct query
    asset_count = db.scalar(
        select(func.count(Asset.id))
        .where(Asset.location_id == location_id)
    ) or 0
    
    if asset_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete location with {asset_count} assets. Move assets first.",
        )
    
    db.delete(location)
    db.commit()
    return None
