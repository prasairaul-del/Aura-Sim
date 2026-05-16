"""
Time Manager for simulation tick handling.
Manages daily ticks, acceleration, and date progression.
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional


class SimulationState(Enum):
    """Simulation state."""
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"
    ARCHIVED = "archived"


class TimeAcceleration(Enum):
    """Time acceleration factors."""
    NORMAL = 1      # 1x speed (1 tick per second)
    FAST = 5        # 5x speed
    ULTRA = 10      # 10x speed


@dataclass
class SimulationTime:
    """Represents the current simulation time."""
    current_date: datetime
    tick_count: int
    simulated_days: int  # Total days simulated
    
    def to_dict(self) -> dict:
        return {
            "current_date": self.current_date.isoformat(),
            "tick_count": self.tick_count,
            "simulated_days": self.simulated_days
        }


class TimeManager:
    """
    Manages time progression for the simulation.
    Handles daily ticks and acceleration.
    """
    
    def __init__(self, start_date: Optional[datetime] = None):
        self.start_date = start_date or datetime.now()
        self.current_date = self.start_date
        self.tick_count = 0
        self.simulated_days = 0
        self.acceleration = TimeAcceleration.NORMAL
        self._tick_interval_ms = 1000  # Base interval in milliseconds
    
    def set_acceleration(self, acceleration: TimeAcceleration) -> None:
        """Set the time acceleration factor."""
        self.acceleration = acceleration
    
    def tick(self, days: int = 1) -> SimulationTime:
        """Advance simulation by N days."""
        self.tick_count += 1
        self.simulated_days += days
        self.current_date += timedelta(days=days)
        return SimulationTime(
            current_date=self.current_date,
            tick_count=self.tick_count,
            simulated_days=self.simulated_days
        )
    
    def get_tick_interval_ms(self) -> int:
        """Get the interval between ticks in milliseconds based on acceleration."""
        return self._tick_interval_ms // self.acceleration.value
    
    def reset(self) -> None:
        """Reset time to initial state."""
        self.current_date = self.start_date
        self.tick_count = 0
        self.simulated_days = 0
    
    def get_seed_for_tick(self, tick_number: int) -> int:
        """
        Get a deterministic seed for reproducible random events at each tick.
        Uses the tick number to ensure consistent random behavior.
        """
        # Use a combination of start date hash and tick number for reproducibility
        seed_base = hash(self.start_date.isoformat())
        return (seed_base + tick_number * 1103515245 + 12345) & 0x7FFFFFFF