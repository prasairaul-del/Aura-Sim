"""
Core simulation engine module.
Provides simulation engine, time management, state serialization, and event bus.
"""

from .simulation import (
    SimulationEngine,
    SimulationMetrics,
    SimulationSnapshot,
)
from .time_manager import (
    TimeManager,
    TimeAcceleration,
    SimulationState,
    SimulationTime,
)
from .state_serializer import (
    StateSerializer,
    SimulationState as SerializedState,
    VehicleState,
    FinancialState,
)
from .event_bus import (
    EventBus,
    EventType,
    SimulationEvent,
)

__all__ = [
    "SimulationEngine",
    "SimulationMetrics",
    "SimulationSnapshot",
    "TimeManager",
    "TimeAcceleration",
    "SimulationState",
    "SimulationTime",
    "StateSerializer",
    "SerializedState",
    "VehicleState",
    "FinancialState",
    "EventBus",
    "EventType",
    "SimulationEvent",
]