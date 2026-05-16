import React, { useState } from 'react'
import { useSimulationStore } from '../store/useSimulationStore'
import { SimpleCard } from './ui/GlassComponents'
import { formatCurrency } from '../lib/utils'
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Plus, Trash2, DollarSign } from 'lucide-react'

type BudgetCategory = 'Fleet' | 'Operations' | 'Marketing' | 'Staff' | 'VIP Services'

interface BudgetTarget {
  id: string
  category: BudgetCategory
  plannedAmount: number
  period: 'monthly' | 'quarterly' | 'yearly'
}

export const BudgetPlanning: React.FC = () => {
  const { transactions } = useSimulationStore()
  const [budgetTargets, setBudgetTargets] = useState<BudgetTarget[]>([
    { id: '1', category: 'Fleet', plannedAmount: 50000, period: 'monthly' },
    { id: '2', category: 'Operations', plannedAmount: 30000, period: 'monthly' },
    { id: '3', category: 'Marketing', plannedAmount: 15000, period: 'monthly' },
    { id: '4', category: 'Staff', plannedAmount: 25000, period: 'monthly' },
    { id: '5', category: 'VIP Services', plannedAmount: 10000, period: 'monthly' },
  ])
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [newBudget, setNewBudget] = useState<{ category: BudgetCategory; plannedAmount: number; period: 'monthly' | 'quarterly' | 'yearly' }>({
    category: 'Fleet',
    plannedAmount: 0,
    period: 'monthly',
  })

  // Calculate actual spending by category (expenses only)
  const getActualSpending = (category: BudgetCategory): number => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  // Calculate actual income by category
  const getActualIncome = (category: BudgetCategory): number => {
    return transactions
      .filter(t => t.category === category && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const handleAddBudget = () => {
    if (!newBudget.plannedAmount) return
    setBudgetTargets([...budgetTargets, { ...newBudget, id: Math.random().toString(36).substring(2, 9) }])
    setNewBudget({ category: 'Fleet', plannedAmount: 0, period: 'monthly' })
    setShowAddBudget(false)
  }

  const handleDeleteBudget = (id: string) => {
    setBudgetTargets(budgetTargets.filter(b => b.id !== id))
  }

  const getVariance = (planned: number, actual: number): { amount: number; percentage: number; status: 'under' | 'over' | 'on-track' } => {
    const amount = planned - actual
    const percentage = planned > 0 ? (Math.abs(amount) / planned) * 100 : 0
    let status: 'under' | 'over' | 'on-track' = 'on-track'
    if (amount < 0) status = 'over'
    else if (percentage > 10) status = 'under'
    return { amount, percentage, status }
  }

  const totalPlanned = budgetTargets.reduce((sum, b) => sum + b.plannedAmount, 0)
  const totalActual = budgetTargets.reduce((sum, b) => sum + getActualSpending(b.category), 0)
  const totalVariance = totalPlanned - totalActual

  return (
    <div className="space-y-6" id="budget">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Budget planning</h3>
          <p className="text-muted-foreground text-sm">Track planned vs actual spending across categories</p>
        </div>
        <button
          onClick={() => setShowAddBudget(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add budget target
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SimpleCard>
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Total planned</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalPlanned)}</p>
          <p className="text-xs text-muted-foreground mt-1">Monthly budget allocation</p>
        </SimpleCard>

        <SimpleCard>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Total actual</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalActual)}</p>
          <p className="text-xs text-muted-foreground mt-1">Actual spending to date</p>
        </SimpleCard>

        <SimpleCard>
          <div className="flex items-center justify-between mb-2">
            {totalVariance >= 0 ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">Variance</span>
          </div>
          <p className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalVariance >= 0 ? 'Under budget' : 'Over budget'}
          </p>
        </SimpleCard>
      </div>

      {/* Budget Breakdown Table */}
      <SimpleCard>
        <h4 className="text-sm font-semibold mb-4">Budget breakdown by category</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-xs text-muted-foreground">Category</th>
                <th className="text-right py-3 px-4 text-xs text-muted-foreground">Planned</th>
                <th className="text-right py-3 px-4 text-xs text-muted-foreground">Actual</th>
                <th className="text-right py-3 px-4 text-xs text-muted-foreground">Variance</th>
                <th className="text-center py-3 px-4 text-xs text-muted-foreground">Status</th>
                <th className="text-center py-3 px-4 text-xs text-muted-foreground">Progress</th>
                <th className="text-center py-3 px-4 text-xs text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {budgetTargets.map(budget => {
                const actual = getActualSpending(budget.category)
                const variance = getVariance(budget.plannedAmount, actual)
                const progressPercent = Math.min((actual / budget.plannedAmount) * 100, 100)

                return (
                  <tr key={budget.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium">{budget.category}</span>
                      <span className="text-xs text-muted-foreground ml-2 capitalize">({budget.period})</span>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">{formatCurrency(budget.plannedAmount)}</td>
                    <td className="text-right py-3 px-4 font-mono">{formatCurrency(actual)}</td>
                    <td className={`text-right py-3 px-4 font-mono ${variance.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)}
                    </td>
                    <td className="text-center py-3 px-4">
                      {variance.status === 'under' && <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />}
                      {variance.status === 'over' && <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />}
                      {variance.status === 'on-track' && <span className="text-xs text-muted-foreground">On track</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progressPercent > 90 ? 'bg-red-500' : progressPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 block text-center">{progressPercent.toFixed(0)}%</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-1.5 hover:bg-red-100 rounded text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Delete budget target"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SimpleCard>

      {/* Income vs Expense Summary */}
      <SimpleCard>
        <h4 className="text-sm font-semibold mb-4">Revenue vs expenses by category</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['Fleet', 'Operations', 'Marketing', 'Staff', 'VIP Services'] as BudgetCategory[]).map(category => {
            const income = getActualIncome(category)
            const expense = getActualSpending(category)
            const net = income - expense

            return (
              <div key={category} className="p-4 border rounded-lg">
                <h5 className="text-sm font-medium mb-3">{category}</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" /> Income
                    </span>
                    <span className="font-mono text-emerald-600">{formatCurrency(income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-red-500" /> Expenses
                    </span>
                    <span className="font-mono text-red-600">{formatCurrency(expense)}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between">
                    <span className="text-muted-foreground">Net</span>
                    <span className={`font-mono font-bold ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {net >= 0 ? '+' : ''}{formatCurrency(net)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SimpleCard>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <SimpleCard className="w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Add budget target</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Category</label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value as BudgetCategory })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Fleet">Fleet</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Staff">Staff</option>
                  <option value="VIP Services">VIP Services</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Period</label>
                <select
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as typeof newBudget.period })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Planned amount ($)</label>
                <input
                  type="number"
                  value={newBudget.plannedAmount || ''}
                  onChange={(e) => setNewBudget({ ...newBudget, plannedAmount: Number(e.target.value) })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddBudget}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-md font-medium hover:bg-emerald-600 transition-colors"
                >
                  Add budget target
                </button>
                <button
                  onClick={() => setShowAddBudget(false)}
                  className="px-4 py-2 border rounded-md text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </SimpleCard>
        </div>
      )}
    </div>
  )
}
