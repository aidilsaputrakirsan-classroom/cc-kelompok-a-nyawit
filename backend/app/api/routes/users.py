from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, require_admin
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserRead, UserReadWithAssets, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[User]:
    """List all users (admin only)."""
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return list(users)


@router.get("/{user_id}", response_model=UserReadWithAssets)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> dict:
    """Get a specific user by ID with their created assets (admin only)."""
    user = db.scalar(
        select(User)
        .options(joinedload(User.created_assets))
        .where(User.id == user_id)
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Count assets created by this user
    asset_count = db.scalar(
        select(func.count())
        .select_from(User)
        .join(User.created_assets)
        .where(User.id == user_id)
    ) or 0
    
    return {
        **UserRead.model_validate(user).model_dump(),
        "created_assets": user.created_assets,
        "asset_count": asset_count
    }


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    """Create a new user (admin only)."""
    # Check if username already exists
    existing_user = db.scalar(select(User).where(User.username == payload.username))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    # Check if email already exists
    existing_email = db.scalar(select(User).where(User.email == payload.email))
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        is_active=payload.is_active,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    """Update a user (admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    update_data = payload.model_dump(exclude_unset=True)
    
    # Check email uniqueness if being updated
    if "email" in update_data and update_data["email"] and update_data["email"] != user.email:
        existing_email = db.scalar(select(User).where(User.email == update_data["email"]))
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        user.email = update_data["email"]
    
    # Update other fields
    if "full_name" in update_data:
        user.full_name = update_data["full_name"]
    if "role" in update_data:
        user.role = update_data["role"]
    if "is_active" in update_data:
        user.is_active = update_data["is_active"]
    if "password" in update_data and update_data["password"]:
        user.hashed_password = get_password_hash(update_data["password"])
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> None:
    """Delete a user (admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    
    db.delete(user)
    db.commit()
    return None
