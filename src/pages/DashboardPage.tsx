import { KPICards } from '../components/KPICards'
import { useSimulationStore } from '../store/useSimulationStore'
import { useState } from 'react'
import { AVAILABLE_CURRENCIES, formatCurrencyFromUSD } from '../lib/utils'
import { Globe } from 'lucide-react'

export function DashboardPage() {
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED'>('USD')
  const { totalBalance, fleetHealth, operationalEfficiency } = useSimulationStore()

  return (
    <div className="space-y-12">
      {/* Currency Selector */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <Globe className="w-3 h-3" style={{ color: 'var(--app-text-faint)' }} />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as typeof currency)}
            className="border rounded-lg px-3 py-1.5 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)' }}
            aria-label="Select display currency"
          >
            {AVAILABLE_CURRENCIES.map(c => (
              <option key={c} value={c} style={{ backgroundColor: 'var(--app-option-bg)' }}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards currency={currency} />

      {/* Welcome Section */}
      <div className="glass-card p-8" style={{ borderColor: 'var(--app-border-light)' }}>
        <h2 className="text-2xl font-bold mb-4">Welcome to Aura-Sim</h2>
        <p className="mb-6" style={{ color: 'var(--app-text-muted)' }}>
          Your comprehensive business management simulator. Navigate through the sections above to manage your fleet, track finances, analyze performance, and more.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="p-4" style={{ backgroundColor: 'var(--app-card-bg)' }}>
            <p className="text-gold-500 font-bold mb-2">Total Liquidity</p>
            <p style={{ color: 'var(--app-text-muted)' }}>{formatCurrencyFromUSD(totalBalance, currency)}</p>
          </div>
          <div className="p-4" style={{ backgroundColor: 'var(--app-card-bg)' }}>
            <p className="text-emerald-500 font-bold mb-2">Fleet Viability</p>
            <p style={{ color: 'var(--app-text-muted)' }}>{fleetHealth}%</p>
          </div>
          <div className="p-4" style={{ backgroundColor: 'var(--app-card-bg)' }}>
            <p className="text-emerald-400 font-bold mb-2">Op. Efficiency</p>
            <p style={{ color: 'var(--app-text-muted)' }}>{operationalEfficiency}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
