"""
Event Bus for internal simulation event handling.
Enables decoupled communication between simulation components.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional
import uuid


class EventType(Enum):
    """Types of simulation events."""
    VEHICLE_BREAKDOWN = "vehicle_breakdown"
    PAYMENT_RECEIVED = "payment_received"
    MAINTENANCE_DUE = "maintenance_due"
    VEHICLE_AVAILABLE = "vehicle_available"
    SERVICE_COMPLETED = "service_completed"
    MARKET_SHIFT = "market_shift"
    TICK_COMPLETED = "tick_completed"


@dataclass
class SimulationEvent:
    """Represents a simulation event."""
    id: str
    event_type: EventType
    timestamp: datetime
    payload: Dict[str, Any]
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())


class EventBus:
    """
    Simple event bus for internal simulation communication.
    Supports publishing and subscribing to simulation events.
    """
    
    def __init__(self):
        self._subscribers: Dict[EventType, List[Callable[[SimulationEvent], None]]] = {}
        self._event_history: List[SimulationEvent] = []
        self._max_history: int = 1000
    
    def subscribe(self, event_type: EventType, callback: Callable[[SimulationEvent], None]) -> str:
        """
        Subscribe to an event type.
        Returns a subscription ID for unsubscribing.
        """
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        
        self._subscribers[event_type].append(callback)
        return f"{event_type.value}_{len(self._subscribers[event_type])}"
    
    def unsubscribe(self, event_type: EventType, callback: Callable[[SimulationEvent], None]) -> bool:
        """Unsubscribe from an event type."""
        if event_type in self._subscribers:
            try:
                self._subscribers[event_type].remove(callback)
                return True
            except ValueError:
                pass
        return False
    
    def publish(self, event: SimulationEvent) -> None:
        """Publish an event to all subscribers."""
        # Store in history
        self._event_history.append(event)
        if len(self._event_history) > self._max_history:
            self._event_history = self._event_history[-self._max_history:]
        
        # Notify subscribers
        if event.event_type in self._subscribers:
            for callback in self._subscribers[event.event_type]:
                try:
                    callback(event)
                except Exception as e:
                    # Log error but don't crash simulation
                    print(f"Error in event callback: {e}")
    
    def get_events_since(self, timestamp: datetime) -> List[SimulationEvent]:
        """Get all events since a given timestamp."""
        return [e for e in self._event_history if e.timestamp >= timestamp]
    
    def clear_history(self) -> None:
        """Clear event history."""
        self._event_history = []