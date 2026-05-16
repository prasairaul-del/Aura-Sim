"""
Analytics routes for Aura-Sim API.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()


@router.get("/{scenario_id}/summary")
async def get_scenario_summary(
    scenario_id: str,
    current_user: dict = Depends(lambda: __import__("api.dependencies").dependencies.get_current_user)
):
    """
    Get scenario analytics summary.
    """
    return {
        "cash_balance": 1500000.0,
        "total_revenue": 1250000.0,
        "total_expenses": 450000.0,
        "net_profit": 800000.0,
        "fleet_health": 85,
        "utilization_rate": 68.5
    }