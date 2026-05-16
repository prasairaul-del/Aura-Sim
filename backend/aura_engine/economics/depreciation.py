"""
Vehicle depreciation models.
Handles value decay over time with various depreciation strategies.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
import math


class DepreciationModel(Enum):
    """Available depreciation models."""
    LINEAR = "linear"
    EXPONENTIAL = "exponential"
    DOUBLE_DECLINING = "double_declining"
    SUM_OF_YEARS = "sum_of_years"


class Depreciation:
    """
    Vehicle depreciation calculation.
    Supports multiple depreciation models.
    """
    
    # Default residual values by vehicle type (percentage of original value)
    RESIDUAL_VALUES = {
        "limousine": 0.15,  # 15% after useful life
        "sedan": 0.10,      # 10% after useful life
        "suv": 0.20,        # 20% after useful life
    }
    
    # Useful life in years by vehicle type
    USEFUL_LIFE_YEARS = {
        "limousine": 10,
        "sedan": 8,
        "suv": 12,
    }
    
    @classmethod
    def calculate_value(
        cls,
        purchase_price: float,
        purchase_date: datetime,
        current_date: datetime,
        vehicle_type: str = "sedan",
        model: DepreciationModel = DepreciationModel.EXPONENTIAL,
        condition_factor: float = 1.0  # Health factor 0.0-1.0
    ) -> float:
        """
        Calculate current vehicle value based on depreciation model.
        
        Args:
            purchase_price: Original purchase price
            purchase_date: Date of purchase
            current_date: Current date
            vehicle_type: Type of vehicle for residual calculation
            model: Depreciation model to use
            condition_factor: Vehicle condition (1.0 = new, 0.0 = broken)
        
        Returns:
            Current vehicle value
        """
        days_elapsed = (current_date - purchase_date).days
        years_elapsed = days_elapsed / 365.0
        
        residual_percent = cls.RESIDUAL_VALUES.get(vehicle_type, 0.10)
        useful_life = cls.USEFUL_LIFE_YEARS.get(vehicle_type, 8)
        
        if model == DepreciationModel.LINEAR:
            value = cls._linear_depreciation(
                purchase_price, years_elapsed, useful_life, residual_percent
            )
        elif model == DepreciationModel.DOUBLE_DECLINING:
            value = cls._double_declining_depreciation(
                purchase_price, years_elapsed, useful_life, residual_percent
            )
        elif model == DepreciationModel.SUM_OF_YEARS:
            value = cls._sum_of_years_depreciation(
                purchase_price, years_elapsed, useful_life, residual_percent
            )
        else:  # Default to exponential
            value = cls._exponential_depreciation(
                purchase_price, years_elapsed, useful_life, residual_percent
            )
        
        # Apply condition factor
        value *= condition_factor
        
        # Ensure value doesn't go below salvage value
        salvage_value = purchase_price * 0.05
        return max(value, salvage_value)
    
    @staticmethod
    def _linear_depreciation(
        purchase_price: float,
        years: float,
        useful_life: int,
        residual_percent: float
    ) -> float:
        """Linear depreciation - constant amount per year."""
        annual_depreciation = (purchase_price * (1 - residual_percent)) / useful_life
        value = purchase_price - (annual_depreciation * years)
        return max(value, purchase_price * residual_percent)
    
    @staticmethod
    def _exponential_depreciation(
        purchase_price: float,
        years: float,
        useful_life: int,
        residual_percent: float
    ) -> float:
        """Exponential depreciation - faster initial drop."""
        decay_rate = -math.log(residual_percent) / useful_life
        value = purchase_price * math.exp(-decay_rate * years)
        return max(value, purchase_price * residual_percent)
    
    @staticmethod
    def _double_declining_depreciation(
        purchase_price: float,
        years: float,
        useful_life: int,
        residual_percent: float
    ) -> float:
        """Double declining balance depreciation."""
        rate = 2 / useful_life
        value = purchase_price * math.pow((1 - rate), years)
        # Switch to straight-line when better
        straight_line_value = purchase_price - (purchase_price * (1 - residual_percent) * years / useful_life)
        return max(min(value, straight_line_value), purchase_price * residual_percent)
    
    @staticmethod
    def _sum_of_years_depreciation(
        purchase_price: float,
        years: float,
        useful_life: int,
        residual_percent: float
    ) -> float:
        """Sum of years digits depreciation."""
        sum_of_years = useful_life * (useful_life + 1) / 2
        depreciable_base = purchase_price * (1 - residual_percent)
        
        value = purchase_price
        for year in range(int(years)):
            fraction = (useful_life - year) / sum_of_years
            value -= depreciable_base * fraction
        
        # Handle partial year
        if years > int(years):
            fraction = (useful_life - int(years)) / sum_of_years
            value -= depreciable_base * fraction * (years - int(years))
        
        return max(value, purchase_price * residual_percent)
    
    @classmethod
    def get_annual_depreciation(
        cls,
        purchase_price: float,
        vehicle_type: str = "sedan"
    ) -> float:
        """Calculate average annual depreciation amount."""
        residual_percent = cls.RESIDUAL_VALUES.get(vehicle_type, 0.10)
        useful_life = cls.USEFUL_LIFE_YEARS.get(vehicle_type, 8)
        return (purchase_price * (1 - residual_percent)) / useful_life
    
    @classmethod
    def get_monthly_depreciation(
        cls,
        purchase_price: float,
        vehicle_type: str = "sedan"
    ) -> float:
        """Calculate average monthly depreciation amount."""
        return cls.get_annual_depreciation(purchase_price, vehicle_type) / 12