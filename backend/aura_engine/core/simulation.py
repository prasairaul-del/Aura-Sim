"""
Main Simulation Engine for Aura-Sim.
Coordinats all simulation components and manages the simulation lifecycle.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import random

from .event_bus import EventBus, EventType, SimulationEvent
from .time_manager import TimeManager, TimeAcceleration, SimulationState as SimState
from .state_serializer import StateSerializer, SimulationState as SerializedState, VehicleState, FinancialState


@dataclass
class SimulationMetrics:
    """Key performance metrics for a simulation snapshot."""
    cash_balance: float
    daily_revenue: float
    daily_expenses: float
    active_vehicles: int
    fleet_utilization: float
    fleet_health: int
    operational_efficiency: int
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "cash_balance": self.cash_balance,
            "daily_revenue": self.daily_revenue,
            "daily_expenses": self.daily_expenses,
            "active_vehicles": self.active_vehicles,
            "fleet_utilization": self.fleet_utilization,
            "fleet_health": self.fleet_health,
            "operational_efficiency": self.operational_efficiency
        }


@dataclass
class SimulationSnapshot:
    """Snapshot of simulation state after a tick."""
    tick_number: int
    date: datetime
    metrics: SimulationMetrics
    events: List[SimulationEvent]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tick_number": self.tick_number,
            "date": self.date.isoformat(),
            "metrics": self.metrics.to_dict(),
            "events": [
                {
                    "type": e.event_type.value,
                    "timestamp": e.timestamp.isoformat(),
                    "payload": e.payload
                }
                for e in self.events
            ]
        }


class SimulationEngine:
    """
    Main simulation engine for fleet simulation.
    Handles vehicle management, economics, and time progression.
    """
    
    def __init__(self, scenario_id: str, user_id: str, start_date: Optional[datetime] = None):
        self.scenario_id = scenario_id
        self.user_id = user_id
        self.simulation_id = f"sim_{scenario_id}_{datetime.now().timestamp()}"
        
        # Core components
        self.time_manager = TimeManager(start_date)
        self.event_bus = EventBus()
        self.state_serializer = StateSerializer()
        
        # State
        self.vehicles: List[VehicleState] = []
        self.transactions: List[Dict[str, Any]] = []
        self.cash_balance: float = 1250000.0  # Default starting balance
        self.fleet_health: int = 100
        self.operational_efficiency: int = 100
        self.current_state = SimState.RUNNING
        
        # Metrics tracking
        self.daily_revenue: float = 0.0
        self.daily_expenses: float = 0.0
        self.tick_events: List[SimulationEvent] = []
        
        # Configuration
        self.max_vehicles = 500
        self.seed_base = hash(start_date.isoformat() if start_date else "default")
        
        # Hooks for external integration
        self._on_tick_callbacks: List[callable] = []
    
    def add_vehicle(self, vehicle: VehicleState) -> str:
        """Add a vehicle to the simulation."""
        if len(self.vehicles) >= self.max_vehicles:
            raise ValueError(f"Maximum vehicle limit reached: {self.max_vehicles}")
        
        self.vehicles.append(vehicle)
        return vehicle.id
    
    def remove_vehicle(self, vehicle_id: str) -> Optional[VehicleState]:
        """Remove a vehicle from the simulation."""
        for i, v in enumerate(self.vehicles):
            if v.id == vehicle_id:
                return self.vehicles.pop(i)
        return None
    
    def tick(self, days: int = 1) -> SimulationSnapshot:
        """
        Advance simulation by N days.
        Returns a snapshot of the current state.
        """
        if self.current_state != SimState.RUNNING:
            raise RuntimeError("Simulation is not running")
        
        # Reset daily metrics
        self.daily_revenue = 0.0
        self.daily_expenses = 0.0
        self.tick_events = []
        
        # Get deterministic seed for this tick
        seed = self.time_manager.get_seed_for_tick(self.time_manager.tick_count + 1)
        rng = random.Random(seed)
        
        # Update time
        sim_time = self.time_manager.tick(days)
        
        # Process each vehicle
        for vehicle in self.vehicles:
            self._process_vehicle(vehicle, rng)
        
        # Calculate fleet metrics
        self._update_fleet_metrics()
        
        # Add random transactions
        self._generate_transactions(rng)
        
        # Create snapshot
        metrics = SimulationMetrics(
            cash_balance=self.cash_balance,
            daily_revenue=self.daily_revenue,
            daily_expenses=self.daily_expenses,
            active_vehicles=len([v for v in self.vehicles if v.status == "in-service"]),
            fleet_utilization=self._calculate_fleet_utilization(),
            fleet_health=self.fleet_health,
            operational_efficiency=self.operational_efficiency
        )
        
        snapshot = SimulationSnapshot(
            tick_number=sim_time.tick_number,
            date=sim_time.current_date,
            metrics=metrics,
            events=self.tick_events.copy()
        )
        
        # Notify callbacks
        for callback in self._on_tick_callbacks:
            callback(snapshot)
        
        return snapshot
    
    def pause(self) -> None:
        """Pause the simulation."""
        self.current_state = SimState.PAUSED
    
    def resume(self) -> None:
        """Resume a paused simulation."""
        self.current_state = SimState.RUNNING
    
    def stop(self) -> None:
        """Stop the simulation."""
        self.current_state = SimState.STOPPED
    
    def get_snapshot(self) -> SimulationSnapshot:
        """Get current simulation snapshot without advancing time."""
        metrics = SimulationMetrics(
            cash_balance=self.cash_balance,
            daily_revenue=self.daily_revenue,
            daily_expenses=self.daily_expenses,
            active_vehicles=len([v for v in self.vehicles if v.status == "in-service"]),
            fleet_utilization=self._calculate_fleet_utilization(),
            fleet_health=self.fleet_health,
            operational_efficiency=self.operational_efficiency
        )
        
        return SimulationSnapshot(
            tick_number=self.time_manager.tick_count,
            date=self.time_manager.current_date,
            metrics=metrics,
            events=self.tick_events.copy()
        )
    
    def get_metrics(self) -> SimulationMetrics:
        """Calculate current KPIs."""
        return SimulationMetrics(
            cash_balance=self.cash_balance,
            daily_revenue=self.daily_revenue,
            daily_expenses=self.daily_expenses,
            active_vehicles=len([v for v in self.vehicles if v.status == "in-service"]),
            fleet_utilization=self._calculate_fleet_utilization(),
            fleet_health=self.fleet_health,
            operational_efficiency=self.operational_efficiency
        )
    
    def serialize_state(self) -> SerializedState:
        """Serialize current state for persistence."""
        return SerializedState(
            simulation_id=self.simulation_id,
            scenario_id=self.scenario_id,
            user_id=self.user_id,
            tick_number=self.time_manager.tick_count,
            current_date=self.time_manager.current_date.isoformat(),
            vehicles=self.vehicles,
            transactions=[{"id": t.get("id", ""), **t} for t in self.transactions[:100]],  # Limit
            financials=FinancialState(
                cash_balance=self.cash_balance,
                total_revenue=sum(t.get("amount", 0) for t in self.transactions if t.get("type") == "income"),
                total_expenses=abs(sum(t.get("amount", 0) for t in self.transactions if t.get("type") == "expense"))
            ),
            fleet_health=self.fleet_health,
            operational_efficiency=self.operational_efficiency,
            is_running=self.current_state == SimState.RUNNING,
            created_at=datetime.now().isoformat()
        )
    
    def load_state(self, state: SerializedState) -> None:
        """Load simulation state from serialized data."""
        self.simulation_id = state.simulation_id
        self.time_manager.tick_count = state.tick_number
        self.time_manager.current_date = datetime.fromisoformat(state.current_date)
        self.vehicles = state.vehicles
        self.transactions = [t for t in state.transactions]
        self.cash_balance = state.financials.cash_balance
        self.fleet_health = state.fleet_health
        self.operational_efficiency = state.operational_efficiency
        self.current_state = SimState.RUNNING if state.is_running else SimState.PAUSED
    
    def set_acceleration(self, acceleration: TimeAcceleration) -> None:
        """Set time acceleration factor."""
        self.time_manager.set_acceleration(acceleration)
    
    def on_tick(self, callback: callable) -> None:
        """Register a callback to be called after each tick."""
        self._on_tick_callbacks.append(callback)
    
    # Private methods
    
    def _process_vehicle(self, vehicle: VehicleState, rng: random.Random) -> None:
        """Process a single vehicle for a tick."""
        # Health decay when in service
        if vehicle.status == "in-service":
            health_change = -rng.uniform(0.1, 1.0)
            vehicle.health = max(0, min(100, vehicle.health + health_change))
            vehicle.total_service_hours += 1 / 365  # Increment service hours
            
            # Generate revenue
            revenue = rng.uniform(500, 3000)
            vehicle.revenue_generated += revenue
            self.daily_revenue += revenue
            
            # Chance to enter maintenance
            if vehicle.health < 30 and rng.random() < 0.1:
                vehicle.status = "maintenance"
                self.event_bus.publish(SimulationEvent(
                    id="",
                    event_type=EventType.VEHICLE_BREAKDOWN,
                    timestamp=datetime.now(),
                    payload={"vehicle_id": vehicle.id, "model": vehicle.model}
                ))
        
        # Maintenance recovery
        elif vehicle.status == "maintenance":
            vehicle.health = min(100, vehicle.health + 15)
            if vehicle.health >= 100:
                vehicle.status = "available"
                self.event_bus.publish(SimulationEvent(
                    id="",
                    event_type=EventType.SERVICE_COMPLETED,
                    timestamp=datetime.now(),
                    payload={"vehicle_id": vehicle.id}
                ))
        
        # Random chance to enter service
        elif vehicle.status == "available" and rng.random() < 0.3:
            vehicle.status = "in-service"
    
    def _update_fleet_metrics(self) -> None:
        """Update fleet-wide metrics."""
        if self.vehicles:
            total_health = sum(v.health for v in self.vehicles)
            self.fleet_health = int(total_health / len(self.vehicles))
            
            in_service = len([v for v in self.vehicles if v.status == "in-service"])
            self.operational_efficiency = int((in_service / len(self.vehicles)) * 100)
        else:
            self.fleet_health = 0
            self.operational_efficiency = 0
    
    def _calculate_fleet_utilization(self) -> float:
        """Calculate fleet utilization percentage."""
        if not self.vehicles:
            return 0.0
        in_service = len([v for v in self.vehicles if v.status == "in-service"])
        return (in_service / len(self.vehicles)) * 100
    
    def _generate_transactions(self, rng: random.Random) -> None:
        """Generate random transactions for activity."""
        if rng.random() < 0.7:  # 70% chance of transaction
            is_income = rng.random() > 0.3
            amount = rng.uniform(100, 2000) if is_income else rng.uniform(50, 500)
            
            transaction = {
                "id": f"tx_{rng.randint(10000, 99999)}",
                "date": datetime.now().isoformat(),
                "merchant": "VIP Client" if is_income else "Fuel & Logistics",
                "category": "VIP Services" if is_income else "Operations",
                "amount": amount,
                "type": "income" if is_income else "expense"
            }
            
            self.transactions.insert(0, transaction)
            self.cash_balance += amount if is_income else -amount
            
            if is_income:
                self.event_bus.publish(SimulationEvent(
                    id="",
                    event_type=EventType.PAYMENT_RECEIVED,
                    timestamp=datetime.now(),
                    payload={"amount": amount}
                ))