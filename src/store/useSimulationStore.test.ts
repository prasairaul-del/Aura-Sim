import { describe, it, expect, beforeEach } from 'vitest'
import { useSimulationStore } from './useSimulationStore'

describe('useSimulationStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useSimulationStore.persist.clearStorage()
  })

  describe('addVehicle', () => {
    it('adds a new vehicle to the fleet', () => {
      const initialLength = useSimulationStore.getState().fleet.length
      useSimulationStore.getState().addVehicle({
        model: 'Test Vehicle',
        status: 'available',
        health: 100,
        lastService: '2024-01-01',
        revenueGenerated: 0,
        totalServiceHours: 0,
      })
      expect(useSimulationStore.getState().fleet.length).toBe(initialLength + 1)
    })

    it('generates a unique ID for the new vehicle', () => {
      useSimulationStore.getState().addVehicle({
        model: 'Test Vehicle',
        status: 'available',
        health: 100,
        lastService: '2024-01-01',
        revenueGenerated: 0,
        totalServiceHours: 0,
      })
      const newVehicle = useSimulationStore.getState().fleet.at(-1)
      expect(newVehicle?.id).toBeDefined()
      expect(newVehicle?.model).toBe('Test Vehicle')
    })
  })

  describe('removeVehicle', () => {
    it('removes a vehicle from the fleet', () => {
      const initialFleet = useSimulationStore.getState().fleet
      const vehicleToRemove = initialFleet[0]
      useSimulationStore.getState().removeVehicle(vehicleToRemove.id)
      expect(useSimulationStore.getState().fleet.length).toBe(initialFleet.length - 1)
    })

    it('adds resale value to balance when removing vehicle', () => {
      const initialState = useSimulationStore.getState()
      const vehicle = initialState.fleet[0]
      const expectedResale = vehicle.revenueGenerated * 0.5
      const initialBalance = initialState.totalBalance
      useSimulationStore.getState().removeVehicle(vehicle.id)
      expect(useSimulationStore.getState().totalBalance).toBeCloseTo(
        initialBalance + expectedResale,
        2
      )
    })

    it('does nothing if vehicle ID does not exist', () => {
      const initialState = useSimulationStore.getState()
      useSimulationStore.getState().removeVehicle('non-existent-id')
      expect(useSimulationStore.getState().fleet.length).toBe(initialState.fleet.length)
    })
  })

  describe('addTransaction', () => {
    it('adds an income transaction and increases balance', () => {
      const initialBalance = useSimulationStore.getState().totalBalance
      useSimulationStore.getState().addTransaction({
        merchant: 'Test Income',
        category: 'VIP Services',
        amount: 1000,
        type: 'income',
      })
      expect(useSimulationStore.getState().totalBalance).toBe(initialBalance + 1000)
    })

    it('adds an expense transaction and decreases balance', () => {
      const initialBalance = useSimulationStore.getState().totalBalance
      useSimulationStore.getState().addTransaction({
        merchant: 'Test Expense',
        category: 'Operations',
        amount: 500,
        type: 'expense',
      })
      expect(useSimulationStore.getState().totalBalance).toBe(initialBalance - 500)
    })

    it('limits transactions to MAX_TRANSACTIONS', () => {
      for (let i = 0; i < 60; i++) {
        useSimulationStore.getState().addTransaction({
          merchant: `Transaction ${i}`,
          category: 'Operations',
          amount: 100,
          type: 'expense',
        })
      }
      expect(useSimulationStore.getState().transactions.length).toBeLessThanOrEqual(50)
    })
  })

  describe('editTransaction', () => {
    it('updates transaction fields', () => {
      useSimulationStore.getState().addTransaction({
        merchant: 'Original',
        category: 'Operations',
        amount: 100,
        type: 'expense',
      })
      const tx = useSimulationStore.getState().transactions[0]
      useSimulationStore.getState().editTransaction(tx.id, { merchant: 'Updated', amount: 200 })
      const updated = useSimulationStore.getState().transactions.find(t => t.id === tx.id)
      expect(updated?.merchant).toBe('Updated')
      expect(updated?.amount).toBe(200)
    })

    it('adjusts balance when editing amount', () => {
      const initialBalance = useSimulationStore.getState().totalBalance
      useSimulationStore.getState().addTransaction({
        merchant: 'Test',
        category: 'Operations',
        amount: 100,
        type: 'expense',
      })
      const tx = useSimulationStore.getState().transactions[0]
      useSimulationStore.getState().editTransaction(tx.id, { amount: 200 })
      // Original: -100, Updated: -200, net change: -100 more
      expect(useSimulationStore.getState().totalBalance).toBe(initialBalance - 200)
    })
  })

  describe('deleteTransaction', () => {
    it('removes transaction and reverses balance effect', () => {
      const initialBalance = useSimulationStore.getState().totalBalance
      useSimulationStore.getState().addTransaction({
        merchant: 'ToDelete',
        category: 'Operations',
        amount: 500,
        type: 'income',
      })
      const tx = useSimulationStore.getState().transactions[0]
      useSimulationStore.getState().deleteTransaction(tx.id)
      expect(useSimulationStore.getState().transactions.find(t => t.id === tx.id)).toBeUndefined()
      expect(useSimulationStore.getState().totalBalance).toBe(initialBalance)
    })
  })

  describe('scheduleService', () => {
    it('changes vehicle status to maintenance', () => {
      const vehicle = useSimulationStore.getState().fleet.find(v => v.status === 'available')
      if (vehicle) {
        useSimulationStore.getState().scheduleService(vehicle.id)
        const updated = useSimulationStore.getState().fleet.find(v => v.id === vehicle.id)
        expect(updated?.status).toBe('maintenance')
      }
    })

    it('updates lastService date', () => {
      const vehicle = useSimulationStore.getState().fleet.find(v => v.status === 'available')
      if (vehicle) {
        const today = new Date().toISOString().split('T')[0]
        useSimulationStore.getState().scheduleService(vehicle.id)
        const updated = useSimulationStore.getState().fleet.find(v => v.id === vehicle.id)
        expect(updated?.lastService).toBe(today)
      }
    })
  })

  describe('tick', () => {
    it('does nothing when simulation is not running', () => {
      useSimulationStore.setState({ isSimulating: false })
      const initialState = useSimulationStore.getState()
      useSimulationStore.getState().tick()
      expect(useSimulationStore.getState().fleet).toEqual(initialState.fleet)
    })

    it('decreases health for in-service vehicles', () => {
      // Set a vehicle to in-service
      const vehicle = useSimulationStore.getState().fleet[0]
      useSimulationStore.setState({
        fleet: useSimulationStore.getState().fleet.map(v =>
          v.id === vehicle.id ? { ...v, status: 'in-service' as const, health: 100 } : v
        ),
        isSimulating: true,
      })
      useSimulationStore.getState().tick()
      const updated = useSimulationStore.getState().fleet.find(v => v.id === vehicle.id)
      expect(updated?.health).toBeLessThan(100)
    })

    it('increases health for maintenance vehicles', () => {
      const vehicle = useSimulationStore.getState().fleet.find(v => v.status === 'maintenance')
      if (vehicle && vehicle.health < 100) {
        const initialHealth = vehicle.health
        useSimulationStore.setState({ isSimulating: true })
        useSimulationStore.getState().tick()
        const updated = useSimulationStore.getState().fleet.find(v => v.id === vehicle.id)
        expect(updated?.health).toBeGreaterThan(initialHealth)
      }
    })

    it('recalculates fleetHealth correctly', () => {
      useSimulationStore.setState({ isSimulating: true })
      useSimulationStore.getState().tick()
      const fleet = useSimulationStore.getState().fleet
      const expectedAvg = Math.round(fleet.reduce((acc, v) => acc + v.health, 0) / fleet.length)
      expect(useSimulationStore.getState().fleetHealth).toBe(expectedAvg)
    })

    it('handles empty fleet without crashing', () => {
      useSimulationStore.setState({ fleet: [], isSimulating: true })
      expect(() => useSimulationStore.getState().tick()).not.toThrow()
      expect(useSimulationStore.getState().fleetHealth).toBe(0)
    })

    it('calculates operationalEfficiency dynamically', () => {
      const fleet = useSimulationStore.getState().fleet
      const inServiceCount = fleet.filter(v => v.status === 'in-service').length
      useSimulationStore.setState({ isSimulating: true })
      useSimulationStore.getState().tick()
      const expectedEfficiency = fleet.length > 0
        ? Math.round((inServiceCount / fleet.length) * 100)
        : 0
      expect(useSimulationStore.getState().operationalEfficiency).toBe(expectedEfficiency)
    })
  })

  describe('toggleSimulation', () => {
    it('toggles isSimulating state', () => {
      const initialState = useSimulationStore.getState().isSimulating
      useSimulationStore.getState().toggleSimulation()
      expect(useSimulationStore.getState().isSimulating).toBe(!initialState)
      useSimulationStore.getState().toggleSimulation()
      expect(useSimulationStore.getState().isSimulating).toBe(initialState)
    })
  })
})
