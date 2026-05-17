from datetime import date
import uuid
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

    qty = payload.quantity

    # --- IN / ADJUSTMENT IN: asset is coming in (increase quantity) ---
    if tx_type in (TransactionType.IN, TransactionType.ADJUSTMENT_IN):
        asset.quantity += qty
        asset.status = AssetStatus.AVAILABLE
        if payload.to_location_id:
            to_loc = db.get(Location, payload.to_location_id)
            if to_loc:
                asset.location_id = to_loc.id
                asset.location = to_loc.name

    # --- OUT / ADJUSTMENT OUT: asset is going out (decrease quantity) ---
    elif tx_type in (TransactionType.OUT, TransactionType.ADJUSTMENT_OUT):
        if asset.quantity >= qty:
            asset.quantity -= qty
        else:
            raise HTTPException(status_code=400, detail="Kuantitas tidak mencukupi untuk dikeluarkan")
        
        if asset.quantity == 0:
            asset.status = AssetStatus.RETIRED if tx_type == TransactionType.ADJUSTMENT_OUT else AssetStatus.IN_USE
            if payload.to_location_id:
                to_loc = db.get(Location, payload.to_location_id)
                if to_loc:
                    asset.location_id = to_loc.id
                    asset.location = to_loc.name
        else:
            # Jika qty masih ada sisa, dan memindahkan OUT ke lokasi baru, split
            if payload.to_location_id:
                to_loc = db.get(Location, payload.to_location_id)
                if to_loc:
                    existing_sibling = db.scalars(
                        select(Asset).where(
                            Asset.name == asset.name,
                            Asset.category_id == asset.category_id,
                            Asset.location_id == to_loc.id,
                            Asset.status == AssetStatus.IN_USE
                        )
                    ).first()

                    if existing_sibling:
                        existing_sibling.quantity += qty
                    else:
                        new_code = f"{asset.asset_code}-{uuid.uuid4().hex[:4].upper()}"
                        new_asset = Asset(
                            asset_code=new_code,
                            name=asset.name,
                            type=asset.type,
                            category_id=asset.category_id,
                            location_id=to_loc.id,
                            location=to_loc.name,
                            status=AssetStatus.IN_USE,
                            quantity=qty,
                            assigned_to=asset.assigned_to,
                            purchase_date=asset.purchase_date,
                            condition=asset.condition,
                            serial_number=asset.serial_number,
                            brand=asset.brand,
                            model=asset.model,
                            ip_address=asset.ip_address,
                            mac_address=asset.mac_address,
                            created_by=asset.created_by
                        )
                        db.add(new_asset)

    # --- MUTASI: move asset to new location (split logic) ---
    elif tx_type in (TransactionType.MUTASI_IN, TransactionType.MUTASI_OUT):
        if not payload.to_location_id:
            raise HTTPException(status_code=400, detail="Mutasi memerlukan lokasi tujuan")
            
        to_loc = db.get(Location, payload.to_location_id)
        if not to_loc:
            raise HTTPException(status_code=400, detail="Lokasi tujuan tidak ditemukan")

        # Jika pindah SEMUA kuantitas
        if asset.quantity <= qty:
            asset.location_id = to_loc.id
            asset.location = to_loc.name
        else:
            # Pindah SEBAGIAN kuantitas
            asset.quantity -= qty
            
            # Cek apakah sudah ada aset serupa di lokasi tujuan
            existing_sibling = db.scalars(
                select(Asset).where(
                    Asset.name == asset.name,
                    Asset.category_id == asset.category_id,
                    Asset.location_id == to_loc.id
                )
            ).first()

            if existing_sibling:
                existing_sibling.quantity += qty
            else:
                new_code = f"{asset.asset_code}-{uuid.uuid4().hex[:4].upper()}"
                new_asset = Asset(
                    asset_code=new_code,
                    name=asset.name,
                    type=asset.type,
                    category_id=asset.category_id,
                    location_id=to_loc.id,
                    location=to_loc.name,
                    status=asset.status,
                    quantity=qty,
                    assigned_to=asset.assigned_to,
                    purchase_date=asset.purchase_date,
                    condition=asset.condition,
                    serial_number=asset.serial_number,
                    brand=asset.brand,
                    model=asset.model,
                    ip_address=asset.ip_address,
                    mac_address=asset.mac_address,
                    created_by=asset.created_by
                )
                db.add(new_asset)

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