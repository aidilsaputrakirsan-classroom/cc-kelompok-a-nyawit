"""Manual seeder script for local use.

Run from the `backend` directory:

  py -3 seed_local.py

Or run inside the running backend container:

  docker compose exec it_asset_backend python /app/seed_local.py

This script calls the same seed functions used by the app, but only when
invoked explicitly (it does not affect automatic startup behavior).
"""

from app.db.init_db import init_db, seed_categories, seed_asset_types, seed_locations, seed_admin_user
from app.db.database import SessionLocal


def run_seeds() -> None:
    print("Initializing DB and running seeds...")
    init_db()
    db = SessionLocal()
    try:
        seed_categories(db)
        seed_asset_types(db)
        seed_locations(db)
        seed_admin_user(db)
    finally:
        db.close()


if __name__ == "__main__":
    run_seeds()
    print("Seeding complete")
