from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db, require_manager_or_admin
from app.models.transaction import Transaction, TransactionType
from app.models.asset import Asset, AssetStatus
from app.models.location import Location
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionRead, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def _apply_transaction_side_effects(
    db: Session,
    asset: Asset,
    payload: TransactionCreate,
) -> None:
    """Apply side-effects to the asset based on the transaction type.

    This ensures that transaction data is reflected in the main asset record,
    making it visible on the Dashboard, Asset Management, and other pages.
    """
    tx_type = payload.transaction_type
    today = date.today()

    # --- Mutasi: move asset to new location ---
    if tx_type in (TransactionType.MUTASI_IN, TransactionType.MUTASI_OUT):
        if payload.to_location_id:
            to_loc = db.get(Location, payload.to_location_id)
            if to_loc:
                asset.location_id = to_loc.id
                asset.location = to_loc.name

    # --- In: asset is coming in (available at destination) ---
    elif tx_type == TransactionType.IN:
        asset.status = AssetStatus.AVAILABLE
        if payload.to_location_id:
            to_loc = db.get(Location, payload.to_location_id)
            if to_loc:
                asset.location_id = to_loc.id
                asset.location = to_loc.name

    # --- Out: asset is going out (in use) ---
    elif tx_type == TransactionType.OUT:
        asset.status = AssetStatus.IN_USE
        if payload.to_location_id:
            to_loc = db.get(Location, payload.to_location_id)
            if to_loc:
                asset.location_id = to_loc.id
                asset.location = to_loc.name

    # --- Adjustment In: asset restored / returned to available ---
    elif tx_type == TransactionType.ADJUSTMENT_IN:
        asset.status = AssetStatus.AVAILABLE

    # --- Adjustment Out: asset retired / removed ---
    elif tx_type == TransactionType.ADJUSTMENT_OUT:
        asset.status = AssetStatus.RETIRED

    # Always update last_update timestamp
    asset.last_update = today


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> Transaction:
    # Validate asset exists
    asset = db.get(Asset, payload.asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset not found")

    # Validate locations if provided
    if payload.from_location_id:
        from_loc = db.get(Location, payload.from_location_id)
        if not from_loc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="From location not found")

    if payload.to_location_id:
        to_loc = db.get(Location, payload.to_location_id)
        if not to_loc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="To location not found")

    # Apply side-effects: update the asset based on transaction type
    _apply_transaction_side_effects(db, asset, payload)

    transaction = Transaction(
        **payload.model_dump(),
        created_by=current_user.id
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[Transaction]:
    transactions = db.scalars(select(Transaction).order_by(Transaction.created_at.desc())).all()
    return list(transactions)


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Transaction:
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction


@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
) -> Transaction:
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Validate locations if updating
    if "from_location_id" in update_data and update_data["from_location_id"]:
        from_loc = db.get(Location, update_data["from_location_id"])
        if not from_loc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="From location not found")

    if "to_location_id" in update_data and update_data["to_location_id"]:
        to_loc = db.get(Location, update_data["to_location_id"])
        if not to_loc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="To location not found")

    for key, value in update_data.items():
        setattr(transaction, key, value)

    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    db.delete(transaction)
    db.commit()