"""
Performance tracking for vehicle utilization statistics.
"""

from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field


@dataclass
class VehiclePerformance:
    """Performance metrics for a single vehicle."""
    vehicle_id: str
    model: str
    total_revenue: float = 0.0
    service_hours: float = 0.0
    maintenance_costs: float = 0.0
    health_degradation: float = 0.0
    status_changes: int = 0
    downtime_days: int = 0
    
    @property
    def revenue_per_hour(self) -> float:
        return self.total_revenue / self.service_hours if self.service_hours > 0 else 0
    
    @property
    def maintenance_ratio(self) -> float:
        return self.maintenance_costs / self.total_revenue if self.total_revenue > 0 else 0


class PerformanceTracker:
    """
    Tracks vehicle performance metrics throughout simulation.
    """
    
    def __init__(self):
        self.vehicles: Dict[str, VehiclePerformance] = {}
        self._last_status: Dict[str, str] = {}
        self._status_change_counts: Dict[str, int] = {}
    
    def track_vehicle(self, vehicle_state: Dict[str, Any]) -> None:
        """Track a vehicle's current state."""
        vid = vehicle_state.get("id", "")
        if not vid:
            return
        
        if vid not in self.vehicles:
            self.vehicles[vid] = VehiclePerformance(
                vehicle_id=vid,
                model=vehicle_state.get("model", "")
            )
        
        v = self.vehicles[vid]
        current_status = vehicle_state.get("status", "available")
        
        # Track status changes
        if vid in self._last_status and self._last_status[vid] != current_status:
            self._status_change_counts[vid] = self._status_change_counts.get(vid, 0) + 1
            v.status_changes = self._status_change_counts[vid]
        
        self._last_status[vid] = current_status
        
        # Track downtime
        if current_status == "maintenance":
            v.downtime_days += 1
    
    def update_revenue(self, vehicle_id: str, revenue: float) -> None:
        """Update vehicle revenue."""
        if vehicle_id in self.vehicles:
            self.vehicles[vehicle_id].total_revenue += revenue
    
    def update_service_hours(self, vehicle_id: str, hours: float) -> None:
        """Update vehicle service hours."""
        if vehicle_id in self.vehicles:
            self.vehicles[vehicle_id].service_hours += hours
    
    def update_maintenance_cost(self, vehicle_id: str, cost: float) -> None:
        """Update vehicle maintenance costs."""
        if vehicle_id in self.vehicles:
            self.vehicles[vehicle_id].maintenance_costs += cost
    
    def update_health(self, vehicle_id: str, old_health: float, new_health: float) -> None:
        """Track health degradation."""
        if vehicle_id in self.vehicles:
            degradation = old_health - new_health
            if degradation > 0:
                self.vehicles[vehicle_id].health_degradation += degradation
    
    def get_utilization_rates(self) -> Dict[str, float]:
        """Get utilization rates for all vehicles."""
        rates = {}
        for vid, perf in self.vehicles.items():
            # Utilization = hours in service / total hours
            rates[vid] = perf.service_hours / max(1, perf.service_hours + perf.downtime_days * 8)
        return rates
    
    def get_top_performers(self, metric: str = "revenue", limit: int = 5) -> List[Dict[str, Any]]:
        """Get top performing vehicles by metric."""
        sorted_vehicles = sorted(
            self.vehicles.values(),
            key=lambda v: getattr(v, metric, 0),
            reverse=True
        )
        
        return [
            {
                "vehicle_id": v.vehicle_id,
                "model": v.model,
                **{metric: getattr(v, metric)}
            }
            for v in sorted_vehicles[:limit]
        ]
    
    def get_underperformers(self, metric: str = "revenue", limit: int = 5) -> List[Dict[str, Any]]:
        """Get lowest performing vehicles by metric."""
        sorted_vehicles = sorted(
            self.vehicles.values(),
            key=lambda v: getattr(v, metric, 0)
        )
        
        return [
            {
                "vehicle_id": v.vehicle_id,
                "model": v.model,
                **{metric: getattr(v, metric)}
            }
            for v in sorted_vehicles[:limit]
        ]
    
    def get_fleet_summary(self) -> Dict[str, Any]:
        """Get overall fleet performance summary."""
        if not self.vehicles:
            return {"total_vehicles": 0}
        
        total_revenue = sum(v.total_revenue for v in self.vehicles.values())
        total_hours = sum(v.service_hours for v in self.vehicles.values())
        total_maintenance = sum(v.maintenance_costs for v in self.vehicles.values())
        total_downtime = sum(v.downtime_days for v in self.vehicles.values())
        
        return {
            "total_vehicles": len(self.vehicles),
            "total_revenue": round(total_revenue, 2),
            "total_service_hours": round(total_hours, 2),
            "total_maintenance_cost": round(total_maintenance, 2),
            "average_revenue_per_vehicle": round(total_revenue / len(self.vehicles), 2),
            "average_utilization": round(total_hours / max(1, total_hours + total_downtime * 8) * 100, 2),
            "maintenance_ratio": round(total_maintenance / max(1, total_revenue) * 100, 2)
        }
    
    def reset(self) -> None:
        """Reset all tracking data."""
        self.vehicles = {}
        self._last_status = {}
        self._status_change_counts = {}