import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SimulationState, Vehicle, Transaction } from '../types'
import {
  HEALTH_DECAY_MAX,
  REVENUE_MIN,
  REVENUE_MAX,
  MAINTENANCE_HEAL_RATE,
  ENTER_SERVICE_CHANCE,
  TRANSACTION_CHANCE,
  INCOME_AMOUNT_MIN,
  INCOME_AMOUNT_MAX,
  EXPENSE_AMOUNT_MIN,
  EXPENSE_AMOUNT_MAX,
  MAX_TRANSACTIONS,
} from '../lib/simConfig'

interface SimulationActions {
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void
  removeVehicle: (id: string) => void
  updateVehicleHealth: (id: string, health: number) => void
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
  editTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'date'>>) => void
  deleteTransaction: (id: string) => void
  toggleSimulation: () => void
  tick: () => void
  scheduleService: (id: string) => void
}

export const useSimulationStore = create(persist<SimulationState & SimulationActions>((set, get) => ({
  fleet: [
    { id: '1', model: 'Rolls-Royce Ghost', status: 'available', health: 100, lastService: '2024-05-01', revenueGenerated: 50000, totalServiceHours: 0 },
    { id: '2', model: 'Bentley Flying Spur', status: 'in-service', health: 92, lastService: '2024-04-15', revenueGenerated: 35000, totalServiceHours: 120 },
    { id: '3', model: 'Maybach S-Class', status: 'maintenance', health: 45, lastService: '2024-03-20', revenueGenerated: 12000, totalServiceHours: 45 },
  ],
  transactions: [],
  totalBalance: 1250000,
  fleetHealth: 79,
  operationalEfficiency: 88,
  isSimulating: false,

  addVehicle: (vehicle) => set((state) => ({
    fleet: [...state.fleet, { ...vehicle, id: Math.random().toString(36).substring(2, 9), totalServiceHours: 0 }]
  })),

  removeVehicle: (id) => set((state) => {
    const vehicle = state.fleet.find(v => v.id === id)
    if (!vehicle) return state
    // Refund partial value (50% of revenue generated as resale value)
    const resaleValue = vehicle.revenueGenerated * 0.5
    return {
      fleet: state.fleet.filter(v => v.id !== id),
      totalBalance: state.totalBalance + resaleValue
    }
  }),

  updateVehicleHealth: (id, health) => set((state) => ({
    fleet: state.fleet.map(v => v.id === id ? { ...v, health: Math.max(0, Math.min(100, health)) } : v)
  })),

  addTransaction: (transaction) => set((state) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString()
    }
    const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount
    return {
      transactions: [newTransaction, ...state.transactions].slice(0, MAX_TRANSACTIONS),
      totalBalance: state.totalBalance + balanceChange
    }
  }),

  editTransaction: (id, updates) => set((state) => {
    const transaction = state.transactions.find(t => t.id === id)
    if (!transaction) return state
    
    const oldBalanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount
    const newAmount = updates.amount ?? transaction.amount
    const newType = updates.type ?? transaction.type
    const newBalanceChange = newType === 'income' ? newAmount : -newAmount
    
    const updatedTransaction = { ...transaction, ...updates }
    
    return {
      transactions: state.transactions.map(t => t.id === id ? updatedTransaction : t),
      totalBalance: state.totalBalance - oldBalanceChange + newBalanceChange
    }
  }),

  deleteTransaction: (id) => set((state) => {
    const transaction = state.transactions.find(t => t.id === id)
    if (!transaction) return state
    
    const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount
    return {
      transactions: state.transactions.filter(t => t.id !== id),
      totalBalance: state.totalBalance + balanceChange
    }
  }),

  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),

  scheduleService: (id) => set((state) => ({
    fleet: state.fleet.map(v =>
      v.id === id
        ? { ...v, status: 'maintenance' as const, lastService: new Date().toISOString().split('T')[0] }
        : v
    )
  })),

  tick: () => {
    const state = get()
    if (!state.isSimulating) return

    const updatedFleet = state.fleet.map(vehicle => {
      let healthChange = 0
      let revenue = 0

      if (vehicle.status === 'in-service') {
        healthChange = -(Math.random() * HEALTH_DECAY_MAX)
        revenue = Math.random() * (REVENUE_MAX - REVENUE_MIN) + REVENUE_MIN
      } else if (vehicle.status === 'maintenance') {
        healthChange = MAINTENANCE_HEAL_RATE
        if (vehicle.health >= 100) {
          return { ...vehicle, health: 100, status: 'available' as const, lastService: new Date().toISOString().split('T')[0] }
        }
      }

      // Random Event: chance per tick for an available vehicle to enter service
      if (Math.random() < ENTER_SERVICE_CHANCE && vehicle.status === 'available') {
        return { ...vehicle, status: 'in-service' as const }
      }

      return {
        ...vehicle,
        health: Math.max(0, Math.min(100, vehicle.health + healthChange)),
        revenueGenerated: vehicle.revenueGenerated + revenue,
        totalServiceHours: vehicle.status === 'in-service' ? (vehicle.totalServiceHours || 0) + (1 / 3600) : (vehicle.totalServiceHours || 0),
      }
    })

    const avgHealth = updatedFleet.reduce((acc, v) => acc + v.health, 0) / updatedFleet.length

    // Generate random transactions to show activity
    const newTransactions = [...state.transactions]
    let transactionBalanceChange = 0
    if (Math.random() < TRANSACTION_CHANCE) {
      const isIncome = Math.random() > 0.3
      const amount = isIncome
        ? Math.random() * (INCOME_AMOUNT_MAX - INCOME_AMOUNT_MIN) + INCOME_AMOUNT_MIN
        : Math.random() * (EXPENSE_AMOUNT_MAX - EXPENSE_AMOUNT_MIN) + EXPENSE_AMOUNT_MIN
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString(),
        merchant: isIncome ? "VIP Client Transfer" : "Fuel & Logistics",
        category: isIncome ? "VIP Services" : "Operations",
        amount,
        type: isIncome ? "income" : "expense"
      }
      newTransactions.unshift(newTx)
      transactionBalanceChange = isIncome ? amount : -amount
    }

    set({
      fleet: updatedFleet,
      fleetHealth: updatedFleet.length > 0 ? Math.round(avgHealth) : 0,
      operationalEfficiency: updatedFleet.length > 0
        ? Math.round((updatedFleet.filter(v => v.status === 'in-service').length / updatedFleet.length) * 100)
        : 0,
      transactions: newTransactions.slice(0, MAX_TRANSACTIONS),
      totalBalance: state.totalBalance + transactionBalanceChange
    })
  }
}), { name: 'aura-sim-storage' }))
