import React from 'react'
import { useSimulationStore } from '../../store/useSimulationStore'
import { SimpleCard } from '../../components/ui/GlassComponents'
import { OCRDropzone } from './OCRDropzone'
import { formatCurrency, cn } from '../../lib/utils'
import { ArrowUpRight, ArrowDownRight, ReceiptText, Plus, Search, Download, Edit, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

const CATEGORIES = ["Fleet", "Operations", "Marketing", "Staff", "VIP Services"] as const
type Category = typeof CATEGORIES[number]
type TransactionType = 'income' | 'expense'
type FilterType = 'all' | TransactionType

export const FinancialLedger: React.FC = () => {
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useSimulationStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ merchant: string; amount: string; type: TransactionType }>({
    merchant: '',
    amount: '',
    type: 'expense'
  })

  const startEdit = (t: typeof transactions[0]) => {
    setEditingId(t.id)
    setEditForm({
      merchant: t.merchant,
      amount: Math.abs(t.amount).toString(),
      type: t.type
    })
  }

  const saveEdit = (id: string) => {
    const amount = parseFloat(editForm.amount)
    if (isNaN(amount)) return

    editTransaction(id, {
      merchant: editForm.merchant,
      amount: editForm.type === 'income' ? amount : -amount,
      type: editForm.type
    })
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(id)
    }
  }

  const handleOCRResult = (result: string) => {
    const totalMatch = result.match(/Total:\s*\$?([\d,]+\.?\d*)/)
    const vendorMatch = result.match(/Vendor:\s*(.+)/)
    const categoryMatch = result.match(/Category:\s*(.+)/)

    if (totalMatch) {
      const amount = parseFloat(totalMatch[1].replace(/,/g, ''))
      const merchant = vendorMatch ? vendorMatch[1].trim() : 'OCR Scanned Receipt'
      const rawCategory = categoryMatch ? categoryMatch[1].trim() : 'Operations'
      const category: Category = (CATEGORIES as readonly string[]).includes(rawCategory)
        ? (rawCategory as Category)
        : 'Operations'

      addTransaction({ merchant, category, amount, type: 'expense' })
    }
  }

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const categoryValue = formData.get('category') as string
    const isValidCategory = CATEGORIES.includes(categoryValue as Category)

    addTransaction({
      merchant: formData.get('merchant') as string,
      category: isValidCategory ? (categoryValue as Category) : 'Operations',
      amount: parseFloat(formData.get('amount') as string),
      type: formData.get('type') as TransactionType
    })
    ;(e.target as HTMLFormElement).reset()
  }

  const exportCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount']
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleString(),
      t.merchant,
      t.category,
      t.type,
      t.amount.toFixed(2)
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ledger-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = searchQuery === '' ||
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || t.type === typeFilter
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
      return matchesSearch && matchesType && matchesCategory
    })
  }, [transactions, searchQuery, typeFilter, categoryFilter])

  const inputClass = "w-full px-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500/50"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-base font-semibold">Financial Ledger</h3>
          <p style={{ color: 'var(--app-text-muted)' }} className="text-sm mt-1">Track transactions and manage finances</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 border text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          style={{ backgroundColor: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', borderRadius: '6px', color: 'var(--app-text-muted)' }}
          aria-label="Export transactions to CSV"
        >
          <Download className="w-3 h-3" />
          Export CSV
        </button>
      </div>

      <OCRDropzone onAnalysisComplete={handleOCRResult} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <SimpleCard className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-gold-500" />
            <h4 className="text-sm font-medium">New Entry</h4>
          </div>
          <form onSubmit={handleManualEntry} className="space-y-3">
            <div>
              <label htmlFor="merchant-input" className="text-xs block mb-1" style={{ color: 'var(--app-text-muted)' }}>Merchant / Source</label>
              <input id="merchant-input" name="merchant" required
                className={`${inputClass} bg-white/5`}
                style={{ borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)', borderRadius: '6px' }}
                placeholder="e.g. Jet A1 Fueling" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="amount-input" className="text-xs block mb-1" style={{ color: 'var(--app-text-muted)' }}>Amount</label>
                <input id="amount-input" name="amount" type="number" step="0.01" required
                  className={`${inputClass} bg-white/5`}
                  style={{ borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)', borderRadius: '6px' }}
                  placeholder="0.00" />
              </div>
              <div>
                <label htmlFor="type-select" className="text-xs block mb-1" style={{ color: 'var(--app-text-muted)' }}>Type</label>
                <select id="type-select" name="type"
                  className={`${inputClass} bg-white/5`}
                  style={{ borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)', borderRadius: '6px' }}>
                  <option value="expense" style={{ backgroundColor: 'var(--app-option-bg)' }}>Expense</option>
                  <option value="income" style={{ backgroundColor: 'var(--app-option-bg)' }}>Income</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="category-select" className="text-xs block mb-1" style={{ color: 'var(--app-text-muted)' }}>Category</label>
              <select id="category-select" name="category"
                className={`${inputClass} bg-white/5`}
                style={{ borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)', borderRadius: '6px' }}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ backgroundColor: 'var(--app-option-bg)' }}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-500 text-onyx-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50" style={{ borderRadius: '6px' }}>
              Add Entry
            </button>
          </form>
        </SimpleCard>

        {/* Transaction List */}
        <SimpleCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-medium">Transactions</h4>
            </div>
            <span className="text-xs" style={{ color: 'var(--app-text-faint)' }}>{filteredTransactions.length} of {transactions.length}</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[180px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: 'var(--app-text-faint)' }} />
              <input
                type="text"
                placeholder="Search merchants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)', borderRadius: '6px' }}
                aria-label="Search transactions"
              />
            </div>
            {(['all', 'income', 'expense'] as FilterType[]).map(filter => (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors focus:outline-none",
                  typeFilter === filter
                    ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                    : "bg-transparent text-gray-500 border-gray-700 hover:bg-gray-800"
                )}
                aria-pressed={typeFilter === filter}
              >
                {filter}
              </button>
            ))}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
              className="px-3 py-1.5 text-xs border focus:outline-none"
              style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)', borderRadius: '6px' }}
              aria-label="Filter by category"
            >
              <option value="all" style={{ backgroundColor: 'var(--app-option-bg)' }}>All</option>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ backgroundColor: 'var(--app-option-bg)' }}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2" role="list" aria-label="Transaction list">
            <AnimatePresence initial={false}>
              {filteredTransactions.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center border border-dashed rounded-lg" style={{ borderColor: 'var(--app-card-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--app-text-faint)' }}>
                    {transactions.length === 0 ? 'No transactions yet' : 'No matches found'}
                  </p>
                </div>
              ) : (
                filteredTransactions.map((t) => (
                  <motion.div
                    key={t.id}
                    role="listitem"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "p-3 border group transition-colors",
                      editingId === t.id ? "border-emerald-500/30" : "hover:border-gray-600"
                    )}
                    style={{ borderColor: 'var(--app-card-border)', backgroundColor: editingId === t.id ? 'var(--app-card-bg-hover)' : 'var(--app-card-bg)', borderRadius: '8px' }}
                  >
                    {editingId === t.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.merchant}
                          onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-emerald-500"
                          style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)' }}
                          placeholder="Merchant"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:border-emerald-500"
                            style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)' }}
                            placeholder="Amount"
                          />
                          <select
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value as TransactionType })}
                            className="px-2 py-1 text-sm border rounded focus:outline-none focus:border-emerald-500"
                            style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)' }}
                          >
                            <option value="income" style={{ backgroundColor: 'var(--app-option-bg)' }}>Income</option>
                            <option value="expense" style={{ backgroundColor: 'var(--app-option-bg)' }}>Expense</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(t.id)} className="px-3 py-1 bg-emerald-500 text-onyx-950 text-xs font-medium rounded hover:bg-emerald-400 focus:outline-none">
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs border rounded focus:outline-none" style={{ borderColor: 'var(--app-card-border)', backgroundColor: 'var(--app-card-bg-hover)', color: 'var(--app-text-muted)' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded",
                            t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )} aria-label={t.type === 'income' ? 'Income' : 'Expense'}>
                            {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{t.merchant}</p>
                            <p className="text-xs" style={{ color: 'var(--app-text-faint)' }}>{t.category} &bull; {new Date(t.date).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={cn(
                              "font-mono text-sm font-medium",
                              t.type === 'income' ? "text-emerald-500" : "text-red-500"
                            )} aria-label={`${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}`}>
                              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(t)}
                              className="p-1.5 hover:bg-gray-700 rounded transition-colors focus:outline-none"
                              aria-label={`Edit transaction for ${t.merchant}`}
                            >
                              <Edit className="w-3 h-3" style={{ color: 'var(--app-text-muted)' }} />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1.5 hover:bg-red-500/10 rounded transition-colors focus:outline-none"
                              aria-label={`Delete transaction for ${t.merchant}`}
                            >
                              <Trash2 className="w-3 h-3" style={{ color: 'var(--app-text-muted)' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </SimpleCard>
      </div>
    </div>
  )
}
