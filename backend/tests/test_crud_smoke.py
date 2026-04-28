from fastapi.testclient import TestClient


def _login_as_admin(client: TestClient) -> str:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "adminsmoke",
            "email": "adminsmoke@example.com",
            "password": "password123",
            "full_name": "Admin Smoke",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/v1/auth/login",
        json={"username": "adminsmoke", "password": "password123"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    assert token
    return token


def test_login_and_core_crud_flow(client: TestClient) -> None:
    token = _login_as_admin(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Category CRUD
    create_category = client.post(
        "/api/v1/categories",
        headers=headers,
        json={"name": "Smoke Category", "description": "for smoke test"},
    )
    assert create_category.status_code == 201
    category_id = create_category.json()["id"]

    list_categories = client.get("/api/v1/categories")
    assert list_categories.status_code == 200
    assert any(category["id"] == category_id for category in list_categories.json())

    update_category = client.put(
        f"/api/v1/categories/{category_id}",
        headers=headers,
        json={"name": "Smoke Category Updated"},
    )
    assert update_category.status_code == 200
    assert update_category.json()["name"] == "Smoke Category Updated"

    # Location CRUD
    create_location = client.post(
        "/api/v1/locations",
        headers=headers,
        json={"name": "Smoke Location", "address": "Lab A"},
    )
    assert create_location.status_code == 201
    location_id = create_location.json()["id"]

    get_location = client.get(f"/api/v1/locations/{location_id}")
    assert get_location.status_code == 200

    update_location = client.put(
        f"/api/v1/locations/{location_id}",
        headers=headers,
        json={"address": "Lab A Updated"},
    )
    assert update_location.status_code == 200
    assert update_location.json()["address"] == "Lab A Updated"

    # Asset CRUD
    create_asset = client.post(
        "/api/v1/assets",
        headers=headers,
        json={
            "asset_code": "SMK-001",
            "name": "Smoke Asset",
            "type": "Laptop",
            "category_id": category_id,
            "location_id": location_id,
            "status": "Available",
            "condition": "Good",
        },
    )
    assert create_asset.status_code == 201
    asset_id = create_asset.json()["id"]

    get_asset = client.get(f"/api/v1/assets/{asset_id}")
    assert get_asset.status_code == 200

    update_asset = client.put(
        f"/api/v1/assets/{asset_id}",
        headers=headers,
        json={"name": "Smoke Asset Updated"},
    )
    assert update_asset.status_code == 200
    assert update_asset.json()["name"] == "Smoke Asset Updated"

    # Transaction CRUD
    create_transaction = client.post(
        "/api/v1/transactions",
        headers=headers,
        json={
            "asset_id": asset_id,
            "from_location_id": location_id,
            "to_location_id": location_id,
            "transaction_type": "in",
            "quantity": 1,
            "notes": "created from smoke test",
        },
    )
    assert create_transaction.status_code == 201
    transaction_id = create_transaction.json()["id"]

    list_transactions = client.get("/api/v1/transactions", headers=headers)
    assert list_transactions.status_code == 200
    assert any(tx["id"] == transaction_id for tx in list_transactions.json())

    update_transaction = client.put(
        f"/api/v1/transactions/{transaction_id}",
        headers=headers,
        json={"notes": "updated by smoke test"},
    )
    assert update_transaction.status_code == 200
    assert update_transaction.json()["notes"] == "updated by smoke test"

    delete_transaction = client.delete(f"/api/v1/transactions/{transaction_id}", headers=headers)
    assert delete_transaction.status_code == 204

    delete_asset = client.delete(f"/api/v1/assets/{asset_id}", headers=headers)
    assert delete_asset.status_code == 204

    delete_location = client.delete(f"/api/v1/locations/{location_id}", headers=headers)
    assert delete_location.status_code == 204

    delete_category = client.delete(f"/api/v1/categories/{category_id}", headers=headers)
    assert delete_category.status_code == 204
