from fastapi import HTTPException
from sqlalchemy import text

from app.db.database import SessionLocal

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check() -> dict[str, str]:
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
        finally:
            db.close()
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"database unavailable: {error}") from error

    return {"status": "healthy"}
