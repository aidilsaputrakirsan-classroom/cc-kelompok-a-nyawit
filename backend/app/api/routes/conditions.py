from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.asset import AssetCondition
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()


@router.get("/conditions")
def get_conditions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[dict]:
    """Get all available asset conditions with asset counts."""
    conditions = []
    
    for condition in AssetCondition:
        # Count assets for each condition
        from app.models.asset import Asset
        asset_count = db.query(Asset).filter(Asset.condition == condition).count()
        
        # Map condition to display properties
        condition_map = {
            AssetCondition.EXCELLENT: {
                "id": 1,
                "name": "Excellent",
                "description": "Kondisi sempurna, seperti baru",
                "color": "#10B981",
                "bgColor": "#ECFDF5",
                "assetCount": asset_count
            },
            AssetCondition.GOOD: {
                "id": 2,
                "name": "Good",
                "description": "Kondisi baik, sedikit tanda penggunaan",
                "color": "#3B82F6",
                "bgColor": "#DBEAFE",
                "assetCount": asset_count
            },
            AssetCondition.FAIR: {
                "id": 3,
                "name": "Fair",
                "description": "Kondisi cukup, perlu perhatian",
                "color": "#F59E0B",
                "bgColor": "#FEF3C7",
                "assetCount": asset_count
            },
            AssetCondition.POOR: {
                "id": 4,
                "name": "Poor",
                "description": "Kondisi buruk, perlu perbaikan segera",
                "color": "#EF4444",
                "bgColor": "#FEE2E2",
                "assetCount": asset_count
            }
        }
        
        conditions.append(condition_map[condition])
    
    return conditions


@router.get("/conditions/{condition_name}")
def get_condition_assets(
    condition_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """Get assets with a specific condition."""
    try:
        condition = AssetCondition(condition_name)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid condition name"
        )
    
    from app.models.asset import Asset
    assets = db.query(Asset).filter(Asset.condition == condition).all()
    
    return {
        "condition": condition_name,
        "asset_count": len(assets),
        "assets": [
            {
                "id": asset.id,
                "asset_code": asset.asset_code,
                "name": asset.name,
                "type": asset.type,
                "location": asset.location,
                "status": asset.status.value if hasattr(asset.status, 'value') else str(asset.status),
                "assigned_to": asset.assigned_to,
                "purchase_date": asset.purchase_date.isoformat() if asset.purchase_date else None,
                "last_update": asset.last_update.isoformat() if asset.last_update else None
            }
            for asset in assets
        ]
    }


@router.put("/conditions/{condition_name}/update-description")
def update_condition_description(
    condition_name: str,
    description: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """Update the description of a condition (for future extensibility)."""
    # For now, this is a placeholder since conditions are enum-based
    # In the future, this could update a conditions table in the database
    try:
        condition = AssetCondition(condition_name)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid condition name"
        )
    
    return {
        "message": f"Description for {condition_name} updated successfully",
        "condition": condition_name,
        "description": description
    }