"""
Scenarios module for Aura-Sim simulation engine.
Provides preset and custom scenario loading.
"""

from .scenario_loader import ScenarioLoader
from .custom_scenario import CustomScenario, CustomScenarioConfig, VehicleConfig

__all__ = [
    "ScenarioLoader",
    "CustomScenario",
    "CustomScenarioConfig",
    "VehicleConfig",
]