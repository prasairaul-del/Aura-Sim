import React from 'react'
import { useSimulationStore } from '../../store/useSimulationStore'
import { GlassCard } from '../../components/ui/GlassComponents'
import { OCRDropzone } from './OCRDropzone'
import { formatCurrency, cn } from '../../lib/utils'
import { ArrowUpRight, ArrowDownRight, ReceiptText, Plus, Search, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'

const CATEGORIES = ["Fleet", "Operations", "Marketing", "Staff", "VIP Services"] as const
type Category = typeof CATEGORIES[number]
type TransactionType = 'income' | 'expense'
type FilterType = 'all' | TransactionType

export const FinancialLedger: React.FC = () => {
  const { transactions, addTransaction } = useSimulationStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')

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

  // Filtered and searched transactions
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Ledger Theater</h3>
          <p className="text-white/60 text-sm">Every transaction is a narrative of luxury</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          aria-label="Export transactions to CSV"
        >
          <Download className="w-3 h-3" />
          Export CSV
        </button>
      </div>

      <OCRDropzone onAnalysisComplete={handleOCRResult} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <GlassCard className="lg:col-span-1 h-fit" glowColor="gold">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="w-4 h-4 text-gold-500" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-500">New Entry</h4>
          </div>
          <form onSubmit={handleManualEntry} className="space-y-4">
            <div>
              <label htmlFor="merchant-input" className="text-[10px] uppercase text-white/60 mb-1 block">Merchant / Source</label>
              <input id="merchant-input" name="merchant" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-colors" placeholder="e.g. Jet A1 Fueling" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount-input" className="text-[10px] uppercase text-white/60 mb-1 block">Amount</label>
                <input id="amount-input" name="amount" type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50" placeholder="0.00" />
              </div>
              <div>
                <label htmlFor="type-select" className="text-[10px] uppercase text-white/60 mb-1 block">Type</label>
                <select id="type-select" name="type" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 appearance-none">
                  <option value="expense" className="bg-onyx-900">Expense</option>
                  <option value="income" className="bg-onyx-900">Income</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="category-select" className="text-[10px] uppercase text-white/60 mb-1 block">Category</label>
              <select id="category-select" name="category" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 appearance-none">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-onyx-900">{c}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-3 bg-gold-500 text-onyx-950 rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all focus:outline-none focus:ring-2 focus:ring-gold-500/50">
              Commit to Ledger
            </button>
          </form>
        </GlassCard>

        {/* Transaction List */}
        <GlassCard className="lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500">Historical Narrative</h4>
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">{filteredTransactions.length} of {transactions.length}</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[180px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
              <input
                type="text"
                placeholder="Search merchants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder:text-white/25"
                aria-label="Search transactions by merchant or category"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as FilterType[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setTypeFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                    typeFilter === filter
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                  )}
                  aria-pressed={typeFilter === filter}
                >
                  {filter}
                </button>
              ))}
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none uppercase tracking-widest"
              aria-label="Filter by category"
            >
              <option value="all" className="bg-onyx-900">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-onyx-900">{c}</option>)}
            </select>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2" role="list" aria-label="Transaction list">
            <AnimatePresence initial={false}>
              {filteredTransactions.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
                  <p className="text-white/30 text-xs uppercase tracking-[0.2em]">
                    {transactions.length === 0
                      ? 'The ledger is waiting for its first act...'
                      : 'No transactions match your filters'}
                  </p>
                </div>
              ) : (
                filteredTransactions.map((t) => (
                  <motion.div
                    key={t.id}
                    role="listitem"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group",
                      editingId === t.id && "border-emerald-500/30 bg-emerald-500/5"
                    )}
                  >
                    {editingId === t.id ? (
                      // Edit mode
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.merchant}
                          onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
                          placeholder="Merchant"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Amount"
                          />
                          <select
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value as TransactionType })}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="income" className="bg-onyx-900">Income</option>
                            <option value="expense" className="bg-onyx-900">Expense</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(t.id)}
                            className="px-3 py-1 bg-emerald-500 text-onyx-950 rounded text-xs font-bold hover:bg-emerald-400 focus:outline-none"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-white/10 text-white/60 rounded text-xs hover:bg-white/20 focus:outline-none"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-2 rounded-lg",
                            t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )} aria-label={t.type === 'income' ? 'Income' : 'Expense'}>
                            {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white/80">{t.merchant}</p>
                            <p className="text-[10px] text-white/50 uppercase tracking-widest">{t.category} &bull; {new Date(t.date).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={cn(
                              "font-mono text-sm font-bold",
                              t.type === 'income' ? "text-emerald-400" : "text-red-400"
                            )} aria-label={`${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}`}>
                              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </p>
                            <p className="text-[8px] text-white/25 uppercase tracking-tighter">Verified</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(t)}
                              className="p-1.5 hover:bg-white/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              aria-label={`Edit transaction for ${t.merchant}`}
                            >
                              <Edit className="w-3 h-3 text-white/40 hover:text-white/70" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1.5 hover:bg-red-500/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                              aria-label={`Delete transaction for ${t.merchant}`}
                            >
                              <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
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
        </GlassCard>
      </div>
    </div>
  )
}
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-mono text-sm font-bold",
                        t.type === 'income' ? "text-emerald-400" : "text-red-400"
                      )} aria-label={`${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-[8px] text-white/25 uppercase tracking-tighter">Verified</p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
