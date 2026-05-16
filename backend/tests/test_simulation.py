"""
Unit tests for the Simulation Engine.
"""

import pytest
from datetime import datetime
import sys
sys.path.insert(0, '..')

from aura_engine.core.simulation import SimulationEngine, SimulationMetrics
from aura_engine.core.time_manager import TimeManager, TimeAcceleration
from aura_engine.core.event_bus import EventBus, EventType, SimulationEvent
from aura_engine.core.state_serializer import StateSerializer, VehicleState, FinancialState, SimulationState as SerializedState
from aura_engine.vehicles.base_vehicle import VehicleType, VehicleStatus
from aura_engine.vehicles.vehicle_factory import VehicleFactory


class TestSimulationEngine:
    """Tests for the main simulation engine."""
    
    def test_engine_initialization(self):
        """Test engine creates with correct initial state."""
        engine = SimulationEngine(
            scenario_id="test-scenario",
            user_id="test-user"
        )
        
        assert engine.scenario_id == "test-scenario"
        assert engine.user_id == "test-user"
        assert engine.current_state == "running"
        assert engine.cash_balance == 1250000.0
    
    def test_add_and_remove_vehicle(self):
        """Test vehicle management."""
        engine = SimulationEngine("test", "user")
        
        vehicle = VehicleFactory.create_vehicle(VehicleType.SEDAN)
        vehicle_id = engine.add_vehicle(vehicle)
        
        assert len(engine.vehicles) == 1
        assert engine.vehicles[0].id == vehicle_id
        
        removed = engine.remove_vehicle(vehicle_id)
        assert removed is not None
        assert len(engine.vehicles) == 0
    
    def test_tick_advances_time(self):
        """Test that tick advances simulation time."""
        engine = SimulationEngine("test", "user", start_date=datetime(2024, 1, 1))
        initial_tick = engine.time_manager.tick_count
        
        snapshot = engine.tick()
        
        assert engine.time_manager.tick_count == initial_tick + 1
        assert snapshot.tick_number == initial_tick + 1
        assert snapshot.date > datetime(2024, 1, 1)
    
    def test_tick_generates_revenue(self):
        """Test that tick generates revenue."""
        engine = SimulationEngine("test", "user")
        
        vehicle = VehicleFactory.create_vehicle(VehicleType.LIMOUSINE)
        engine.add_vehicle(vehicle)
        
        initial_balance = engine.cash_balance
        snapshot = engine.tick()
        
        assert engine.cash_balance >= initial_balance or snapshot.metrics.daily_revenue > 0
    
    def test_pause_and_resume(self):
        """Test simulation pause and resume."""
        engine = SimulationEngine("test", "user")
        
        assert engine.current_state == "running"
        
        engine.pause()
        assert engine.current_state == "paused"
        
        with pytest.raises(RuntimeError):
            engine.tick()
        
        engine.resume()
        assert engine.current_state == "running"
        engine.tick()  # Should work now
    
    def test_get_metrics(self):
        """Test KPI metrics calculation."""
        engine = SimulationEngine("test", "user")
        
        vehicle = VehicleFactory.create_vehicle(VehicleType.SEDAN)
        engine.add_vehicle(vehicle)
        engine.tick()
        
        metrics = engine.get_metrics()
        
        assert isinstance(metrics, SimulationMetrics)
        assert metrics.total_balance >= 0
        assert 0 <= metrics.fleet_health <= 100
    
    def test_serialize_state(self):
        """Test state serialization."""
        engine = SimulationEngine("test", "user")
        
        vehicle = VehicleFactory.create_vehicle(VehicleType.SEDAN)
        engine.add_vehicle(vehicle)
        engine.tick()
        
        state = engine.serialize_state()
        
        assert state.scenario_id == "test"
        assert state.vehicles is not None
        assert state.tick_number > 0
    
    def test_load_state(self):
        """Test state deserialization."""
        engine1 = SimulationEngine("test", "user")
        
        vehicle = VehicleFactory.create_vehicle(VehicleType.SEDAN)
        engine1.add_vehicle(vehicle)
        engine1.tick()
        
        state = engine1.serialize_state()
        
        engine2 = SimulationEngine("test2", "user2")
        engine2.load_state(state)
        
        assert engine2.time_manager.tick_count == engine1.time_manager.tick_count


class TestVehicleFactory:
    """Tests for vehicle factory."""
    
    def test_create_sedan(self):
        """Test sedan creation."""
        vehicle = VehicleFactory.create_vehicle(VehicleType.SEDAN)
        
        assert vehicle.model is not None
        assert vehicle.health == 100
        assert vehicle.status == VehicleStatus.AVAILABLE
    
    def test_create_limousine(self):
        """Test limousine creation."""
        vehicle = VehicleFactory.create_vehicle(VehicleType.LIMOUSINE)
        
        assert vehicle.model is not None
        assert vehicle.purchase_price > 50000
    
    def test_create_suv(self):
        """Test SUV creation."""
        vehicle = VehicleFactory.create_vehicle(VehicleType.SUV)
        
        assert vehicle.model is not None
        assert vehicle.purchase_price > 60000
    
    def test_consistent_ids(self):
        """Test that each vehicle gets a unique ID."""
        v1 = VehicleFactory.create_vehicle(VehicleType.SEDAN)
        v2 = VehicleFactory.create_vehicle(VehicleType.SEDAN)
        
        assert v1.id != v2.id


class TestTimeManager:
    """Tests for time management."""
    
    def test_initial_time(self):
        """Test time manager starts at correct time."""
        tm = TimeManager(datetime(2024, 1, 1))
        
        assert tm.current_date == datetime(2024, 1, 1)
        assert tm.tick_count == 0
    
    def test_tick_increments_time(self):
        """Test tick advances time correctly."""
        tm = TimeManager(datetime(2024, 1, 1))
        
        result = tm.tick(5)
        
        assert result.current_date == datetime(2024, 1, 6)
        assert result.tick_number == 1
        assert result.simulated_days == 5
    
    def test_acceleration_intervals(self):
        """Test acceleration affects tick interval."""
        tm = TimeManager()
        
        normal_interval = tm.get_tick_interval_ms()
        tm.set_acceleration(TimeAcceleration.FAST)
        fast_interval = tm.get_tick_interval_ms()
        tm.set_acceleration(TimeAcceleration.ULTRA)
        ultra_interval = tm.get_tick_interval_ms()
        
        assert fast_interval < normal_interval
        assert ultra_interval < fast_interval


class TestEventBus:
    """Tests for event bus."""
    
    def test_publish_and_receive(self):
        """Test event publishing and receiving."""
        bus = EventBus()
        received = []
        
        def callback(event):
            received.append(event)
        
        bus.subscribe(EventType.PAYMENT_RECEIVED, callback)
        
        event = SimulationEvent(
            id="test-1",
            event_type=EventType.PAYMENT_RECEIVED,
            timestamp=datetime.now(),
            payload={"amount": 100}
        )
        bus.publish(event)
        
        assert len(received) == 1
        assert received[0].payload["amount"] == 100
    
    def test_event_history(self):
        """Test event history tracking."""
        bus = EventBus()
        
        for i in range(5):
            event = SimulationEvent(
                id=f"test-{i}",
                event_type=EventType.TICK_COMPLETED,
                timestamp=datetime.now(),
                payload={}
            )
            bus.publish(event)
        
        history = bus.get_events_since(datetime(2000, 1, 1))
        assert len(history) == 5


class TestDepreciation:
    """Tests for depreciation calculations."""
    
    def test_new_vehicle_value(self):
        """Test new vehicle retains full value."""
        from aura_engine.economics.depreciation import Depreciation
        
        value = Depreciation.calculate_value(
            purchase_price=100000,
            purchase_date=datetime.now(),
            current_date=datetime.now(),
            vehicle_type="sedan"
        )
        
        assert value > 90000  # Very little depreciation on day 1
    
    def test_old_vehicle_lower_value(self):
        """Test older vehicle has lower value."""
        from aura_engine.economics.depreciation import Depreciation
        
        purchase = datetime(2020, 1, 1)
        current = datetime(2024, 1, 1)
        
        value = Depreciation.calculate_value(
            purchase_price=100000,
            purchase_date=purchase,
            current_date=current,
            vehicle_type="sedan"
        )
        
        assert value < 100000  # Should be worth less after 4 years


if __name__ == "__main__":
    pytest.main([__file__, "-v"])