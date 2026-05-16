"""
Sedan-specific vehicle implementation.
Balanced economy vehicles with moderate revenue and maintenance costs.
"""

from datetime import datetime

from .base_vehicle import BaseVehicle, VehicleEconomics, VehicleSpecs, VehicleType


class Sedan(BaseVehicle):
    """
    Sedan vehicle with balanced economics.
    - Moderate revenue
    - Standard maintenance costs
    - Good fuel efficiency
    """
    
    def _get_default_economics(self) -> VehicleEconomics:
        return VehicleEconomics(
            base_revenue_min=400.0,
            base_revenue_max=2000.0,
            maintenance_cost_per_health_point=40.0,
            depreciation_rate_daily=0.00008,
            fuel_cost_per_hour=20.0,
            insurance_daily=35.0,
            driver_daily_cost=120.0
        )
    
    def _get_default_specs(self) -> VehicleSpecs:
        return VehicleSpecs(
            model="Mercedes E-Class",
            capacity=4,
            fuel_type="gasoline",
            fuel_efficiency=28.0,
            max_range=500.0,
            purchase_price=65000.0
        )
    
    @property
    def vehicle_type(self) -> VehicleType:
        return VehicleType.SEDAN
    
    def calculate_daily_revenue(self, market_demand: float = 1.0) -> float:
        """
        Sedans provide reliable steady income.
        Better in low-demand markets due to competitive pricing.
        """
        base = super().calculate_daily_revenue(market_demand)
        # Sedans perform better in low-demand markets
        if market_demand < 0.8:
            base *= 1.1
        return base