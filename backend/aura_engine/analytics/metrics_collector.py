"""
Metrics collector for real-time KPI calculation.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
import statistics


@dataclass
class KPIMetrics:
    """Key Performance Indicators for the simulation."""
    # Financial metrics
    cash_balance: float
    total_revenue: float
    total_expenses: float
    net_profit: float
    profit_margin: float
    
    # Fleet metrics
    total_vehicles: int
    active_vehicles: int
    fleet_health: float
    utilization_rate: float
    
    # Operational metrics
    days_simulated: int
    daily_revenue: float
    daily_expenses: float
    
    # Calculated metrics
    roi: float  # Return on Investment
    revenue_per_vehicle: float
    profit_per_day: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "cash_balance": round(self.cash_balance, 2),
            "total_revenue": round(self.total_revenue, 2),
            "total_expenses": round(self.total_expenses, 2),
            "net_profit": round(self.net_profit, 2),
            "profit_margin": round(self.profit_margin * 100, 2),
            "total_vehicles": self.total_vehicles,
            "active_vehicles": self.active_vehicles,
            "fleet_health": round(self.fleet_health, 1),
            "utilization_rate": round(self.utilization_rate * 100, 2),
            "days_simulated": self.days_simulated,
            "roi": round(self.roi * 100, 2),
            "revenue_per_vehicle": round(self.revenue_per_vehicle, 2),
        }


class MetricsCollector:
    """
    Collects and calculates simulation metrics in real-time.
    """
    
    def __init__(self, initial_balance: float = 1250000.0):
        self.initial_balance = initial_balance
        self.current_balance = initial_balance
        self.total_revenue = 0.0
        self.total_expenses = 0.0
        self.daily_revenues: List[float] = []
        self.daily_expenses: List[float] = []
        self.vehicle_metrics: Dict[str, Dict] = {}
        self._tick_count = 0
    
    def record_tick(
        self,
        daily_revenue: float,
        daily_expenses: float,
        vehicle_states: List[Dict[str, Any]]
    ) -> KPIMetrics:
        """
        Record metrics from a simulation tick.
        """
        self._tick_count += 1
        self.daily_revenues.append(daily_revenue)
        self.daily_expenses.append(daily_expenses)
        self.current_balance += daily_revenue - daily_expenses
        self.total_revenue += daily_revenue
        self.total_expenses += daily_expenses
        
        # Record vehicle states
        for v in vehicle_states:
            vid = v.get("id", "")
            if vid:
                self.vehicle_metrics[vid] = v
        
        return self.calculate_kpis(len(vehicle_states))
    
    def calculate_kpis(self, total_vehicles: int = 0) -> KPIMetrics:
        """
        Calculate current Key Performance Indicators.
        """
        # Fleet metrics
        if self.vehicle_metrics:
            total_health = sum(v.get("health", 100) for v in self.vehicle_metrics.values())
            avg_health = total_health / len(self.vehicle_metrics) if self.vehicle_metrics else 100
            active_count = sum(1 for v in self.vehicle_metrics.values() if v.get("status") == "in-service")
            utilization = active_count / len(self.vehicle_metrics) if self.vehicle_metrics else 0
        else:
            avg_health = 100
            active_count = 0
            utilization = 0
        
        # Financial metrics
        net_profit = self.total_revenue - self.total_expenses
        profit_margin = net_profit / self.total_revenue if self.total_revenue > 0 else 0
        
        # ROI calculation
        initial_investment = self.initial_balance
        roi = (net_profit + self.current_balance - self.initial_balance) / initial_investment if initial_investment > 0 else 0
        
        return KPIMetrics(
            cash_balance=self.current_balance,
            total_revenue=self.total_revenue,
            total_expenses=self.total_expenses,
            net_profit=net_profit,
            profit_margin=profit_margin,
            total_vehicles=total_vehicles,
            active_vehicles=active_count,
            fleet_health=avg_health,
            utilization_rate=utilization,
            days_simulated=self._tick_count,
            daily_revenue=self.daily_revenues[-1] if self.daily_revenues else 0,
            daily_expenses=self.daily_expenses[-1] if self.daily_expenses else 0,
            roi=roi,
            revenue_per_vehicle=self.total_revenue / total_vehicles if total_vehicles > 0 else 0,
            profit_per_day=net_profit / self._tick_count if self._tick_count > 0 else 0
        )
    
    def get_trend(self, metric: str, window: int = 7) -> str:
        """
        Get trend direction for a metric.
        Returns 'up', 'down', or 'stable'.
        """
        if metric == "revenue":
            data = self.daily_revenues
        elif metric == "expenses":
            data = self.daily_expenses
        else:
            return "stable"
        
        if len(data) < 2:
            return "stable"
        
        recent = data[-window:] if len(data) >= window else data
        if len(recent) < 2:
            return "stable"
        
        avg_recent = statistics.mean(recent[:-1])
        current = recent[-1]
        
        diff = current - avg_recent
        if diff > avg_recent * 0.1:
            return "up"
        elif diff < -avg_recent * 0.1:
            return "down"
        return "stable"
    
    def reset(self) -> None:
        """Reset all metrics."""
        self.current_balance = self.initial_balance
        self.total_revenue = 0.0
        self.total_expenses = 0.0
        self.daily_revenues = []
        self.daily_expenses = []
        self.vehicle_metrics = {}
        self._tick_count = 0