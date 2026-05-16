import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SimulationState, Vehicle, Transaction, Customer, Booking } from '../types'
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

// Helper to get initial fleet based on active scenario
const getInitialFleet = (fleetSize: number, customVehicles?: any[]): Vehicle[] => {
  // If custom vehicles are provided, use them
  if (customVehicles && customVehicles.length > 0) {
    return customVehicles.map((v, i) => ({
      id: `custom-vehicle-${i + 1}`,
      model: v.model,
      status: (v.status || 'available') as Vehicle['status'],
      health: v.health || 100,
      lastService: v.purchaseDate || new Date().toISOString().split('T')[0],
      revenueGenerated: 0,
      totalServiceHours: 0,
      maintenanceCosts: 0,
      purchaseDate: v.purchaseDate,
      currentValuation: v.currentValuation,
    }))
  }
  
  // Otherwise auto-generate fleet
  const luxuryModels = [
    'Rolls-Royce Ghost', 'Bentley Flying Spur', 'Maybach S-Class',
    'Mercedes-Maybach GLS', 'BMW 7 Series', 'Audi A8 L',
    'Porsche Panamera', 'Tesla Model S Plaid', 'Range Rover Autobiography',
    'Aston Martin DBX', 'Lamborghini Urus', 'Ferrari Purosangue',
    'Maserati Quattroporte', 'Genesis G90', 'Lincoln Navigator',
    'Cadillac Escalade', 'Infiniti QX80', 'Lexus LS 500',
    'Jaguar XJ', 'McLaren Artura'
  ]
  
  return Array.from({ length: fleetSize }, (_, i) => ({
    id: `vehicle-${i + 1}`,
    model: luxuryModels[i % luxuryModels.length],
    status: 'available' as const,
    health: 100,
    lastService: new Date().toISOString().split('T')[0],
    revenueGenerated: 0,
    totalServiceHours: 0,
    maintenanceCosts: 0,
  }))
}

// Get active scenario profile
const getActiveScenario = () => {
  try {
    const activeId = localStorage.getItem('aura-active-profile') || 'default'
    const profiles = JSON.parse(localStorage.getItem('aura-simulation-profiles') || '[]')
    const profile = profiles.find((p: any) => p.id === activeId)
    
    if (profile) {
      return {
        fleetSize: profile.fleetSize || 3,
        initialBalance: profile.initialBalance || 1250000,
        customVehicles: profile.customVehicles,
      }
    }
  } catch (e) {
    // Fallback to default
  }
  
  return { fleetSize: 3, initialBalance: 1250000, customVehicles: undefined }
}

const scenario = getActiveScenario()

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
  resetSimulation: (fleetSize: number, initialBalance: number, customVehicles?: any[]) => void
  // Customer management
  addCustomer: (customer: Omit<Customer, 'id' | 'totalBookings' | 'totalSpent' | 'createdAt'>) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  // Booking management
  addBooking: (booking: Omit<Booking, 'id'>) => void
  updateBookingStatus: (id: string, status: Booking['status']) => void
  cancelBooking: (id: string) => void
}

export const useSimulationStore = create(persist<SimulationState & SimulationActions>((set, get) => ({
  fleet: getInitialFleet(scenario.fleetSize, scenario.customVehicles),
  transactions: [],
  totalBalance: scenario.initialBalance,
  fleetHealth: 100,
  operationalEfficiency: 100,
  isSimulating: false,
  customers: [
    { id: '1', name: 'Alexander Rothschild', email: 'a.rothschild@luxury.com', phone: '+1-555-0101', tier: 'platinum', totalBookings: 24, totalSpent: 185000, createdAt: '2024-01-15' },
    { id: '2', name: 'Victoria Chen', email: 'v.chen@elite.com', phone: '+1-555-0102', tier: 'gold', totalBookings: 12, totalSpent: 78000, createdAt: '2024-02-20' },
    { id: '3', name: 'James Morrison', email: 'j.morrison@premium.com', phone: '+1-555-0103', tier: 'standard', totalBookings: 5, totalSpent: 22000, createdAt: '2024-03-10' },
  ],
  bookings: [
    { id: '1', customerId: '1', vehicleId: '1', date: '2024-05-20', startTime: '09:00', endTime: '17:00', status: 'confirmed', amount: 2500, notes: 'Airport transfer - VIP service' },
    { id: '2', customerId: '2', vehicleId: '2', date: '2024-05-21', startTime: '14:00', endTime: '18:00', status: 'pending', amount: 1800 },
    { id: '3', customerId: '1', vehicleId: '3', date: '2024-05-22', startTime: '10:00', endTime: '16:00', status: 'completed', amount: 3200, notes: 'Wedding ceremony transport' },
  ],

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

  scheduleService: (id) => set((state) => {
    // Calculate maintenance cost based on vehicle health deficit
    const vehicle = state.fleet.find(v => v.id === id)
    if (!vehicle) return state
    
    const healthDeficit = 100 - vehicle.health
    const maintenanceCost = healthDeficit * 50 // $50 per health point to restore
    
    return {
      fleet: state.fleet.map(v =>
        v.id === id
          ? { 
              ...v, 
              status: 'maintenance' as const, 
              lastService: new Date().toISOString().split('T')[0],
              maintenanceCosts: v.maintenanceCosts + maintenanceCost
            }
          : v
      ),
      totalBalance: state.totalBalance - maintenanceCost
    }
  }),

  // Customer management actions
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, {
      ...customer,
      id: Math.random().toString(36).substring(2, 9),
      totalBookings: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }]
  })),

  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter(c => c.id !== id),
    bookings: state.bookings.filter(b => b.customerId !== id)
  })),

  // Booking management actions
  addBooking: (booking) => set((state) => {
    const newBooking = {
      ...booking,
      id: Math.random().toString(36).substring(2, 9)
    }
    // Update customer stats
    const updatedCustomers = state.customers.map(c =>
      c.id === booking.customerId
        ? { ...c, totalBookings: c.totalBookings + 1, totalSpent: c.totalSpent + booking.amount }
        : c
    )
    return {
      bookings: [newBooking, ...state.bookings],
      customers: updatedCustomers,
      totalBalance: state.totalBalance + booking.amount
    }
  }),

  updateBookingStatus: (id, status) => set((state) => ({
    bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b)
  })),

  cancelBooking: (id) => set((state) => {
    const booking = state.bookings.find(b => b.id === id)
    if (!booking) return state
    
    // Refund the amount and update customer stats
    const updatedCustomers = state.customers.map(c =>
      c.id === booking.customerId
        ? { ...c, totalSpent: c.totalSpent - booking.amount }
        : c
    )
    
    return {
      bookings: state.bookings.filter(b => b.id !== id),
      customers: updatedCustomers,
      totalBalance: state.totalBalance - booking.amount
    }
  }),

  resetSimulation: (fleetSize, initialBalance, customVehicles?) => set(() => ({
    fleet: getInitialFleet(fleetSize, customVehicles),
    transactions: [],
    totalBalance: initialBalance,
    fleetHealth: 100,
    operationalEfficiency: 100,
    isSimulating: false,
    customers: [
      { id: '1', name: 'Alexander Rothschild', email: 'a.rothschild@luxury.com', phone: '+1-555-0101', tier: 'platinum', totalBookings: 24, totalSpent: 185000, createdAt: '2024-01-15' },
      { id: '2', name: 'Victoria Chen', email: 'v.chen@elite.com', phone: '+1-555-0102', tier: 'gold', totalBookings: 12, totalSpent: 78000, createdAt: '2024-02-20' },
      { id: '3', name: 'James Morrison', email: 'j.morrison@premium.com', phone: '+1-555-0103', tier: 'standard', totalBookings: 5, totalSpent: 22000, createdAt: '2024-03-10' },
    ],
    bookings: [
      { id: '1', customerId: '1', vehicleId: '1', date: '2024-05-20', startTime: '09:00', endTime: '17:00', status: 'confirmed', amount: 2500, notes: 'Airport transfer - VIP service' },
      { id: '2', customerId: '2', vehicleId: '2', date: '2024-05-21', startTime: '14:00', endTime: '18:00', status: 'pending', amount: 1800 },
      { id: '3', customerId: '1', vehicleId: '3', date: '2024-05-22', startTime: '10:00', endTime: '16:00', status: 'completed', amount: 3200, notes: 'Wedding ceremony transport' },
    ],
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
