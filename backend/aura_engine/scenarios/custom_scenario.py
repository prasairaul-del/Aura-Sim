"""
Custom scenario validation and processing.
"""

from datetime import datetime
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, validator, Field

from ..vehicles.base_vehicle import VehicleType


class VehicleConfig(BaseModel):
    """Configuration for a single vehicle in a custom scenario."""
    type: str = Field(..., description="Vehicle type: limo, sedan, or suv")
    model: Optional[str] = None
    purchase_price: Optional[float] = None
    count: int = Field(default=1, ge=1, le=500)


class CustomScenarioConfig(BaseModel):
    """
    Validated configuration for a custom scenario.
    """
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default="", max_length=1000)
    initial_balance: float = Field(default=1250000.0, ge=1000.0)
    vehicles: List[VehicleConfig] = Field(default_factory=list)
    start_date: Optional[datetime] = None
    
    @validator('initial_balance')
    def validate_balance(cls, v):
        if v < 1000:
            raise ValueError('Minimum starting balance is $1,000')
        return v
    
    @validator('vehicles')
    def validate_vehicle_count(cls, v):
        total = sum(vc.count for vc in v)
        if total > 500:
            raise ValueError('Maximum 500 vehicles per scenario')
        return v


class CustomScenario:
    """
    Handles custom scenario validation and creation.
    """
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> CustomScenarioConfig:
        """
        Create a validated custom scenario from a dictionary.
        Raises ValidationError if invalid.
        """
        return CustomScenarioConfig(**data)
    
    @classmethod
    def validate_scenario(cls, config: CustomScenarioConfig) -> List[str]:
        """
        Validate scenario configuration and return any warnings.
        """
        warnings = []
        
        # Check if balance is sufficient for vehicles
        total_vehicle_cost = 0
        for vc in config.vehicles:
            if vc.purchase_price:
                total_vehicle_cost += vc.purchase_price * vc.count
        
        if total_vehicle_cost > config.initial_balance * 0.8:
            warnings.append("Vehicle costs exceed 80% of starting balance - consider more capital")
        
        # Check for very small fleets
        total_vehicles = sum(vc.count for vc in config.vehicles)
        if total_vehicles < 3:
            warnings.append("Small fleet size may limit profit potential")
        
        return warnings
    
    @classmethod
    def create_scenario(cls, config: CustomScenarioConfig) -> Dict[str, Any]:
        """
        Create a scenario from validated configuration.
        """
        from .scenario_loader import ScenarioLoader
        
        # Convert to raw dict format for scenario loader
        raw_config = {
            "name": config.name,
            "description": config.description,
            "initial_balance": config.initial_balance,
            "vehicles": [
                {
                    "type": vc.type,
                    "model": vc.model,
                    "purchase_price": vc.purchase_price,
                    "count": vc.count
                }
                for vc in config.vehicles
            ]
        }
        
        loader = ScenarioLoader()
        return loader.load_custom(raw_config)