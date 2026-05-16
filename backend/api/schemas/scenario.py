"""
Scenario schemas.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ScenarioBase(BaseModel):
    name: str
    description: Optional[str] = None
    initial_balance: float = 1250000.0


class ScenarioCreate(ScenarioBase):
    scenario_type: str = "custom"
    preset_name: Optional[str] = None
    vehicles: Optional[List[dict]] = None


class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class Scenario(ScenarioBase):
    id: str
    user_id: str
    scenario_type: str
    vehicle_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True