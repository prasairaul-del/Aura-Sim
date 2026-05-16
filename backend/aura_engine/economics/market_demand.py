"""
Simulated market demand conditions.
Generates dynamic demand indices based on seasonal and random factors.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, Optional, Tuple
import random
import math


class MarketCondition(Enum):
    """Market condition levels."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    PEAK = "peak"


class MarketDemand:
    """
    Generates simulated market demand conditions.
    Used to affect revenue calculations in the simulation.
    """
    
    # Base demand by month
    MONTHLY_BASE_DEMAND = {
        1: 0.7,   # January
        2: 0.75,  # February
        3: 0.85,  # March
        4: 0.95,  # April
        5: 1.1,   # May - wedding season
        6: 1.2,   # June - summer start
        7: 1.25,  # July - summer peak
        8: 1.2,   # August - summer end
        9: 1.0,   # September
        10: 0.95, # October
        11: 1.15, # November - holiday start
        12: 1.3,  # December - holiday peak
    }
    
    # Day of week demand
    DAILY_DEMAND_MODIFIERS = {
        0: 0.7,  # Monday
        1: 0.8,  # Tuesday
        2: 0.9,  # Wednesday
        3: 0.95, # Thursday
        4: 1.1,  # Friday
        5: 1.3,  # Saturday
        6: 1.2,  # Sunday
    }
    
    # Demand fluctuation amplitude by condition
    CONDITION_AMPLITUDE = {
        MarketCondition.LOW: 0.1,
        MarketCondition.NORMAL: 0.2,
        MarketCondition.HIGH: 0.3,
        MarketCondition.PEAK: 0.4,
    }
    
    def __init__(self, seed: Optional[int] = None):
        self._random = random.Random(seed)
        self.current_condition = MarketCondition.NORMAL
        self._trend = 0.0  # -1.0 to 1.0 trend
        self._fluctuation = 0.0
    
    def get_demand_index(
        self,
        date: datetime,
        scenario_type: str = "standard"
    ) -> float:
        """
        Calculate demand index for a given date.
        Returns a multiplier for revenue calculations.
        """
        # Base monthly demand
        monthly_base = self.MONTHLY_BASE_DEMAND.get(date.month, 1.0)
        
        # Day of week modifier
        daily_modifier = self.DAILY_DEMAND_MODIFIERS.get(date.weekday(), 1.0)
        
        # Random fluctuation
        self._fluctuation = self._random.gauss(0, 0.1)
        
        # Apply trend
        demand = monthly_base * daily_modifier + self._trend
        
        # Ensure reasonable bounds
        demand = max(0.3, min(2.0, demand))
        
        return round(demand, 3)
    
    def update_condition(self, new_condition: MarketCondition) -> None:
        """Update the current market condition."""
        self.current_condition = new_condition
    
    def get_condition(self) -> MarketCondition:
        """Get current market condition."""
        return self.current_condition
    
    def get_demand_description(self, demand_index: float) -> MarketCondition:
        """Get market condition description for a demand index."""
        if demand_index > 1.2:
            return MarketCondition.PEAK
        elif demand_index > 1.0:
            return MarketCondition.HIGH
        elif demand_index > 0.8:
            return MarketCondition.NORMAL
        else:
            return MarketCondition.LOW
    
    def simulate_demand_series(
        self,
        start_date: datetime,
        days: int,
        volatility: float = 0.1
    ) -> Dict[datetime, float]:
        """
        Simulate a series of demand indices.
        Useful for forecasting or scenario playback.
        """
        series = {}
        current_demand = 1.0
        
        for i in range(days):
            date = datetime(
                start_date.year,
                start_date.month,
                start_date.day
            ) + __import__('datetime').timedelta(days=i)
            
            # Random walk with mean reversion
            change = self._random.gauss(0, volatility)
            current_demand += change
            current_demand = max(0.3, min(2.0, current_demand))
            
            # Mean reversion
            drift = (1.0 - current_demand) * 0.01
            current_demand += drift
            
            series[date] = round(current_demand, 3)
        
        return series
    
    def get_seasonal_factor(self, date: datetime) -> float:
        """Get the seasonal demand factor for a date."""
        return self.MONTHLY_BASE_DEMAND.get(date.month, 1.0)
    
    def get_weekly_factor(self, date: datetime) -> float:
        """Get the weekly demand factor for a date."""
        return self.DAILY_DEMAND_MODIFIERS.get(date.weekday(), 1.0)
    
    @classmethod
    def generate_scenario_demands(
        cls,
        scenarios: list = ["conservative", "standard", "aggressive"]
    ) -> Dict[str, Dict]:
        """
        Generate demand profiles for different scenarios.
        """
        profiles = {}
        
        for scenario in scenarios:
            if scenario == "conservative":
                profiles[scenario] = {
                    "base_multiplier": 0.8,
                    "volatility": 0.05,
                    "description": "Low demand, stable market"
                }
            elif scenario == "aggressive":
                profiles[scenario] = {
                    "base_multiplier": 1.2,
                    "volatility": 0.25,
                    "description": "High demand, volatile market"
                }
            else:
                profiles[scenario] = {
                    "base_multiplier": 1.0,
                    "volatility": 0.15,
                    "description": "Normal demand, moderate volatility"
                }
        
        return profiles