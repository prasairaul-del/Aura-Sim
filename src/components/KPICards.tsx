import { TrendingUp, ShieldCheck, Zap } from 'lucide-react'
import { useSimulationStore } from '../store/useSimulationStore'
import { cn, formatCurrencyFromUSD } from '../lib/utils'

interface KPICardsProps {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED'
}

export function KPICards({ currency }: KPICardsProps) {
  const { totalBalance, fleetHealth, operationalEfficiency } = useSimulationStore()

  const kpis = [
    { label: 'Total Liquidity', value: formatCurrencyFromUSD(totalBalance, currency), icon: TrendingUp, color: 'text-gold-500' },
    { label: 'Fleet Viability', value: `${fleetHealth}%`, icon: ShieldCheck, color: 'text-emerald-500' },
    { label: 'Op. Efficiency', value: `${operationalEfficiency}%`, icon: Zap, color: 'text-emerald-400' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi, i) => (
        <div key={i} className="glass-card p-6 flex items-center gap-6" style={{ borderColor: 'var(--app-border-light)' }}>
          <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--app-card-bg)' }}>
            <kpi.icon className={cn("w-6 h-6", kpi.color)} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--app-text-muted)' }}>{kpi.label}</p>
            <p className="text-2xl font-bold font-mono tracking-tighter">{kpi.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
