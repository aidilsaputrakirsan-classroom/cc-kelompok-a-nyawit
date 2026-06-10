"""Seed only user/login data (admin, it, tech).

Run from backend directory:
  py -3 seed_users.py

Or inside the running backend container:
  docker compose exec it_asset_backend python /app/seed_users.py
"""

from app.db.init_db import init_db, seed_admin_user
from app.db.database import SessionLocal


def run_user_seeds() -> None:
    print("Initializing DB (tables) and seeding users...")
    init_db()
    db = SessionLocal()
    try:
        seed_admin_user(db)
    finally:
        db.close()


if __name__ == "__main__":
    run_user_seeds()
    print("User seeding complete")
