"""
Input validation utilities.
"""

from typing import Dict, Any, List, Optional


class ValidationError(Exception):
    """Raised when validation fails."""
    pass


def validate_simulation_state(state: Dict[str, Any]) -> List[str]:
    """
    Validate simulation state integrity.
    Returns list of validation errors.
    """
    errors = []
    
    # Check required fields
    required_fields = ["tick_number", "current_date", "vehicles", "financials"]
    for field in required_fields:
        if field not in state:
            errors.append(f"Missing required field: {field}")
    
    # Validate tick number
    if "tick_number" in state and state["tick_number"] < 0:
        errors.append("tick_number cannot be negative")
    
    # Validate vehicles
    if "vehicles" in state:
        for i, vehicle in enumerate(state["vehicles"]):
            if "health" in vehicle and not (0 <= vehicle["health"] <= 100):
                errors.append(f"Vehicle {i} has invalid health: {vehicle['health']}")
    
    # Validate financials
    if "financials" in state:
        if state["financials"].get("cash_balance", 0) < 0:
            errors.append("Cash balance cannot be negative")
    
    return errors


def validate_scenario_config(config: Dict[str, Any]) -> List[str]:
    """
    Validate scenario configuration.
    Returns list of validation errors.
    """
    errors = []
    
    # Check required fields
    if "name" not in config:
        errors.append("Scenario must have a name")
    
    if "vehicles" in config:
        total_vehicles = sum(v.get("count", 1) for v in config["vehicles"])
        if total_vehicles > 500:
            errors.append("Maximum 500 vehicles per scenario")
    
    if "initial_balance" in config:
        if config["initial_balance"] < 1000:
            errors.append("Minimum starting balance is $1,000")
    
    return errors