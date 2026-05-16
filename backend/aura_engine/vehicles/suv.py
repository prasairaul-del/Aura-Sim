"""
SUV-specific vehicle implementation.
High-capacity vehicles with good revenue and versatility.
"""

from datetime import datetime

from .base_vehicle import BaseVehicle, VehicleEconomics, VehicleSpecs, VehicleType


class SUV(BaseVehicle):
    """
    SUV vehicle with high capacity and good revenue.
    - Good revenue potential
    - Higher passenger capacity
    - Moderate maintenance costs
    - Lower depreciation than limousines
    """
    
    def _get_default_economics(self) -> VehicleEconomics:
        return VehicleEconomics(
            base_revenue_min=600.0,
            base_revenue_max=3500.0,
            maintenance_cost_per_health_point=55.0,
            depreciation_rate_daily=0.0001,
            fuel_cost_per_hour=35.0,
            insurance_daily=60.0,
            driver_daily_cost=160.0
        )
    
    def _get_default_specs(self) -> VehicleSpecs:
        return VehicleSpecs(
            model="Range Rover Autobiography",
            capacity=7,
            fuel_type="gasoline",
            fuel_efficiency=20.0,
            max_range=450.0,
            purchase_price=120000.0
        )
    
    @property
    def vehicle_type(self) -> VehicleType:
        return VehicleType.SUV
    
    def calculate_daily_revenue(self, market_demand: float = 1.0) -> float:
        """
        SUVs are versatile and can handle various demand scenarios.
        Bonus revenue for group bookings.
        """
        base = super().calculate_daily_revenue(market_demand)
        # SUVs get bonus for group bookings
        if market_demand > 0.9:
            base *= 1.15  # Group booking bonus
        return base