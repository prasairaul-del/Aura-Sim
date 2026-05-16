"""
Vehicle module for Aura-Sim simulation engine.
Provides vehicle types and factory for fleet management.
"""

from .base_vehicle import BaseVehicle, VehicleStatus, VehicleType, VehicleEconomics, VehicleSpecs
from .limousine import Limousine
from .sedan import Sedan
from .suv import SUV
from .vehicle_factory import VehicleFactory

__all__ = [
    "BaseVehicle",
    "VehicleStatus",
    "VehicleType",
    "VehicleEconomics",
    "VehicleSpecs",
    "Limousine",
    "Sedan",
    "SUV",
    "VehicleFactory",
]