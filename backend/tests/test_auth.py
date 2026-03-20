import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.core.security import get_password_hash
from app.main import app
from app.models import Base
from app.models.user import User, UserRole

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    Base.metadata.drop_all(bind=engine)


def test_register_first_user_becomes_admin(client):
    """Test that the first registered user becomes an admin."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "firstuser",
            "email": "first@example.com",
            "password": "password123",
            "full_name": "First User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "firstuser"
    assert data["email"] == "first@example.com"
    assert data["role"] == "admin"
    assert data["is_active"] is True


def test_register_second_user_not_admin(client, db_session):
    """Test that subsequent users don't become admin by default."""
    # Create first user (admin)
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()

    # Register second user
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "seconduser",
            "email": "second@example.com",
            "password": "password123",
            "full_name": "Second User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "user"


def test_register_duplicate_username(client):
    """Test that duplicate usernames are rejected."""
    # Register first user
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test1@example.com",
            "password": "password123",
        },
    )

    # Try to register with same username
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test2@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 400
    assert "Username already registered" in response.json()["detail"]


def test_register_duplicate_email(client):
    """Test that duplicate emails are rejected."""
    # Register first user
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "user1",
            "email": "duplicate@example.com",
            "password": "password123",
        },
    )

    # Try to register with same email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "user2",
            "email": "duplicate@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_login_success(client, db_session):
    """Test successful login."""
    # Create user
    user = User(
        username="logintest",
        email="login@example.com",
        hashed_password=get_password_hash("password123"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "logintest",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "logintest"


def test_login_wrong_password(client, db_session):
    """Test login with wrong password."""
    # Create user
    user = User(
        username="wrongpass",
        email="wrong@example.com",
        hashed_password=get_password_hash("password123"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    # Try to login with wrong password
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "wrongpass",
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401


def test_login_inactive_user(client, db_session):
    """Test login with inactive user."""
    # Create inactive user
    user = User(
        username="inactive",
        email="inactive@example.com",
        hashed_password=get_password_hash("password123"),
        role=UserRole.USER,
        is_active=False,
    )
    db_session.add(user)
    db_session.commit()

    # Try to login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "inactive",
            "password": "password123",
        },
    )
    assert response.status_code == 403
    assert "disabled" in response.json()["detail"].lower()


def test_get_me(client, db_session):
    """Test getting current user info."""
    # Create and login user
    user = User(
        username="meuser",
        email="me@example.com",
        hashed_password=get_password_hash("password123"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    # Login to get token
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "meuser",
            "password": "password123",
        },
    )
    token = login_response.json()["access_token"]

    # Get me
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "meuser"
    assert data["email"] == "me@example.com"


def test_get_me_no_token(client):
    """Test getting current user without token."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
