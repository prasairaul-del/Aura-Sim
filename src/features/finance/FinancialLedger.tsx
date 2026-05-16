import React from 'react'
import { useSimulationStore } from '../../store/useSimulationStore'
import { GlassCard } from '../../components/ui/GlassComponents'
import { OCRDropzone } from './OCRDropzone'
import { formatCurrency } from '../../lib/utils'
import { ArrowUpRight, ArrowDownRight, ReceiptText, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

export const FinancialLedger: React.FC = () => {
  const { transactions, addTransaction } = useSimulationStore()

  const categories = ["Fleet", "Operations", "Marketing", "Staff", "VIP Services"] as const

  const handleOCRResult = (result: string) => {
    // Parse the OCR result and auto-populate a transaction
    const totalMatch = result.match(/Total:\s*\$?([\d,]+\.?\d*)/)
    const vendorMatch = result.match(/Vendor:\s*(.+)/)
    const categoryMatch = result.match(/Category:\s*(.+)/)

    if (totalMatch) {
      const amount = parseFloat(totalMatch[1].replace(/,/g, ''))
      const merchant = vendorMatch ? vendorMatch[1].trim() : 'OCR Scanned Receipt'
      const rawCategory = categoryMatch ? categoryMatch[1].trim() : 'Operations'
      const category = categories.includes(rawCategory as typeof categories[number])
        ? (rawCategory as typeof categories[number])
        : 'Operations'

      addTransaction({
        merchant,
        category,
        amount,
        type: 'expense'
      })
    }
  }

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    addTransaction({
      merchant: formData.get('merchant') as string,
      category: formData.get('category') as any,
      amount: parseFloat(formData.get('amount') as string),
      type: formData.get('type') as 'income' | 'expense'
    })
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Ledger Theater</h3>
          <p className="text-white/40 text-sm">Every transaction is a narrative of luxury</p>
        </div>
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
              <label className="text-[10px] uppercase text-white/40 mb-1 block">Merchant / Source</label>
              <input name="merchant" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500/50 transition-colors" placeholder="e.g. Jet A1 Fueling" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase text-white/40 mb-1 block">Amount</label>
                <input name="amount" type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500/50" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-white/40 mb-1 block">Type</label>
                <select name="type" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500/50 appearance-none">
                  <option value="expense" className="bg-onyx-900">Expense</option>
                  <option value="income" className="bg-onyx-900">Income</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase text-white/40 mb-1 block">Category</label>
              <select name="category" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500/50 appearance-none">
                {categories.map(c => <option key={c} value={c} className="bg-onyx-900">{c}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-3 bg-gold-500 text-onyx-950 rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
              Commit to Ledger
            </button>
          </form>
        </GlassCard>

        {/* Transaction List */}
        <GlassCard className="lg:col-span-2 min-h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <ReceiptText className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500">Historical Narrative</h4>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {transactions.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
                  <p className="text-white/20 text-xs uppercase tracking-[0.2em]">The ledger is waiting for its first act...</p>
                </div>
              ) : (
                transactions.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{t.merchant}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{t.category} • {new Date(t.date).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-mono text-sm font-bold",
                        t.type === 'income' ? "text-emerald-400" : "text-red-400"
                      )}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-[8px] text-white/20 uppercase tracking-tighter">Verified</p>
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
