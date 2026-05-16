"""
Vehicle Factory for creating vehicle instances.
Implements the Factory pattern for vehicle creation.
"""

from datetime import datetime
from typing import Dict, Any, Optional, Type
import uuid

from .base_vehicle import BaseVehicle, VehicleType
from .limousine import Limousine
from .sedan import Sedan
from .suv import SUV


class VehicleFactory:
    """
    Factory for creating vehicle instances.
    Supports all vehicle types and custom configurations.
    """
    
    # Registry of vehicle constructors
    _registry: Dict[VehicleType, Type[BaseVehicle]] = {
        VehicleType.LIMOUSINE: Limousine,
        VehicleType.SEDAN: Sedan,
        VehicleType.SUV: SUV,
    }
    
    # Default models by type
    DEFAULT_MODELS = {
        VehicleType.LIMOUSINE: [
            "Lincoln Town Car",
            "Bentley Flying Spur",
            "Mercedes-Maybach S-Class",
            "Rolls-Royce Ghost",
        ],
        VehicleType.SEDAN: [
            "Mercedes E-Class",
            "BMW 5 Series",
            "Audi A6",
            "Genesis G80",
        ],
        VehicleType.SUV: [
            "Range Rover Autobiography",
            "Mercedes GLE",
            "BMW X5",
            "Cadillac Escalade",
        ]
    }
    
    @classmethod
    def register_vehicle_type(
        cls,
        vehicle_type: VehicleType,
        vehicle_class: Type[BaseVehicle]
    ) -> None:
        """Register a new vehicle type with the factory."""
        cls._registry[vehicle_type] = vehicle_class
    
    @classmethod
    def create_vehicle(
        cls,
        vehicle_type: VehicleType,
        model: Optional[str] = None,
        purchase_date: Optional[datetime] = None,
        purchase_price: Optional[float] = None,
        **kwargs
    ) -> BaseVehicle:
        """
        Create a vehicle instance of the specified type.
        
        Args:
            vehicle_type: Type of vehicle to create
            model: Optional model name (defaults to first in type list)
            purchase_date: Optional purchase date (defaults to now)
            purchase_price: Optional purchase price (uses type default)
            **kwargs: Additional arguments passed to vehicle constructor
        
        Returns:
            BaseVehicle instance
        """
        if vehicle_type not in cls._registry:
            raise ValueError(f"Unknown vehicle type: {vehicle_type}")
        
        vehicle_class = cls._registry[vehicle_type]
        
        # Generate ID
        vehicle_id = kwargs.pop('vehicle_id', f"veh_{uuid.uuid4().hex[:8]}")
        
        # Use provided or default model
        if not model:
            models = cls.DEFAULT_MODELS.get(vehicle_type, [""])
            model = models[0]
        
        # Use provided or default purchase date
        if not purchase_date:
            purchase_date = datetime.now()
        
        # Create vehicle
        vehicle = vehicle_class(
            vehicle_id=vehicle_id,
            model=model,
            purchase_date=purchase_date,
            purchase_price=purchase_price or vehicle_class(
                vehicle_id="temp", model=model, purchase_date=purchase_date, purchase_price=1
            ).purchase_price
        )
        
        return vehicle
    
    @classmethod
    def create_custom_vehicle(
        cls,
        vehicle_type: VehicleType,
        model: str,
        purchase_price: float,
        **kwargs
    ) -> BaseVehicle:
        """
        Create a custom-configured vehicle.
        Allows overriding default parameters.
        """
        return cls.create_vehicle(
            vehicle_type=vehicle_type,
            model=model,
            purchase_price=purchase_price,
            **kwargs
        )
    
    @classmethod
    def get_default_models(cls, vehicle_type: VehicleType) -> list:
        """Get the list of default models for a vehicle type."""
        return cls.DEFAULT_MODELS.get(vehicle_type, [])
    
    @classmethod
    def get_supported_types(cls) -> list:
        """Get all supported vehicle types."""
        return list(cls._registry.keys())
    
    @classmethod
    def get_default_purchase_price(cls, vehicle_type: VehicleType) -> float:
        """Get the default purchase price for a vehicle type."""
        # Create a temporary vehicle to get the default price
        temp = cls.create_vehicle(vehicle_type)
        return temp.purchase_price
    
    @classmethod
    def get_average_daily_revenue(cls, vehicle_type: VehicleType, market_demand: float = 1.0) -> float:
        """Calculate average daily revenue for a vehicle type."""
        vehicle = cls.create_vehicle(vehicle_type)
        return vehicle.calculate_daily_revenue(market_demand)
    
    @classmethod
    def get_total_cost_of_ownership(
        cls,
        vehicle_type: VehicleType,
        days: int = 365
    ) -> Dict[str, float]:
        """
        Calculate total cost of ownership for a period.
        Includes depreciation, maintenance, insurance, and fuel.
        """
        vehicle = cls.create_vehicle(vehicle_type)
        economics = vehicle.economics
        
        daily_costs = economics.insurance_daily + economics.driver_daily_cost
        fuel_cost = economics.fuel_cost_per_hour * 8  # 8-hour day estimate
        
        # Depreciation
        depreciation = vehicle.purchase_price * (1 - (1 - economics.depreciation_rate_daily) ** days)
        
        total = (
            depreciation +
            (daily_costs + fuel_cost) * days +
            vehicle.maintenance_costs  # Assume some maintenance
        )
        
        return {
            "purchase_price": vehicle.purchase_price,
            "depreciation": round(depreciation, 2),
            "operational_costs": round((daily_costs + fuel_cost) * days, 2),
            "total_cost": round(total, 2),
            "average_daily_cost": round(total / days, 2)
        }