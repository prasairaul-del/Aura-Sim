import React, { useState } from 'react'
import { useSimulationStore } from '../store/useSimulationStore'
import { GlassCard } from './ui/GlassComponents'
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
          <h3 className="text-2xl font-bold tracking-tight">Budget Planning</h3>
          <p className="text-white/60 text-sm">Track planned vs actual spending across categories</p>
        </div>
        <button
          onClick={() => setShowAddBudget(true)}
          className="px-4 py-2 bg-emerald-500 text-onyx-950 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Budget Target
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard glowColor="emerald">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Total Planned</span>
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(totalPlanned)}</p>
          <p className="text-xs text-white/50 mt-1">Monthly budget allocation</p>
        </GlassCard>

        <GlassCard glowColor="gold">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-gold-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Total Actual</span>
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(totalActual)}</p>
          <p className="text-xs text-white/50 mt-1">Actual spending to date</p>
        </GlassCard>

        <GlassCard glowColor={totalVariance >= 0 ? 'emerald' : 'gold'}>
          <div className="flex items-center justify-between mb-2">
            {totalVariance >= 0 ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-[10px] uppercase tracking-widest text-white/50">Variance</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${totalVariance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
          </p>
          <p className="text-xs text-white/50 mt-1">
            {totalVariance >= 0 ? 'Under budget' : 'Over budget'}
          </p>
        </GlassCard>
      </div>

      {/* Budget Breakdown Table */}
      <GlassCard glowColor="emerald">
        <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Budget Breakdown by Category</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Category</th>
                <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Planned</th>
                <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Actual</th>
                <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Variance</th>
                <th className="text-center py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Status</th>
                <th className="text-center py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Progress</th>
                <th className="text-center py-3 px-4 text-[10px] uppercase tracking-widest text-white/50"></th>
              </tr>
            </thead>
            <tbody>
              {budgetTargets.map(budget => {
                const actual = getActualSpending(budget.category)
                const variance = getVariance(budget.plannedAmount, actual)
                const progressPercent = Math.min((actual / budget.plannedAmount) * 100, 100)

                return (
                  <tr key={budget.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium">{budget.category}</span>
                      <span className="text-xs text-white/40 ml-2 capitalize">({budget.period})</span>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">{formatCurrency(budget.plannedAmount)}</td>
                    <td className="text-right py-3 px-4 font-mono">{formatCurrency(actual)}</td>
                    <td className={`text-right py-3 px-4 font-mono ${variance.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {variance.amount >= 0 ? '+' : ''}{formatCurrency(variance.amount)}
                    </td>
                    <td className="text-center py-3 px-4">
                      {variance.status === 'under' && <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />}
                      {variance.status === 'over' && <AlertTriangle className="w-4 h-4 text-red-400 mx-auto" />}
                      {variance.status === 'on-track' && <span className="text-xs text-white/50">On Track</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progressPercent > 90 ? 'bg-red-500' : progressPercent > 70 ? 'bg-gold-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/40 mt-1 block text-center">{progressPercent.toFixed(0)}%</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded text-white/30 hover:text-red-400 transition-colors"
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
      </GlassCard>

      {/* Income vs Expense Summary */}
      <GlassCard glowColor="gold">
        <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Revenue vs Expenses by Category</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['Fleet', 'Operations', 'Marketing', 'Staff', 'VIP Services'] as BudgetCategory[]).map(category => {
            const income = getActualIncome(category)
            const expense = getActualSpending(category)
            const net = income - expense

            return (
              <div key={category} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h5 className="text-sm font-medium text-white/70 mb-3">{category}</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" /> Income
                    </span>
                    <span className="font-mono text-emerald-400">{formatCurrency(income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-red-400" /> Expenses
                    </span>
                    <span className="font-mono text-red-400">{formatCurrency(expense)}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between">
                    <span className="text-white/50">Net</span>
                    <span className={`font-mono font-bold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {net >= 0 ? '+' : ''}{formatCurrency(net)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <GlassCard glowColor="emerald" className="w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">Add Budget Target</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Category</label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value as BudgetCategory })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="Fleet">Fleet</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Staff">Staff</option>
                  <option value="VIP Services">VIP Services</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Period</label>
                <select
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as typeof newBudget.period })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Planned Amount ($)</label>
                <input
                  type="number"
                  value={newBudget.plannedAmount || ''}
                  onChange={(e) => setNewBudget({ ...newBudget, plannedAmount: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddBudget}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-onyx-950 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
                >
                  Add Budget Target
                </button>
                <button
                  onClick={() => setShowAddBudget(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
