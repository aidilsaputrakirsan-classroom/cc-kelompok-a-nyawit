#!/usr/bin/env python3
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, 'd:\\Ilham\\cc-kelompok-a-nyawit\\backend')

# Set a test DATABASE_URL that doesn't require actual database connection for initial import testing
os.environ['DATABASE_URL'] = 'postgresql+psycopg://postgres:postgres@postgres:5432/it_asset_db'
os.environ['APP_ENV'] = 'development'

try:
    print("Attempting to import FastAPI app...")
    from app.main import app
    print("✓ Successfully imported FastAPI app")
    
    print("Checking routes...")
    for route in app.routes:
        print(f"  - {route.path}")
    
    print("\n✓ App structure is valid")
    sys.exit(0)
    
except Exception as e:
    print(f"✗ Error loading app: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
