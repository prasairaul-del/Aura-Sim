import { Layout } from './components/Layout'
import { FleetModule } from './features/simulation/FleetModule'
import { FinancialLedger } from './features/finance/FinancialLedger'
import { VirtualCOO } from './features/ai/VirtualCOO'
import { PerformanceChart } from './components/PerformanceChart'
import { useSimulationStore } from './store/useSimulationStore'
import { useEffect, useState } from 'react'
import { formatCurrency, cn, AVAILABLE_CURRENCIES } from './lib/utils'
import { TrendingUp, ShieldCheck, Zap, Globe } from 'lucide-react'

function App() {
  const { totalBalance, fleetHealth, operationalEfficiency, tick, isSimulating, toggleSimulation } = useSimulationStore()
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED'>('USD')

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        tick()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [tick])

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-8">
        {/* Top KPI Bar */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard">
          {[
            { label: 'Total Liquidity', value: formatCurrency(totalBalance, currency), icon: TrendingUp, color: 'text-gold-500' },
            { label: 'Fleet Viability', value: `${fleetHealth}%`, icon: ShieldCheck, color: 'text-emerald-500' },
            { label: 'Op. Efficiency', value: `${operationalEfficiency}%`, icon: Zap, color: 'text-emerald-400' }
          ].map((kpi, i) => (
            <div key={i} className="glass-card p-6 flex items-center gap-6 border-white/5">
              <div className="p-4 bg-white/5 rounded-2xl">
                <kpi.icon className={cn("w-6 h-6", kpi.color)} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold font-mono tracking-tighter">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Currency Selector */}
        <div className="col-span-12 flex justify-end">
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-white/40" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
              aria-label="Select display currency"
            >
              {AVAILABLE_CURRENCIES.map(c => (
                <option key={c} value={c} className="bg-onyx-900">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="col-span-12 lg:col-span-8 space-y-12">
          <FleetModule />
          <div id="ledger">
            <FinancialLedger />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6" id="coo">
          <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group min-h-[400px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-24 h-24 text-emerald-500" />
            </div>

            <p className="text-xs font-bold text-gold-500 mb-6 uppercase tracking-[0.2em]">Virtual COO</p>

            <VirtualCOO />

            <button
              onClick={toggleSimulation}
              className={cn(
                "mt-6 w-full py-3 rounded-xl font-bold text-xs tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                isSimulating ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-emerald-500 text-onyx-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              )}
              aria-pressed={isSimulating}
            >
              {isSimulating ? "HALT SIMULATION" : "ENGAGE SIMULATION"}
            </button>
          </div>

          <PerformanceChart />
        </div>
      </div>
    </Layout>
  )
}

export default App
