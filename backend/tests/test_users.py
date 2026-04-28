from app.core.security import get_password_hash
from app.models.user import User, UserRole


def get_token(client, username, password):
    """Helper to get auth token."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    return response.json()["access_token"]


def test_list_users_as_admin(client, db_session):
    """Test listing users as admin."""
    # Create admin
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    
    # Create regular user
    user = User(
        username="user",
        email="user@example.com",
        hashed_password=get_password_hash("user123"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    token = get_token(client, "admin", "admin123")
    
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_list_users_as_user_forbidden(client, db_session):
    """Test that regular users cannot list all users."""
    # Create user
    user = User(
        username="user",
        email="user@example.com",
        hashed_password=get_password_hash("user123"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    token = get_token(client, "user", "user123")
    
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_create_user_as_admin(client, db_session):
    """Test creating a user as admin."""
    # Create admin
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()

    token = get_token(client, "admin", "admin123")
    
    response = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "newpass123",
            "full_name": "New User",
            "role": "manager",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["role"] == "manager"


def test_update_user_as_admin(client, db_session):
    """Test updating a user as admin."""
    # Create admin
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    
    # Create user to update
    user = User(
        username="toupdate",
        email="toupdate@example.com",
        hashed_password=get_password_hash("pass123"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    
    user_id = user.id

    token = get_token(client, "admin", "admin123")
    
    response = client.put(
        f"/api/v1/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "full_name": "Updated Name",
            "role": "manager",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["role"] == "manager"


def test_delete_user_as_admin(client, db_session):
    """Test deleting a user as admin."""
    # Create admin
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    
    # Create user to delete
    user = User(
        username="todelete",
        email="todelete@example.com",
        hashed_password=get_password_hash("pass123"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    
    user_id = user.id

    token = get_token(client, "admin", "admin123")
    
    response = client.delete(
        f"/api/v1/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204


def test_admin_cannot_delete_self(client, db_session):
    """Test that admin cannot delete their own account."""
    # Create admin
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()
    
    admin_id = admin.id

    token = get_token(client, "admin", "admin123")
    
    response = client.delete(
        f"/api/v1/users/{admin_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "Cannot delete your own account" in response.json()["detail"]
