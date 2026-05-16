"""
Maintenance cost scheduling based on vehicle health and age.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Tuple
import math


class MaintenanceType(Enum):
    """Types of maintenance."""
    ROUTINE = "routine"
    REPAIR = "repair"
    MAJOR = "major"
    EMERGENCY = "emergency"


class Maintenance:
    """
    Maintenance cost calculation and scheduling.
    """
    
    # Base maintenance costs by type
    BASE_COSTS = {
        MaintenanceType.ROUTINE: 150.0,
        MaintenanceType.REPAIR: 300.0,
        MaintenanceType.MAJOR: 800.0,
        MaintenanceType.EMERGENCY: 500.0,
    }
    
    # Service intervals in days
    SERVICE_INTERVALS = {
        MaintenanceType.ROUTINE: 90,
        MaintenanceType.REPAIR: 30,
        MaintenanceType.MAJOR: 365,
    }
    
    @classmethod
    def calculate_cost(
        cls,
        health_deficit: float,
        vehicle_age_days: int,
        maintenance_type: MaintenanceType = MaintenanceType.ROUTINE,
        parts_availability: float = 1.0  # 0.5 = scarce, 1.0 = readily available
    ) -> float:
        """
        Calculate maintenance cost based on health deficit and age.
        
        Args:
            health_deficit: Points below 100 health (0-100)
            vehicle_age_days: Age of vehicle in days
            maintenance_type: Type of maintenance
            parts_availability: Parts scarcity factor
        
        Returns:
            Estimated maintenance cost
        """
        base_cost = cls.BASE_COSTS.get(maintenance_type, 150.0)
        
        # Health factor - more expensive for severely damaged vehicles
        if health_deficit > 50:
            health_factor = 2.0
        elif health_deficit > 30:
            health_factor = 1.5
        else:
            health_factor = 1.0
        
        # Age factor - older vehicles cost more to maintain
        age_factor = 1.0 + (vehicle_age_days / 365.0) * 0.3
        
        # Parts scarcity
        scarcity_multiplier = 1.0 / parts_availability if parts_availability > 0 else 2.0
        
        cost = base_cost * health_factor * age_factor * scarcity_multiplier
        return round(cost, 2)
    
    @classmethod
    def get_service_interval(
        cls,
        vehicle_health: float,
        vehicle_age_days: int,
        maintenance_type: MaintenanceType = MaintenanceType.ROUTINE
    ) -> int:
        """
        Get recommended service interval based on health and age.
        """
        base_interval = cls.SERVICE_INTERVALS.get(maintenance_type, 90)
        
        # Shorter intervals for lower health
        if vehicle_health < 50:
            base_interval = 14
        elif vehicle_health < 70:
            base_interval = 30
        
        # Longer intervals for newer vehicles
        if vehicle_age_days < 180:
            base_interval = int(base_interval * 1.5)
        
        return base_interval
    
    @classmethod
    def should_schedule_maintenance(
        cls,
        health: float,
        days_since_last_service: int,
        vehicle_age_days: int
    ) -> Tuple[bool, MaintenanceType]:
        """
        Determine if maintenance should be scheduled.
        
        Returns:
            Tuple of (should_schedule, maintenance_type)
        """
        health_deficit = 100 - health
        
        # Emergency for very low health
        if health < 20:
            return True, MaintenanceType.EMERGENCY
        
        # Major service for aging vehicles
        if days_since_last_service > 365 or vehicle_age_days > 730:
            return True, MaintenanceType.MAJOR
        
        # Repair for moderate health issues
        if health < 50 and days_since_last_service > 30:
            return True, MaintenanceType.REPAIR
        
        # Routine service schedule
        if days_since_last_service > 90:
            return True, MaintenanceType.ROUTINE
        
        return False, MaintenanceType.ROUTINE
    
    @classmethod
    def get_maintenance_schedule(
        cls,
        start_date: datetime,
        vehicle_age_years: float,
        health_status: str = "good"  # good, fair, poor
    ) -> List[Dict]:
        """
        Generate a maintenance schedule for a vehicle.
        """
        schedule = []
        current_date = start_date
        
        # Health factor affects intervals
        interval_multiplier = 1.0
        if health_status == "poor":
            interval_multiplier = 0.5
        elif health_status == "fair":
            interval_multiplier = 0.7
        
        for i in range(12):  # 12 scheduled services
            service_date = datetime(
                start_date.year + (i // 12),
                start_date.month + (i % 12),
                start_date.day
            )
            
            schedule.append({
                "date": service_date.isoformat(),
                "type": "routine" if i % 3 != 0 else "major",
                "estimated_cost": cls.calculate_cost(
                    100 - 80,  # Assuming 80 health average
                    int(vehicle_age_years * 365 + i * 30)
                )
            })
        
        return schedule