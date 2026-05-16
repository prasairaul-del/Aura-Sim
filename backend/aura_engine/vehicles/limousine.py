"""
Limousine-specific vehicle implementation.
Premium luxury vehicles with high revenue potential but higher maintenance costs.
"""

from datetime import datetime
from typing import Optional

from .base_vehicle import BaseVehicle, VehicleEconomics, VehicleSpecs, VehicleType


class Limousine(BaseVehicle):
    """
    Limousine vehicle with premium pricing and high maintenance costs.
    - Higher revenue potential
    - More expensive maintenance
    - Higher depreciation rate
    """
    
    def _get_default_economics(self) -> VehicleEconomics:
        return VehicleEconomics(
            base_revenue_min=800.0,
            base_revenue_max=5000.0,
            maintenance_cost_per_health_point=75.0,
            depreciation_rate_daily=0.00015,
            fuel_cost_per_hour=40.0,
            insurance_daily=80.0,
            driver_daily_cost=200.0
        )
    
    def _get_default_specs(self) -> VehicleSpecs:
        return VehicleSpecs(
            model="Lincoln Town Car",
            capacity=8,
            fuel_type="gasoline",
            fuel_efficiency=18.0,
            max_range=400.0,
            purchase_price=95000.0
        )
    
    @property
    def vehicle_type(self) -> VehicleType:
        return VehicleType.LIMOUSINE
    
    def calculate_daily_revenue(self, market_demand: float = 1.0) -> float:
        """
        Limousines have premium pricing with VIP service potential.
        Can generate bonus revenue for special events.
        """
        base = super().calculate_daily_revenue(market_demand)
        # Limousines can get VIP bonuses
        if market_demand > 1.2:
            base *= 1.3  # VIP event bonus
        return base
    
    def calculate_maintenance_cost(self, health_deficit: float) -> float:
        """
        Limousines are expensive to maintain due to luxury parts.
        """
        base_cost = super().calculate_maintenance_cost(health_deficit)
        # Premium parts are 30% more expensive
        return base_cost * 1.3