"""
Authentication routes for Aura-Sim API.
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter()


class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Registration request model."""
    email: EmailStr
    password: str
    full_name: str


class TokenResponse(BaseModel):
    """Token response model."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Login endpoint - returns JWT tokens.
    """
    # Placeholder - will be implemented with real auth
    # For development, return mock tokens
    return TokenResponse(
        access_token="dev-access-token-123",
        refresh_token="dev-refresh-token-123",
    )


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """
    Register a new user.
    """
    # Placeholder - will be implemented with real registration
    return TokenResponse(
        access_token="dev-access-token-123",
        refresh_token="dev-refresh-token-123",
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token.
    """
    # Placeholder
    return TokenResponse(
        access_token="dev-access-token-refreshed",
        refresh_token=refresh_token,
    )


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)):
    """
    Get current user profile.
    """
    return {
        "user_id": "dev-user-123",
        "email": "dev@example.com",
        "full_name": "Development User",
        "subscription_tier": "pro",
    }