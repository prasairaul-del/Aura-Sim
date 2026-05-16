import React, { useState } from 'react'
import { useSimulationStore } from '../../store/useSimulationStore'
import { GlassCard, StatusBadge } from '../../components/ui/GlassComponents'
import { Car, DollarSign, Wrench, Trash2 } from 'lucide-react'
import { formatCurrency, cn } from '../../lib/utils'
import { motion } from 'framer-motion'
import { VehicleCatalog } from '../../components/VehicleCatalog'

export const FleetModule: React.FC = () => {
  const fleet = useSimulationStore((state) => state.fleet)
  const scheduleService = useSimulationStore((state) => state.scheduleService)
  const removeVehicle = useSimulationStore((state) => state.removeVehicle)
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)

  const handleSellVehicle = (vehicle: typeof fleet[0]) => {
    if (confirm(`Sell ${vehicle.model} for $${(vehicle.revenueGenerated * 0.5).toLocaleString()}?`)) {
      removeVehicle(vehicle.id)
    }
  }

  return (
    <div className="space-y-6" id="fleet">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Luxury Fleet</h3>
          <p className="text-white/60 text-sm">Real-time status of your high-end assets</p>
        </div>
        <button className="px-6 py-2 bg-emerald-500 text-onyx-950 rounded-full font-bold text-xs interactive-button shadow-[0_0_20px_rgba(16,185,129,0.3)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
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
              <StatusBadge status={vehicle.status} health={Math.round(vehicle.health)} />
            </div>

            <h4 className="text-lg font-bold mb-1">{vehicle.model}</h4>
            <p className="text-white/50 text-xs mb-6 uppercase tracking-widest">ID: {vehicle.id.toUpperCase()}</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-tighter text-white/60">
                  <span>Structural Integrity</span>
                  <span aria-label={`${Math.round(vehicle.health)} percent health`}>{Math.round(vehicle.health)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(vehicle.health)} aria-valuemin={0} aria-valuemax={100} aria-label="Vehicle health">
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

              <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-tighter">
                <Wrench className="w-3 h-3" />
                <span>Last serviced: {vehicle.lastService}</span>
                <span className="text-white/25 mx-1">&bull;</span>
                <span>{(vehicle.totalServiceHours || 0).toFixed(1)}h total</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <div className="flex items-center gap-1 text-[10px] text-white/50 uppercase mb-1">
                    <DollarSign className="w-3 h-3" /> Revenue
                  </div>
                  <p className="font-mono text-sm">{formatCurrency(vehicle.revenueGenerated)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[10px] text-white/50 uppercase mb-1">
                    <Wrench className="w-3 h-3" /> Maintenance
                  </div>
                  <p className={cn(
                    "font-mono text-sm",
                    (vehicle.maintenanceCosts || 0) > 5000 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {formatCurrency(vehicle.maintenanceCosts || 0)}
                  </p>
                </div>
              </div>

              {vehicle.status === 'available' && (
                <button
                  onClick={() => scheduleService(vehicle.id)}
                  className="w-full mt-2 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/50 hover:bg-white/10 hover:text-white/70 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  aria-label={`Schedule maintenance for ${vehicle.model}`}
                >
                  Schedule Service
                </button>
              )}

              <button
                onClick={() => handleSellVehicle(vehicle)}
                className="w-full mt-2 py-2 bg-red-500/5 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest text-red-400/50 hover:bg-red-500/10 hover:text-red-400/70 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                aria-label={`Sell ${vehicle.model}`}
              >
                <Trash2 className="w-3 h-3" />
                Sell Vehicle
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <VehicleCatalog isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
    </div>
  )
}
