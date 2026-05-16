import { describe, it, expect, beforeEach } from 'vitest'
import { useAlertStore, checkSimulationAlerts, type Alert } from './alerts'
import type { Vehicle } from '../types'

describe('useAlertStore', () => {
  beforeEach(() => {
    useAlertStore.getState().clearAlerts()
  })

  describe('addAlert', () => {
    it('adds a new alert with generated ID and timestamp', () => {
      useAlertStore.getState().addAlert({
        type: 'warning',
        message: 'Test alert',
      })
      const alerts = useAlertStore.getState().alerts
      expect(alerts.length).toBe(1)
      expect(alerts[0].id).toBeDefined()
      expect(alerts[0].timestamp).toBeDefined()
      expect(alerts[0].acknowledged).toBe(false)
    })

    it('increments unread count', () => {
      useAlertStore.getState().addAlert({ type: 'info', message: 'Alert 1' })
      expect(useAlertStore.getState().unreadCount).toBe(1)
      useAlertStore.getState().addAlert({ type: 'warning', message: 'Alert 2' })
      expect(useAlertStore.getState().unreadCount).toBe(2)
    })

    it('limits alerts to 50 maximum', () => {
      for (let i = 0; i < 60; i++) {
        useAlertStore.getState().addAlert({ type: 'info', message: `Alert ${i}` })
      }
      expect(useAlertStore.getState().alerts.length).toBeLessThanOrEqual(50)
    })
  })

  describe('acknowledgeAlert', () => {
    it('marks alert as acknowledged', () => {
      useAlertStore.getState().addAlert({ type: 'warning', message: 'Test' })
      const alertId = useAlertStore.getState().alerts[0].id
      useAlertStore.getState().acknowledgeAlert(alertId)
      const alert = useAlertStore.getState().alerts.find(a => a.id === alertId)
      expect(alert?.acknowledged).toBe(true)
    })

    it('decrements unread count', () => {
      useAlertStore.getState().addAlert({ type: 'warning', message: 'Test' })
      useAlertStore.getState().acknowledgeAlert(useAlertStore.getState().alerts[0].id)
      expect(useAlertStore.getState().unreadCount).toBe(0)
    })
  })

  describe('clearAlerts', () => {
    it('removes all alerts and resets unread count', () => {
      useAlertStore.getState().addAlert({ type: 'warning', message: 'Test' })
      useAlertStore.getState().clearAlerts()
      expect(useAlertStore.getState().alerts.length).toBe(0)
      expect(useAlertStore.getState().unreadCount).toBe(0)
    })
  })
})

describe('checkSimulationAlerts', () => {
  const createVehicle = (health: number, model: string): Vehicle => ({
    id: 'test-1',
    model,
    status: 'available',
    health,
    lastService: '2024-01-01',
    revenueGenerated: 0,
    totalServiceHours: 0,
    maintenanceCosts: 0,
  })

  describe('vehicle health alerts', () => {
    it('generates critical alert for health below 10%', () => {
      const fleet = [createVehicle(5, 'Test Car')]
      const alerts = checkSimulationAlerts(fleet, 1000000, [])
      expect(alerts.length).toBe(1)
      expect(alerts[0].type).toBe('critical')
      expect(alerts[0].message.toLowerCase()).toContain('critical')
    })

    it('generates warning alert for health below 30%', () => {
      const fleet = [createVehicle(25, 'Test Car')]
      const alerts = checkSimulationAlerts(fleet, 1000000, [])
      expect(alerts.length).toBe(1)
      expect(alerts[0].type).toBe('warning')
      expect(alerts[0].message).toContain('WARNING')
    })

    it('does not generate alert for healthy vehicles', () => {
      const fleet = [createVehicle(80, 'Test Car')]
      const alerts = checkSimulationAlerts(fleet, 1000000, [])
      expect(alerts.length).toBe(0)
    })

    it('deduplicates vehicle health alerts', () => {
      const fleet = [createVehicle(5, 'Test Car')]
      const existingAlerts: Alert[] = [{
        id: '1',
        type: 'critical',
        message: 'CRITICAL: Test Car health at 5% — immediate maintenance required',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }]
      const alerts = checkSimulationAlerts(fleet, 1000000, existingAlerts)
      expect(alerts.length).toBe(0) // No new alerts since one already exists
    })
  })

  describe('balance alerts', () => {
    it('generates critical alert for negative balance', () => {
      const fleet: Vehicle[] = []
      const alerts = checkSimulationAlerts(fleet, -50000, [])
      expect(alerts.length).toBe(1)
      expect(alerts[0].type).toBe('critical')
      expect(alerts[0].message.toLowerCase()).toContain('negative')
    })

    it('generates warning alert for low balance', () => {
      const fleet: Vehicle[] = []
      const alerts = checkSimulationAlerts(fleet, 100000, [])
      expect(alerts.length).toBe(1)
      expect(alerts[0].type).toBe('warning')
      expect(alerts[0].message.toLowerCase()).toContain('low')
    })

    it('does not generate alert for healthy balance', () => {
      const fleet: Vehicle[] = []
      const alerts = checkSimulationAlerts(fleet, 500000, [])
      expect(alerts.length).toBe(0)
    })

    it('deduplicates balance alerts', () => {
      const existingAlerts: Alert[] = [{
        id: '1',
        type: 'critical',
        message: 'CRITICAL: Account balance is negative ($-50000.00) — liquidity emergency',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }]
      const alerts = checkSimulationAlerts([], -50000, existingAlerts)
      expect(alerts.length).toBe(0)
    })
  })

  describe('combined alerts', () => {
    it('returns multiple alerts for multiple issues', () => {
      const fleet = [createVehicle(5, 'Bad Car'), createVehicle(20, 'Worse Car')]
      const alerts = checkSimulationAlerts(fleet, -10000, [])
      expect(alerts.length).toBeGreaterThanOrEqual(3) // 2 vehicle + 1 balance
    })
  })
})
