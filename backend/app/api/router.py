from fastapi import APIRouter

from app.api.routes import assets, borrow_logs, categories, health


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(categories.router)
api_router.include_router(assets.router)
api_router.include_router(borrow_logs.router)
