"""
State Serialization for simulation pause/resume functionality.
Enables saving and loading simulation state to/from JSON.
"""

import json
from dataclasses import dataclass, field, asdict
from datetime import datetime, date
from typing import Any, Dict, List, Optional
from enum import Enum
import uuid


class VehicleStatus(Enum):
    """Vehicle status enum."""
    AVAILABLE = "available"
    IN_SERVICE = "in-service"
    MAINTENANCE = "maintenance"


@dataclass
class VehicleState:
    """Serialized vehicle state."""
    id: str
    model: str
    status: str
    health: int
    last_service: str
    revenue_generated: float
    total_service_hours: float
    maintenance_costs: float
    purchase_date: Optional[str] = None
    current_valuation: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'VehicleState':
        return cls(**data)


@dataclass
class TransactionState:
    """Serialized transaction state."""
    id: str
    date: str
    merchant: str
    category: str
    amount: float
    type: str
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class FinancialState:
    """Serialized financial state."""
    cash_balance: float
    total_revenue: float
    total_expenses: float


@dataclass
class SimulationState:
    """Complete simulation state for serialization."""
    simulation_id: str
    scenario_id: str
    user_id: str
    tick_number: int
    current_date: str
    vehicles: List[VehicleState]
    transactions: List[TransactionState]
    financials: FinancialState
    fleet_health: int
    operational_efficiency: int
    is_running: bool
    created_at: str
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "simulation_id": self.simulation_id,
            "scenario_id": self.scenario_id,
            "user_id": self.user_id,
            "tick_number": self.tick_number,
            "current_date": self.current_date,
            "vehicles": [v.to_dict() for v in self.vehicles],
            "transactions": [t.to_dict() for t in self.transactions],
            "financials": asdict(self.financials),
            "fleet_health": self.fleet_health,
            "operational_efficiency": self.operational_efficiency,
            "is_running": self.is_running,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SimulationState':
        return cls(
            simulation_id=data["simulation_id"],
            scenario_id=data["scenario_id"],
            user_id=data["user_id"],
            tick_number=data["tick_number"],
            current_date=data["current_date"],
            vehicles=[VehicleState.from_dict(v) for v in data["vehicles"]],
            transactions=[TransactionState.from_dict(t) for t in data["transactions"]],
            financials=FinancialState(**data["financials"]),
            fleet_health=data["fleet_health"],
            operational_efficiency=data["operational_efficiency"],
            is_running=data["is_running"],
            created_at=data["created_at"],
            updated_at=data.get("updated_at", datetime.now().isoformat())
        )


class StateSerializer:
    """
    Handles serialization and deserialization of simulation state.
    """
    
    @staticmethod
    def serialize(state: SimulationState) -> str:
        """Serialize simulation state to JSON string."""
        return json.dumps(state.to_dict(), indent=2)
    
    @staticmethod
    def deserialize(json_str: str) -> SimulationState:
        """Deserialize simulation state from JSON string."""
        data = json.loads(json_str)
        return SimulationState.from_dict(data)
    
    @staticmethod
    def to_json_bytes(state: SimulationState) -> bytes:
        """Serialize to JSON bytes for storage."""
        return StateSerializer.serialize(state).encode('utf-8')
    
    @staticmethod
    def from_json_bytes(data: bytes) -> SimulationState:
        """Deserialize from JSON bytes."""
        return StateSerializer.deserialize(data.decode('utf-8'))
    
    @staticmethod
    def validate_state(state: SimulationState) -> List[str]:
        """Validate simulation state integrity. Returns list of errors."""
        errors = []
        
        if state.tick_number < 0:
            errors.append("tick_number cannot be negative")
        
        for vehicle in state.vehicles:
            if not (0 <= vehicle.health <= 100):
                errors.append(f"Vehicle {vehicle.id} has invalid health: {vehicle.health}")
        
        if state.financials.cash_balance < 0:
            errors.append("Cash balance cannot be negative")
        
        return errors