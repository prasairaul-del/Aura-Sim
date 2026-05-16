"""
Scenario loader for loading preset and custom scenarios.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import uuid

from ..vehicles.vehicle_factory import VehicleFactory, VehicleType
from ..vehicles.base_vehicle import VehicleSpecs


class ScenarioLoader:
    """
    Loads scenarios from preset files or custom configurations.
    """
    
    # Preset scenario definitions
    PRESETS = {
        "standard_fleet": {
            "name": "Standard Fleet",
            "description": "20 limousines, $2M starting capital",
            "initial_balance": 2000000.0,
            "vehicles": [
                {"type": "limousine", "count": 20}
            ],
            "difficulty": "easy"
        },
        "mixed_fleet": {
            "name": "Mixed Fleet",
            "description": "10 limousines, 15 sedans, $1.5M starting capital",
            "initial_balance": 1500000.0,
            "vehicles": [
                {"type": "limousine", "count": 10},
                {"type": "sedan", "count": 15}
            ],
            "difficulty": "medium"
        },
        "luxury_suv_fleet": {
            "name": "Luxury SUV Fleet",
            "description": "15 SUVs, $2.5M starting capital",
            "initial_balance": 2500000.0,
            "vehicles": [
                {"type": "suv", "count": 15}
            ],
            "difficulty": "medium"
        },
        "aggressive_growth": {
            "name": "Aggressive Growth",
            "description": "5 limousines, $500K starting capital - scale fast!",
            "initial_balance": 500000.0,
            "vehicles": [
                {"type": "limousine", "count": 5}
            ],
            "difficulty": "hard"
        },
        "custom": {
            "name": "Custom Scenario",
            "description": "User-defined configuration",
            "initial_balance": 1250000.0,
            "vehicles": [],
            "difficulty": "custom"
        }
    }
    
    def __init__(self, preset_path: Optional[Path] = None):
        self.preset_path = preset_path or Path(__file__).parent / "presets"
        self._custom_scenarios: Dict[str, Dict] = {}
    
    def get_preset(self, preset_name: str) -> Optional[Dict[str, Any]]:
        """Get a preset scenario configuration by name."""
        return self.PRESETS.get(preset_name)
    
    def list_presets(self) -> List[Dict[str, Any]]:
        """List all available preset scenarios."""
        return [
            {
                "id": name,
                "name": data["name"],
                "description": data["description"],
                "difficulty": data["difficulty"]
            }
            for name, data in self.PRESETS.items()
        ]
    
    def load_preset(self, preset_name: str) -> Dict[str, Any]:
        """
        Load a preset scenario and generate vehicle configurations.
        """
        preset = self.get_preset(preset_name)
        if not preset:
            raise ValueError(f"Unknown preset: {preset_name}")
        
        vehicles = []
        for vehicle_config in preset.get("vehicles", []):
            vehicle_type_str = vehicle_config["type"]
            vehicle_type = VehicleType(vehicle_type_str)
            count = vehicle_config["count"]
            
            for i in range(count):
                vehicle = VehicleFactory.create_vehicle(
                    vehicle_type=vehicle_type,
                    model=None,
                    purchase_date=datetime.now()
                )
                vehicles.append(vehicle)
        
        return {
            "scenario_id": f"preset_{preset_name}_{uuid.uuid4().hex[:8]}",
            "name": preset["name"],
            "description": preset["description"],
            "scenario_type": "preset",
            "preset_name": preset_name,
            "initial_balance": preset["initial_balance"],
            "vehicle_count": len(vehicles),
            "vehicles": vehicles,
            "difficulty": preset["difficulty"],
            "created_at": datetime.now().isoformat()
        }
    
    def load_custom(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Load a custom scenario from user configuration.
        """
        vehicles = []
        for i, vehicle_config in enumerate(config.get("vehicles", [])):
            vehicle_type = VehicleType(vehicle_config.get("type", "sedan"))
            model = vehicle_config.get("model")
            purchase_price = vehicle_config.get("purchase_price")
            
            vehicle = VehicleFactory.create_custom_vehicle(
                vehicle_type=vehicle_type,
                model=model or "",
                purchase_price=purchase_price or VehicleFactory.get_default_purchase_price(vehicle_type)
            )
            vehicles.append(vehicle)
        
        return {
            "scenario_id": f"custom_{uuid.uuid4().hex}",
            "name": config.get("name", "Custom Scenario"),
            "description": config.get("description", ""),
            "scenario_type": "custom",
            "initial_balance": config.get("initial_balance", 1250000.0),
            "vehicle_count": len(vehicles),
            "vehicles": vehicles,
            "configuration": config,
            "created_at": datetime.now().isoformat()
        }
    
    def save_custom_scenario(self, scenario: Dict[str, Any], user_id: str) -> str:
        """
        Save a custom scenario for later use.
        Returns the scenario ID.
        """
        scenario_id = scenario.get("scenario_id", f"custom_{uuid.uuid4().hex}")
        self._custom_scenarios[f"{user_id}_{scenario_id}"] = scenario
        return scenario_id
    
    def load_saved_scenario(self, scenario_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Load a previously saved custom scenario."""
        return self._custom_scenarios.get(f"{user_id}_{scenario_id}")