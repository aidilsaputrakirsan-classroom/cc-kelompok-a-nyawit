from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.asset import Asset, AssetStatus
from app.models.borrow_log import BorrowLog
from app.schemas.borrow_log import BorrowLogCreate, BorrowLogRead, BorrowLogReturn


router = APIRouter(prefix="/borrow-logs", tags=["Borrow Logs"])


@router.post("", response_model=BorrowLogRead, status_code=status.HTTP_201_CREATED)
def borrow_asset(payload: BorrowLogCreate, db: Session = Depends(get_db)) -> BorrowLog:
    asset = db.get(Asset, payload.asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    if asset.status != AssetStatus.AVAILABLE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset is not available")

    borrow_log = BorrowLog(**payload.model_dump())
    asset.status = AssetStatus.IN_USE

    db.add(borrow_log)
    db.commit()
    db.refresh(borrow_log)
    return borrow_log


@router.post("/{borrow_log_id}/return", response_model=BorrowLogRead)
def return_asset(borrow_log_id: int, payload: BorrowLogReturn, db: Session = Depends(get_db)) -> BorrowLog:
    borrow_log = db.get(BorrowLog, borrow_log_id)
    if not borrow_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Borrow log not found")
    if borrow_log.returned_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset already returned")

    asset = db.get(Asset, borrow_log.asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    borrow_log.returned_at = datetime.now(timezone.utc)
    if payload.notes:
        borrow_log.notes = payload.notes

    asset.status = AssetStatus.AVAILABLE

    db.commit()
    db.refresh(borrow_log)
    return borrow_log


@router.get("", response_model=list[BorrowLogRead])
def list_borrow_logs(db: Session = Depends(get_db)) -> list[BorrowLog]:
    logs = db.scalars(select(BorrowLog).order_by(BorrowLog.borrowed_at.desc())).all()
    return list(logs)


@router.get("/asset/{asset_id}", response_model=list[BorrowLogRead])
def list_borrow_logs_by_asset(asset_id: int, db: Session = Depends(get_db)) -> list[BorrowLog]:
    logs = db.scalars(select(BorrowLog).where(BorrowLog.asset_id == asset_id).order_by(BorrowLog.borrowed_at.desc())).all()
    return list(logs)
