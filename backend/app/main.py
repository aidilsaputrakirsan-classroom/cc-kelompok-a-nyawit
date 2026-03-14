from fastapi import FastAPI

from app.api.router import api_router


app = FastAPI(
    title="IT Asset Management API",
    description="Backend API untuk Sistem Manajemen Aset IT",
    version="1.0.0",
)

app.include_router(api_router)


@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {"message": "IT Asset Management API is running"}
