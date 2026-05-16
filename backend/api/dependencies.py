"""
FastAPI dependencies for authentication, database, and services.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[str] = None
    email: Optional[str] = None
    subscription_tier: str = "free"


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Get current authenticated user from JWT token.
    """
    # Placeholder - will be implemented with real JWT verification
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    # Mock user for development
    return {
        "user_id": "dev-user-123",
        "email": "dev@example.com",
        "subscription_tier": "pro",
    }


async def get_database():
    """
    Get database connection.
    """
    # Placeholder - will be implemented with SQLAlchemy
    return None


async def get_redis():
    """
    Get Redis connection for pub/sub.
    """
    # Placeholder - will be implemented with redis-py
    return None