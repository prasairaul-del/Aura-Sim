"""
Vehicle catalog routes for Aura-Sim API.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

router = APIRouter()


class VehicleTypeResponse(BaseModel):
    """Vehicle type response."""
    type: str
    name: str
    base_price: float
    description: str


@router.get("/catalog", response_model=List[VehicleTypeResponse])
async def get_vehicle_catalog(
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Get available vehicle types.
    """
    return [
        VehicleTypeResponse(
            type="limousine",
            name="Limousine",
            base_price=95000.0,
            description="Luxury premium vehicles with high revenue potential"
        ),
        VehicleTypeResponse(
            type="sedan",
            name="Sedan",
            base_price=65000.0,
            description="Balanced economy vehicles"
        ),
        VehicleTypeResponse(
            type="suv",
            name="SUV",
            base_price=120000.0,
            description="High-capacity versatile vehicles"
        )
    ]