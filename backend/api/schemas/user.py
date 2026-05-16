"""
User schemas.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    subscription_tier: Optional[str] = None


class User(UserBase):
    id: str
    subscription_tier: str = "free"
    created_at: datetime
    
    class Config:
        from_attributes = True