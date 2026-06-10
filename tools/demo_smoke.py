#!/usr/bin/env python3
"""Simple smoke demo script to exercise core flows against a running API.

Usage:
  py -3 tools\demo_smoke.py --api http://localhost:8000/api/v1

It will register a demo user (if not exists), login, create an asset, list assets,
and delete the created asset. Use only for local/demo purposes.
"""
import argparse
import sys
import time

import httpx


def run(api_base: str):
    client = httpx.Client(base_url=api_base, timeout=10.0)

    demo_email = "demo+smoke@example.com"
    demo_username = "demo_smoke"
    demo_password = "DemoPass123"

    print("1) Registering demo user (may fail if user exists)")
    try:
        r = client.post("/auth/register", json={
            "username": demo_username,
            "email": demo_email,
            "password": demo_password,
            "full_name": "Demo Smoke",
        })
        print("  register ->", r.status_code)
    except Exception as e:
        print("  register error", e)

    print("2) Logging in")
    r = client.post("/auth/login", json={"username": demo_username, "password": demo_password})
    if r.status_code != 200:
        print("  Login failed", r.status_code, r.text)
        sys.exit(2)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("3) Creating an asset")
    asset_payload = {
        "asset_code": "SMOKE-001",
        "name": "Smoke Asset",
        "type": "laptop",
        "category_id": 1,
        "quantity": 1,
    }
    r = client.post("/assets", json=asset_payload, headers=headers)
    print("  create asset ->", r.status_code)
    if r.status_code == 201:
        created = r.json()
        asset_id = created.get("id")
        print("  created id", asset_id)
    else:
        print("  create response:", r.text)
        asset_id = None

    print("4) Listing assets")
    r = client.get("/assets", headers=headers)
    print("  list ->", r.status_code)

    if asset_id:
        print("5) Deleting created asset (cleanup)")
        r = client.delete(f"/assets/{asset_id}", headers=headers)
        print("  delete ->", r.status_code)

    print("Demo finished")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--api", default="http://localhost:8000/api/v1", help="API base URL")
    args = p.parse_args()
    run(args.api)
