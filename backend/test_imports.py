#!/usr/bin/env python3
import sys
import os

# Add the backend directory to the path (use repo-relative path if needed)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Use a lightweight SQLite DB for import checks unless DATABASE_URL already provided
os.environ.setdefault('DATABASE_URL', 'sqlite:///./data/it_asset_test.db')
os.environ.setdefault('APP_ENV', 'development')

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
