import { KPICards } from '../components/KPICards'
import { useSimulationStore } from '../store/useSimulationStore'
import { useState } from 'react'
import { AVAILABLE_CURRENCIES, formatCurrencyFromUSD } from '../lib/utils'
import { Globe } from 'lucide-react'

export function DashboardPage() {
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED'>('USD')
  const { totalBalance, fleetHealth, operationalEfficiency } = useSimulationStore()

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" style={{ color: 'var(--app-text-faint)' }} />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as typeof currency)}
            className="border px-3 py-1.5 text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)' }}
            aria-label="Select display currency"
          >
            {AVAILABLE_CURRENCIES.map(c => (
              <option key={c} value={c} style={{ backgroundColor: 'var(--app-option-bg)' }}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <KPICards currency={currency} />

      <div className="border p-6" style={{ borderColor: 'var(--app-card-border)', backgroundColor: 'var(--app-card-bg)' }}>
        <h2 className="text-base font-semibold mb-3">Overview</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--app-text-muted)' }}>
          Manage your fleet, track finances, and analyze performance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 border" style={{ borderColor: 'var(--app-card-border)' }}>
            <p className="text-gold-500 font-medium mb-1">Total Liquidity</p>
            <p className="font-mono" style={{ color: 'var(--app-text-muted)' }}>{formatCurrencyFromUSD(totalBalance, currency)}</p>
          </div>
          <div className="p-3 border" style={{ borderColor: 'var(--app-card-border)' }}>
            <p className="text-emerald-500 font-medium mb-1">Fleet Viability</p>
            <p className="font-mono" style={{ color: 'var(--app-text-muted)' }}>{fleetHealth}%</p>
          </div>
          <div className="p-3 border" style={{ borderColor: 'var(--app-card-border)' }}>
            <p className="text-emerald-400 font-medium mb-1">Op. Efficiency</p>
            <p className="font-mono" style={{ color: 'var(--app-text-muted)' }}>{operationalEfficiency}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
