"""
Simulation control routes for Aura-Sim API.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class SimulationCreateRequest(BaseModel):
    """Request to create/start a simulation."""
    scenario_id: str
    initial_balance: Optional[float] = None


class SimulationResponse(BaseModel):
    """Simulation state response."""
    id: str
    scenario_id: str
    status: str
    current_tick: int
    current_date: datetime
    cash_balance: float
    fleet_health: int


@router.post("", response_model=SimulationResponse)
async def start_simulation(
    request: SimulationCreateRequest,
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Start a new simulation.
    """
    # Placeholder - will integrate with SimulationEngine
    return SimulationResponse(
        id="sim-123",
        scenario_id=request.scenario_id,
        status="running",
        current_tick=0,
        current_date=datetime.now(),
        cash_balance=1250000.0,
        fleet_health=100
    )


@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    simulation_id: str,
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Get current simulation state.
    """
    return SimulationResponse(
        id=simulation_id,
        scenario_id="scenario-123",
        status="running",
        current_tick=45,
        current_date=datetime.now(),
        cash_balance=1500000.0,
        fleet_health=85
    )


@router.post("/{simulation_id}/pause")
async def pause_simulation(
    simulation_id: str,
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Pause a running simulation.
    """
    return {"status": "paused"}


@router.post("/{simulation_id}/resume")
async def resume_simulation(
    simulation_id: str,
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Resume a paused simulation.
    """
    return {"status": "running"}


@router.post("/{simulation_id}/stop")
async def stop_simulation(
    simulation_id: str,
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Stop a simulation.
    """
    return {"status": "stopped"}