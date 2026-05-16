"""
Base Vehicle class for all vehicle types.
Defines the interface and common functionality for vehicle economics.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Dict, Any


class VehicleStatus(Enum):
    """Vehicle operational status."""
    AVAILABLE = "available"
    IN_SERVICE = "in-service"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"


class VehicleType(Enum):
    """Vehicle classification types."""
    LIMOUSINE = "limousine"
    SEDAN = "sedan"
    SUV = "suv"
    CUSTOM = "custom"


@dataclass
class VehicleEconomics:
    """Economic parameters for vehicle operations."""
    base_revenue_min: float = 500.0
    base_revenue_max: float = 3000.0
    maintenance_cost_per_health_point: float = 50.0
    depreciation_rate_daily: float = 0.0001  # 0.01% per day
    fuel_cost_per_hour: float = 25.0
    insurance_daily: float = 50.0
    driver_daily_cost: float = 150.0


@dataclass
class VehicleSpecs:
    """Physical and operational specifications."""
    model: str
    capacity: int  # Passengers
    fuel_type: str  # "gasoline", "diesel", "electric", "hybrid"
    fuel_efficiency: float  # miles per gallon or kWh per mile
    max_range: float  # miles
    purchase_price: float


class BaseVehicle(ABC):
    """
    Abstract base class for all vehicle types.
    Defines the interface for vehicle economics and operations.
    """
    
    def __init__(
        self,
        vehicle_id: str,
        model: str,
        purchase_date: datetime,
        purchase_price: float
    ):
        self.vehicle_id = vehicle_id
        self.model = model
        self.purchase_date = purchase_date
        self.purchase_price = purchase_price
        self.current_valuation = purchase_price
        self.health = 100
        self.status = VehicleStatus.AVAILABLE
        self.revenue_generated = 0.0
        self.maintenance_costs = 0.0
        self.total_service_hours = 0.0
        self.last_service_date: Optional[datetime] = None
        
        # Economics
        self.economics = self._get_default_economics()
        self.specs = self._get_default_specs()
        
        # Event hooks
        self._on_maintenance_due_callbacks: list = []
        self._on_breakdown_callbacks: list = []
    
    @abstractmethod
    def _get_default_economics(self) -> VehicleEconomics:
        """Return economics specific to vehicle type."""
        pass
    
    @abstractmethod
    def _get_default_specs(self) -> VehicleSpecs:
        """Return specs specific to vehicle type."""
        pass
    
    @property
    @abstractmethod
    def vehicle_type(self) -> VehicleType:
        """Return the vehicle type enum."""
        pass
    
    def calculate_daily_revenue(self, market_demand: float = 1.0) -> float:
        """
        Calculate revenue potential for a day.
        Market demand affects revenue (0.5 = low demand, 1.5 = high demand).
        """
        base_revenue = (self.economics.base_revenue_min + self.economics.base_revenue_max) / 2
        return base_revenue * market_demand
    
    def calculate_maintenance_cost(self, health_deficit: float) -> float:
        """
        Calculate maintenance cost based on health deficit.
        More expensive to fix severely damaged vehicles.
        """
        cost = health_deficit * self.economics.maintenance_cost_per_health_point
        # Add premium for vehicles needing major repairs
        if health_deficit > 50:
            cost *= 1.5
        return cost
    
    def update_valuation(self, days_since_purchase: int) -> None:
        """
        Update vehicle valuation based on depreciation.
        """
        depreciation = self.purchase_price * (1 - (1 - self.economics.depreciation_rate_daily) ** days_since_purchase)
        self.current_valuation = max(self.purchase_price * 0.1, self.purchase_price - depreciation)
    
    def enter_maintenance(self, reason: str = "scheduled") -> None:
        """Put vehicle into maintenance status."""
        self.status = VehicleStatus.MAINTENANCE
        for callback in self._on_maintenance_due_callbacks:
            callback(self, reason)
    
    def start_service(self) -> None:
        """Set vehicle to in-service status."""
        self.status = VehicleStatus.IN_SERVICE
    
    def complete_service(self) -> None:
        """Complete service and return to available status."""
        self.status = VehicleStatus.AVAILABLE
        self.last_service_date = datetime.now()
    
    def schedule_breakdown(self) -> None:
        """Schedule a breakdown event."""
        for callback in self._on_breakdown_callbacks:
            callback(self)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current vehicle status as dictionary."""
        return {
            "vehicle_id": self.vehicle_id,
            "model": self.model,
            "type": self.vehicle_type.value,
            "status": self.status.value,
            "health": self.health,
            "current_valuation": round(self.current_valuation, 2),
            "revenue_generated": round(self.revenue_generated, 2),
            "maintenance_costs": round(self.maintenance_costs, 2),
            "total_service_hours": round(self.total_service_hours, 2)
        }
    
    def on_maintenance_due(self, callback: callable) -> None:
        """Register callback for maintenance events."""
        self._on_maintenance_due_callbacks.append(callback)
    
    def on_breakdown(self, callback: callable) -> None:
        """Register callback for breakdown events."""
        self._on_breakdown_callbacks.append(callback)
    
    def reset(self) -> None:
        """Reset vehicle to initial state."""
        self.health = 100
        self.status = VehicleStatus.AVAILABLE
        self.revenue_generated = 0.0
        self.maintenance_costs = 0.0
        self.current_valuation = self.purchase_price