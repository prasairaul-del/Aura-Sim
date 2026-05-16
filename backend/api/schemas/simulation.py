"""
Simulation schemas.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SimulationCreate(BaseModel):
    scenario_id: str
    initial_balance: Optional[float] = None


class SimulationState(BaseModel):
    total_balance: float
    fleet_health: int
    operational_efficiency: int
    is_running: bool


class Simulation(SimulationCreate):
    id: str
    user_id: str
    status: str
    current_tick: int
    current_date: datetime
    state_snapshot: Optional[dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True