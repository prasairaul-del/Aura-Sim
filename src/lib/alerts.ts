/**
 * Notification/alert system for the simulation.
 * Tracks and displays alerts for low vehicle health, negative balance, etc.
 */
import { create } from 'zustand'
import { LOW_HEALTH_THRESHOLD, CRITICAL_HEALTH_THRESHOLD, NEGATIVE_BALANCE_THRESHOLD } from './simConfig'
import type { Vehicle } from '../types'

export interface Alert {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  timestamp: string
  acknowledged: boolean
}

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>) => void
  acknowledgeAlert: (id: string) => void
  clearAlerts: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert) => set((state) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }
    return {
      alerts: [newAlert, ...state.alerts].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }
  }),

  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a),
    unreadCount: Math.max(0, state.unreadCount - (state.alerts.find(a => a.id === id && !a.acknowledged) ? 1 : 0)),
  })),

  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
}))

/**
 * Checks fleet and balance for conditions that should trigger alerts.
 * Call this from the simulation tick to detect issues.
 */
export function checkSimulationAlerts(
  fleet: Vehicle[],
  totalBalance: number,
  existingAlerts: Alert[]
): Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>[] {
  const newAlerts: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>[] = []

  // Check each vehicle's health
  for (const vehicle of fleet) {
    if (vehicle.health <= CRITICAL_HEALTH_THRESHOLD && vehicle.health > 0) {
      const existing = existingAlerts.find(a =>
        a.message.includes(vehicle.model) && a.message.includes('critical')
      )
      if (!existing) {
        newAlerts.push({
          type: 'critical',
          message: `CRITICAL: ${vehicle.model} health at ${Math.round(vehicle.health)}% — immediate maintenance required`,
        })
      }
    } else if (vehicle.health <= LOW_HEALTH_THRESHOLD && vehicle.health > CRITICAL_HEALTH_THRESHOLD) {
      const existing = existingAlerts.find(a =>
        a.message.includes(vehicle.model) && a.message.includes('low')
      )
      if (!existing) {
        newAlerts.push({
          type: 'warning',
          message: `WARNING: ${vehicle.model} health at ${Math.round(vehicle.health)}% — schedule maintenance soon`,
        })
      }
    }
  }

  // Check for negative balance
  if (totalBalance < NEGATIVE_BALANCE_THRESHOLD) {
    const existing = existingAlerts.find(a => a.message.includes('negative balance'))
    if (!existing) {
      newAlerts.push({
        type: 'critical',
        message: `CRITICAL: Account balance is negative ($${totalBalance.toFixed(2)}) — liquidity emergency`,
      })
    }
  }

  // Check for very low balance (10% of initial)
  if (totalBalance < 125000 && totalBalance >= NEGATIVE_BALANCE_THRESHOLD) {
    const existing = existingAlerts.find(a => a.message.includes('low balance'))
    if (!existing) {
      newAlerts.push({
        type: 'warning',
        message: `WARNING: Balance is low ($${totalBalance.toFixed(2)}) — consider revenue strategies`,
      })
    }
  }

  return newAlerts
}
