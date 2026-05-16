"""
Scenario management routes for Aura-Sim API.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class ScenarioResponse(BaseModel):
    """Scenario response model."""
    id: str
    name: str
    description: str
    scenario_type: str
    initial_balance: float
    vehicle_count: int
    created_at: datetime


@router.get("", response_model=List[ScenarioResponse])
async def list_scenarios(
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    List all scenarios for the current user.
    """
    return [
        ScenarioResponse(
            id="scenario-1",
            name="Standard Fleet",
            description="20 limousines, $2M starting capital",
            scenario_type="preset",
            initial_balance=2000000.0,
            vehicle_count=20,
            created_at=datetime.now()
        )
    ]


@router.post("", response_model=ScenarioResponse)
async def create_scenario(
    name: str,
    description: str = "",
    initial_balance: float = 1250000.0,
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Create a new scenario.
    """
    return ScenarioResponse(
        id="scenario-new",
        name=name,
        description=description,
        scenario_type="custom",
        initial_balance=initial_balance,
        vehicle_count=0,
        created_at=datetime.now()
    )


@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(
    scenario_id: str,
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Get scenario details.
    """
    return ScenarioResponse(
        id=scenario_id,
        name="Standard Fleet",
        description="20 limousines, $2M starting capital",
        scenario_type="preset",
        initial_balance=2000000.0,
        vehicle_count=20,
        created_at=datetime.now()
    )