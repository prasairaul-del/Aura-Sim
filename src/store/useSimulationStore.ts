import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SimulationState, Vehicle, Transaction } from '../types'

interface SimulationActions {
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void
  updateVehicleHealth: (id: string, health: number) => void
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
  toggleSimulation: () => void
  tick: () => void
}

export const useSimulationStore = create(persist<SimulationState & SimulationActions>((set, get) => ({
  fleet: [
    { id: '1', model: 'Rolls-Royce Ghost', status: 'available', health: 100, lastService: '2024-05-01', revenueGenerated: 50000 },
    { id: '2', model: 'Bentley Flying Spur', status: 'in-service', health: 92, lastService: '2024-04-15', revenueGenerated: 35000 },
    { id: '3', model: 'Maybach S-Class', status: 'maintenance', health: 45, lastService: '2024-03-20', revenueGenerated: 12000 },
  ],
  transactions: [],
  totalBalance: 1250000,
  fleetHealth: 79,
  operationalEfficiency: 88,
  isSimulating: false,

  addVehicle: (vehicle) => set((state) => ({
    fleet: [...state.fleet, { ...vehicle, id: Math.random().toString(36).substr(2, 9) }]
  })),

  updateVehicleHealth: (id, health) => set((state) => ({
    fleet: state.fleet.map(v => v.id === id ? { ...v, health: Math.max(0, Math.min(100, health)) } : v)
  })),

  addTransaction: (transaction) => set((state) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    }
    const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount
    return {
      transactions: [newTransaction, ...state.transactions].slice(0, 50),
      totalBalance: state.totalBalance + balanceChange
    }
  }),

  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),

  tick: () => {
    const state = get()
    if (!state.isSimulating) return

    // Simulation Logic: Random wear and tear + passive income
    const updatedFleet = state.fleet.map(vehicle => {
      let healthDecay = 0
      let revenue = 0
      
      if (vehicle.status === 'in-service') {
        healthDecay = Math.random() * 0.3
        revenue = Math.random() * 50 + 20
      } else if (vehicle.status === 'maintenance') {
        healthDecay = -1.0 // Healing
        if (vehicle.health >= 100) {
          return { ...vehicle, health: 100, status: 'available' as const }
        }
      }

      // Random Event: 1% chance per tick for an "Event"
      if (Math.random() < 0.01 && vehicle.status === 'available') {
        return { ...vehicle, status: 'in-service' as const }
      }

      return {
        ...vehicle,
        health: Math.max(0, Math.min(100, vehicle.health - healthDecay)),
        revenueGenerated: vehicle.revenueGenerated + revenue
      }
    })

    const avgHealth = updatedFleet.reduce((acc, v) => acc + v.health, 0) / updatedFleet.length
    
    // Calculate new transactions for the UI to show activity
    const newTransactions = [...state.transactions]
    if (Math.random() < 0.1) {
      const isIncome = Math.random() > 0.3
      const amount = isIncome ? Math.random() * 500 + 100 : Math.random() * 200 + 50
      newTransactions.unshift({
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        merchant: isIncome ? "VIP Client Transfer" : "Fuel & Logistics",
        category: isIncome ? "VIP Services" : "Operations",
        amount,
        type: isIncome ? "income" : "expense"
      })
    }

    set({
      fleet: updatedFleet,
      fleetHealth: Math.round(avgHealth),
      transactions: newTransactions.slice(0, 50),
      totalBalance: state.totalBalance + (newTransactions[0]?.type === 'income' ? newTransactions[0].amount : 0) - (newTransactions[0]?.type === 'expense' ? newTransactions[0].amount : 0)
    })
  }
}), { name: 'aura-sim-storage' }))
