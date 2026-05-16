"""
Financial reporting for simulation P&L, cash flow, and other reports.
"""

from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import csv
import io


@dataclass
class Transaction:
    """Financial transaction record."""
    date: datetime
    description: str
    category: str
    amount: float
    type: str  # income or expense


class FinancialReporter:
    """
    Generates financial reports from simulation data.
    """
    
    def __init__(self):
        self.transactions: List[Transaction] = []
        self.initial_balance: float = 1250000.0
    
    def record_transaction(
        self,
        date: datetime,
        description: str,
        category: str,
        amount: float,
        transaction_type: str
    ) -> None:
        """Record a financial transaction."""
        self.transactions.append(Transaction(
            date=date,
            description=description,
            category=category,
            amount=amount,
            type=transaction_type
        ))
    
    def get_profit_and_loss(self) -> Dict[str, Any]:
        """Generate P&L statement."""
        income = [t for t in self.transactions if t.type == "income"]
        expenses = [t for t in self.transactions if t.type == "expense"]
        
        total_income = sum(t.amount for t in income)
        total_expenses = sum(t.amount for t in expenses)
        
        # Group by category
        income_by_category = {}
        expense_by_category = {}
        
        for t in income:
            category = t.category
            income_by_category[category] = income_by_category.get(category, 0) + t.amount
        
        for t in expenses:
            category = t.category
            expense_by_category[category] = expense_by_category.get(category, 0) + t.amount
        
        return {
            "period": "simulation",
            "income": {
                "total": round(total_income, 2),
                "by_category": {k: round(v, 2) for k, v in income_by_category.items()}
            },
            "expenses": {
                "total": round(total_expenses, 2),
                "by_category": {k: round(v, 2) for k, v in expense_by_category.items()}
            },
            "net_profit": round(total_income - total_expenses, 2),
            "margin": round((total_income - total_expenses) / total_income * 100, 2) if total_income > 0 else 0
        }
    
    def get_cash_flow(self, days: Optional[int] = None) -> Dict[str, Any]:
        """Generate cash flow statement."""
        if days:
            cutoff = datetime.now() - __import__('datetime').timedelta(days=days)
            filtered = [t for t in self.transactions if t.date >= cutoff]
        else:
            filtered = self.transactions
        
        daily_flow = {}
        running_balance = self.initial_balance
        
        for t in sorted(filtered, key=lambda x: x.date):
            date_str = t.date.strftime("%Y-%m-%d")
            if date_str not in daily_flow:
                daily_flow[date_str] = {
                    "inflow": 0.0,
                    "outflow": 0.0,
                    "balance": running_balance
                }
            
            if t.type == "income":
                daily_flow[date_str]["inflow"] += t.amount
            else:
                daily_flow[date_str]["outflow"] += t.amount
            
            running_balance += (t.amount if t.type == "income" else -t.amount)
            daily_flow[date_str]["balance"] = running_balance
        
        return {
            "daily": daily_flow,
            "total_inflow": sum(t.amount for t in filtered if t.type == "income"),
            "total_outflow": sum(t.amount for t in filtered if t.type == "expense"),
            "final_balance": running_balance
        }
    
    def export_csv(self) -> str:
        """Export transactions as CSV."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["Date", "Description", "Category", "Amount", "Type"])
        for t in sorted(self.transactions, key=lambda x: x.date):
            writer.writerow([
                t.date.strftime("%Y-%m-%d"),
                t.description,
                t.category,
                round(t.amount, 2),
                t.type
            ])
        
        return output.getvalue()
    
    def get_summary(self) -> Dict[str, Any]:
        """Get financial summary."""
        pl = self.get_profit_and_loss()
        cf = self.get_cash_flow(days=30)
        
        return {
            "current_balance": cf["final_balance"],
            "total_transactions": len(self.transactions),
            "net_profit": pl["net_profit"],
            "profit_margin": pl["margin"],
            "recent_inflow": cf["total_inflow"],
            "recent_outflow": cf["total_outflow"]
        }