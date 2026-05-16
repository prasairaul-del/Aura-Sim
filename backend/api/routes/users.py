"""
User profile routes for Aura-Sim API.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr

router = APIRouter()


class UserProfile(BaseModel):
    """User profile response."""
    user_id: str
    email: EmailStr
    full_name: str
    subscription_tier: str


@router.get("/me", response_model=UserProfile)
async def get_user_profile(
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Get current user profile.
    """
    return UserProfile(
        user_id="user-123",
        email="user@example.com",
        full_name="Test User",
        subscription_tier="pro"
    )


@router.put("/me")
async def update_user_profile(
    full_name: str,
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Update user profile.
    """
    return {"status": "updated", "full_name": full_name}