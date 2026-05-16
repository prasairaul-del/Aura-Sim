import { cn } from '../lib/utils'
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react'
import { useSimulationStore } from '../store/useSimulationStore'
import { formatCurrencyFromUSD } from '../lib/utils'

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, i) => (
        <div key={i} className="p-4 border" style={{ backgroundColor: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', borderRadius: '8px' }}>
          <div className="flex items-center gap-3 mb-1">
            <kpi.icon className={cn("w-4 h-4", kpi.color)} />
            <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{kpi.label}</p>
          </div>
          <p className="text-lg font-semibold font-mono tracking-tight">{kpi.value}</p>
        </div>
      ))}
    </div>
  )
}
