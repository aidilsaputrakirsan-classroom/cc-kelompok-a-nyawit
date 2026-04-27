from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db, require_manager_or_admin
from app.models.transaction import Transaction
from app.models.asset import Asset
from app.models.location import Location
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionRead, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["Transactions"])


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