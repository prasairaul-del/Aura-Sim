"""
Aura-Sim Python Simulation Engine
A high-performance fleet simulation engine for the SaaS platform.
"""

__version__ = "0.1.0"

# Import main components
from .core import (
    SimulationEngine,
    SimulationMetrics,
    SimulationSnapshot,
    TimeManager,
    TimeAcceleration,
    SimulationState,
    EventBus,
    EventType,
    SimulationEvent,
)
from .vehicles import (
    VehicleFactory,
    Limousine,
    Sedan,
    SUV,
    VehicleType,
    VehicleStatus,
)
from .economics import (
    PricingModels,
    Depreciation,
    Maintenance,
    MarketDemand,
)
from .scenarios import (
    ScenarioLoader,
    CustomScenario,
)
from .analytics import (
    MetricsCollector,
    FinancialReporter,
    PerformanceTracker,
)

__all__ = [
    # Core
    "SimulationEngine",
    "SimulationMetrics",
    "SimulationSnapshot",
    "TimeManager",
    "TimeAcceleration",
    "SimulationState",
    "EventBus",
    "EventType",
    "SimulationEvent",
    # Vehicles
    "VehicleFactory",
    "Limousine",
    "Sedan",
    "SUV",
    "VehicleType",
    "VehicleStatus",
    # Economics
    "PricingModels",
    "Depreciation",
    "Maintenance",
    "MarketDemand",
    # Scenarios
    "ScenarioLoader",
    "CustomScenario",
    # Analytics
    "MetricsCollector",
    "FinancialReporter",
    "PerformanceTracker",
]