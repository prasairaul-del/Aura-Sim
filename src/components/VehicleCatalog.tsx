import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, TrendingUp } from 'lucide-react'
import { useSimulationStore } from '../store/useSimulationStore'
import { formatCurrency } from '../lib/utils'
import { cn } from '../lib/utils'

interface VehicleOption {
  model: string
  class: 'sedan' | 'suv' | 'electric' | 'luxury'
  price: number
  baseHealth: number
  efficiency: number
  description: string
}

const VEHICLE_CATALOG: VehicleOption[] = [
  { model: 'Tesla Model S Plaid', class: 'electric', price: 130000, baseHealth: 100, efficiency: 95, description: 'Zero emissions, maximum tech' },
  { model: 'BMW 7 Series', class: 'sedan', price: 120000, baseHealth: 100, efficiency: 88, description: 'Executive comfort redefined' },
  { model: 'Range Rover Autobiography', class: 'suv', price: 180000, baseHealth: 100, efficiency: 82, description: 'Off-road capability meets luxury' },
  { model: 'Porsche Panamera Turbo', class: 'sedan', price: 200000, baseHealth: 100, efficiency: 90, description: 'Sports car performance, luxury sedan comfort' },
  { model: 'Mercedes-Maybach GLS', class: 'suv', price: 220000, baseHealth: 100, efficiency: 85, description: 'The pinnacle of SUV luxury' },
  { model: 'Aston Martin DBX', class: 'suv', price: 250000, baseHealth: 100, efficiency: 87, description: 'British elegance in SUV form' },
  { model: 'Rolls-Royce Cullinan', class: 'luxury', price: 400000, baseHealth: 100, efficiency: 80, description: 'The best SUV in the world' },
  { model: 'Bentley Continental GT', class: 'luxury', price: 280000, baseHealth: 100, efficiency: 86, description: 'Grand touring perfection' },
]

export const VehicleCatalog: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { totalBalance, addVehicle } = useSimulationStore()
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null)

  const handlePurchase = () => {
    if (!selectedVehicle) return
    if (totalBalance < selectedVehicle.price) {
      alert('Insufficient funds for this acquisition')
      return
    }

    addVehicle({
      model: selectedVehicle.model,
      status: 'available',
      health: selectedVehicle.baseHealth,
      lastService: new Date().toISOString().split('T')[0],
      revenueGenerated: 0,
      totalServiceHours: 0,
      maintenanceCosts: 0,
    })

    // Deduct cost via a transaction
    useSimulationStore.getState().addTransaction({
      merchant: `Vehicle Acquisition: ${selectedVehicle.model}`,
      category: 'Fleet',
      amount: selectedVehicle.price,
      type: 'expense',
    })

    setSelectedVehicle(null)
    onClose()
  }

  const canAfford = (vehicle: VehicleOption) => totalBalance >= vehicle.price

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-label="Vehicle acquisition catalog"
          >
            <div className="bg-card border w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-bold">Acquire new asset</h2>
                  <p className="text-sm text-muted-foreground mt-1">Available balance: {formatCurrency(totalBalance)}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  aria-label="Close catalog"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Vehicle Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {VEHICLE_CATALOG.map((vehicle) => (
                    <button
                      key={vehicle.model}
                      onClick={() => setSelectedVehicle(vehicle)}
                      disabled={!canAfford(vehicle)}
                      className={cn(
                        "text-left p-4 rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        selectedVehicle?.model === vehicle.model
                          ? "bg-emerald-100 border-emerald-500"
                          : "border hover:bg-muted",
                        !canAfford(vehicle) && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold">{vehicle.model}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{vehicle.class}</p>
                        </div>
                        <span className={cn(
                          "font-mono text-sm font-bold",
                          canAfford(vehicle) ? "text-emerald-600" : "text-red-600"
                        )}>
                          {formatCurrency(vehicle.price)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{vehicle.description}</p>
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Health: {vehicle.baseHealth}%
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Efficiency: {vehicle.efficiency}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer / Purchase Button */}
              {selectedVehicle && (
                <div className="p-6 border-t bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Selected:</p>
                      <p className="font-bold">{selectedVehicle.model}</p>
                      <p className="font-mono text-emerald-600">{formatCurrency(selectedVehicle.price)}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedVehicle(null)}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePurchase}
                        disabled={!canAfford(selectedVehicle)}
                        className="px-6 py-2 bg-emerald-500 text-white rounded-md font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        Confirm purchase
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
