from fastapi import APIRouter

from app.api.routes import assets, auth, borrow_logs, categories, conditions, health, locations, users


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(categories.router)
api_router.include_router(locations.router)
api_router.include_router(assets.router)
api_router.include_router(borrow_logs.router)
api_router.include_router(users.router)
api_router.include_router(conditions.router)
