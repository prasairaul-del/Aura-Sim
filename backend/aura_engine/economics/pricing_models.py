"""
Dynamic pricing models for simulation revenue calculation.
Supports seasonal adjustments, demand-based pricing, and competitive factors.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, Optional, Tuple
import random

from ..vehicles.base_vehicle import VehicleType


class PricingModel(Enum):
    """Available pricing models."""
    STATIC = "static"
    DYNAMIC = "dynamic"
    SEASONAL = "seasonal"
    DEMAND_BASED = "demand_based"


class PricingModels:
    """
    Dynamic pricing algorithms for vehicle revenue calculation.
    """
    
    # Base rates by vehicle type (per hour)
    BASE_RATES = {
        VehicleType.LIMOUSINE: 300.0,
        VehicleType.SEDAN: 150.0,
        VehicleType.SUV: 200.0,
    }
    
    # Seasonal multipliers
    SEASONAL_MULTIPLIERS = {
        1: 0.85,   # January - low season
        2: 0.90,   # February - low season
        3: 1.0,    # March - normal
        4: 1.1,    # April - spring events
        5: 1.2,    # May - wedding season
        6: 1.3,    # June - summer peak
        7: 1.3,    # July - summer peak
        8: 1.25,   # August - summer end
        9: 1.1,    # September - fall events
        10: 1.0,   # October - normal
        11: 1.2,   # November - holiday season
        12: 1.5,   # December - holiday peak
    }
    
    # Day-of-week multipliers
    DAY_MULTIPLIERS = {
        0: 0.7,  # Monday
        1: 0.8,  # Tuesday
        2: 0.9,  # Wednesday
        3: 1.0,  # Thursday
        4: 1.2,  # Friday
        5: 1.4,  # Saturday - weekend premium
        6: 1.3,  # Sunday - weekend premium
    }
    
    @classmethod
    def calculate_price(
        cls,
        vehicle_type: VehicleType,
        date: datetime,
        demand_index: float = 1.0,
        model: PricingModel = PricingModel.DYNAMIC
    ) -> float:
        """
        Calculate the price for a vehicle on a given date.
        
        Args:
            vehicle_type: Type of vehicle
            date: Date for pricing calculation
            demand_index: Current market demand (0.5-2.0)
            model: Pricing model to use
        
        Returns:
            Price per hour
        """
        base_rate = cls.BASE_RATES.get(vehicle_type, 150.0)
        
        if model == PricingModel.STATIC:
            return base_rate
        
        # Apply seasonal multiplier
        seasonal_mult = cls.SEASONAL_MULTIPLIERS.get(date.month, 1.0)
        
        # Apply day multiplier
        day_mult = cls.DAY_MULTIPLIERS.get(date.weekday(), 1.0)
        
        # Demand adjustment
        demand_mult = demand_index
        
        final_price = base_rate * seasonal_mult * day_mult * demand_mult
        
        return round(final_price, 2)
    
    @classmethod
    def calculate_daily_revenue(
        cls,
        vehicle_type: VehicleType,
        date: datetime,
        utilization_hours: float = 8.0,
        demand_index: float = 1.0
    ) -> Tuple[float, float]:
        """
        Calculate daily revenue with confidence bounds.
        
        Returns:
            Tuple of (min_revenue, max_revenue)
        """
        price = cls.calculate_price(vehicle_type, date, demand_index)
        
        # Add some variance based on utilization
        min_revenue = price * utilization_hours * 0.7
        max_revenue = price * utilization_hours * 1.3
        
        return round(min_revenue, 2), round(max_revenue, 2)
    
    @classmethod
    def get_seasonal_factor(cls, date: datetime) -> float:
        """Get the seasonal multiplier for a date."""
        return cls.SEASONAL_MULTIPLIERS.get(date.month, 1.0)
    
    @classmethod
    def get_day_factor(cls, date: datetime) -> float:
        """Get the day-of-week multiplier for a date."""
        return cls.DAY_MULTIPLIERS.get(date.weekday(), 1.0)
    
    @classmethod
    def adjust_for_competition(cls, price: float, competition_level: float = 1.0) -> float:
        """
        Adjust price based on competition level.
        competition_level: 0.5 (low competition) to 2.0 (high competition)
        """
        return round(price / competition_level, 2)