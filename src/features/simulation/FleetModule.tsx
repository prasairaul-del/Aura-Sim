import React, { useState } from 'react'
import { useSimulationStore } from '../../store/useSimulationStore'
import { SimpleCard, StatusBadge } from '../../components/ui/GlassComponents'
import { Car, DollarSign, Wrench, Trash2 } from 'lucide-react'
import { formatCurrency, cn } from '../../lib/utils'
import { VehicleCatalog } from '../../components/VehicleCatalog'
import { CSVImport } from '../../components/CSVImport'

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
          <h3 className="text-base font-semibold">Luxury Fleet</h3>
          <p style={{ color: 'var(--app-text-muted)' }} className="text-sm mt-1">Real-time status of your high-end assets</p>
        </div>
        <div className="flex gap-2">
          <CSVImport />
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="px-4 py-2 bg-emerald-500 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:bg-emerald-600 transition-colors"
            style={{ borderRadius: '6px' }}
          >
            Acquire new asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fleet.map((vehicle) => (
          <SimpleCard key={vehicle.id}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2" style={{ backgroundColor: 'var(--app-card-bg-hover)', borderRadius: '6px' }}>
                <Car className="w-5 h-5 text-emerald-400" />
              </div>
              <StatusBadge status={vehicle.status} health={Math.round(vehicle.health)} />
            </div>

            <h4 className="text-sm font-semibold mb-1">{vehicle.model}</h4>
            <p style={{ color: 'var(--app-text-faint)' }} className="text-xs mb-4">ID: {vehicle.id.toUpperCase()}</p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs" style={{ color: 'var(--app-text-muted)' }}>
                  <span>Health</span>
                  <span>{Math.round(vehicle.health)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--app-card-bg-hover)' }} role="progressbar" aria-valuenow={Math.round(vehicle.health)} aria-valuemin={0} aria-valuemax={100} aria-label="Vehicle health">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      vehicle.health > 70 ? "bg-emerald-500" :
                      vehicle.health > 30 ? "bg-gold-500" : "bg-red-500"
                    )}
                    style={{ width: `${vehicle.health}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--app-text-faint)' }}>
                <Wrench className="w-3 h-3" />
                <span>Last serviced: {vehicle.lastService}</span>
                <span style={{ color: 'var(--app-text-muted)' }}>&bull;</span>
                <span>{(vehicle.totalServiceHours || 0).toFixed(1)}h total</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: 'var(--app-card-border)' }}>
                <div>
                  <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--app-text-muted)' }}>
                    <DollarSign className="w-3 h-3" /> Revenue
                  </div>
                  <p className="font-mono text-sm">{formatCurrency(vehicle.revenueGenerated)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--app-text-muted)' }}>
                    <Wrench className="w-3 h-3" /> Maintenance
                  </div>
                  <p className={cn(
                    "font-mono text-sm",
                    (vehicle.maintenanceCosts || 0) > 5000 ? "text-red-500" : "text-emerald-500"
                  )}>
                    {formatCurrency(vehicle.maintenanceCosts || 0)}
                  </p>
                </div>
              </div>

              {vehicle.status === 'available' && (
                <button
                  onClick={() => scheduleService(vehicle.id)}
                  className="w-full mt-2 py-2 border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  style={{ borderColor: 'var(--app-card-border)', backgroundColor: 'var(--app-card-bg)', borderRadius: '6px', color: 'var(--app-text-muted)' }}
                  aria-label={`Schedule maintenance for ${vehicle.model}`}
                >
                  Schedule Service
                </button>
              )}

              <button
                onClick={() => handleSellVehicle(vehicle)}
                className="w-full mt-2 py-2 border text-xs font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                style={{ borderColor: 'var(--app-card-border)', backgroundColor: 'var(--app-card-bg)', borderRadius: '6px', color: 'var(--app-text-muted)' }}
                aria-label={`Sell ${vehicle.model}`}
              >
                <Trash2 className="w-3 h-3" />
                Sell Vehicle
              </button>
            </div>
          </SimpleCard>
        ))}
      </div>

      <VehicleCatalog isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
    </div>
  )
}
