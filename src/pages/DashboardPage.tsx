import { KPICards } from '../components/KPICards'
import { useSimulationStore } from '../store/useSimulationStore'
import { useState, useEffect } from 'react'
import { AVAILABLE_CURRENCIES, formatCurrencyFromUSD } from '../lib/utils'
import { Globe, Layers } from 'lucide-react'

interface SimulationProfile {
  id: string
  name: string
  description: string
  fleetSize: number
  initialBalance: number
}

export function DashboardPage() {
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED'>('USD')
  const [activeScenario, setActiveScenario] = useState<SimulationProfile | null>(null)
  const { totalBalance, fleetHealth, operationalEfficiency, fleet } = useSimulationStore()

  useEffect(() => {
    const loadActiveScenario = () => {
      try {
        const activeId = localStorage.getItem('aura-active-profile') || 'default'
        const profiles = JSON.parse(localStorage.getItem('aura-simulation-profiles') || '[]')
        const profile = profiles.find((p: SimulationProfile) => p.id === activeId)
        if (profile) {
          setActiveScenario(profile)
        }
      } catch (e) {
        // Ignore errors
      }
    }

    loadActiveScenario()
    window.addEventListener('storage', loadActiveScenario)
    return () => window.removeEventListener('storage', loadActiveScenario)
  }, [])

  return (
    <div className="space-y-6">
      {/* Active Scenario Banner */}
      {activeScenario && (
        <div className="p-4 border rounded-lg bg-gradient-to-r from-emerald-500/10 to-amber-500/10" style={{ borderColor: 'var(--app-card-border)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Layers className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">{activeScenario.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{activeScenario.description}</p>
                <div className="flex gap-4 mt-2 text-[10px]">
                  <span className="text-muted-foreground">
                    <strong>{fleet.length}</strong> vehicles
                  </span>
                  <span className="text-muted-foreground">
                    <strong>{formatCurrencyFromUSD(activeScenario.initialBalance, currency)}</strong> initial balance
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
