import React from 'react'
import { useSimulationStore } from '../../store/useSimulationStore'
import { GlassCard, StatusBadge } from '../../components/ui/GlassComponents'
import { Car, DollarSign, Activity } from 'lucide-react'
import { formatCurrency, cn } from '../../lib/utils'
import { motion } from 'framer-motion'

export const FleetModule: React.FC = () => {
  const fleet = useSimulationStore((state) => state.fleet)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Luxury Fleet</h3>
          <p className="text-white/40 text-sm">Real-time status of your high-end assets</p>
        </div>
        <button className="px-6 py-2 bg-emerald-500 text-onyx-950 rounded-full font-bold text-xs interactive-button shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          ACQUIRE NEW ASSET
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fleet.map((vehicle) => (
          <GlassCard key={vehicle.id} glowColor={vehicle.health < 50 ? 'gold' : 'emerald'}>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <Car className="w-6 h-6 text-emerald-400" />
              </div>
              <StatusBadge status={vehicle.status} />
            </div>

            <h4 className="text-lg font-bold mb-1">{vehicle.model}</h4>
            <p className="text-white/40 text-xs mb-6 uppercase tracking-widest">ID: {vehicle.id.toUpperCase()}</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-tighter text-white/60">
                  <span>Structural Integrity</span>
                  <span>{Math.round(vehicle.health)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${vehicle.health}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      vehicle.health > 70 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : 
                      vehicle.health > 30 ? "bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase mb-1">
                    <DollarSign className="w-3 h-3" /> Revenue
                  </div>
                  <p className="font-mono text-sm">{formatCurrency(vehicle.revenueGenerated)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase mb-1">
                    <Activity className="w-3 h-3" /> Efficiency
                  </div>
                  <p className="font-mono text-sm">{vehicle.status === 'in-service' ? '94%' : '0%'}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
