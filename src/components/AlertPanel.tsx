import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, AlertTriangle, XCircle, Info } from 'lucide-react'
import { useAlertStore, checkSimulationAlerts, type Alert } from '../lib/alerts'
import { useSimulationStore } from '../store/useSimulationStore'
import { cn } from '../lib/utils'

export const AlertPanel: React.FC = () => {
  const { alerts, unreadCount, acknowledgeAlert, clearAlerts } = useAlertStore()
  const fleet = useSimulationStore((s) => s.fleet)
  const totalBalance = useSimulationStore((s) => s.totalBalance)
  const [isOpen, setIsOpen] = useState(false)

  // Check for new alerts on each render (during simulation)
  useEffect(() => {
    const newAlerts = checkSimulationAlerts(fleet, totalBalance, alerts)
    for (const alert of newAlerts) {
      useAlertStore.getState().addAlert(alert)
    }
  }, [fleet, totalBalance])

  const iconMap = {
    critical: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-gold-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
  }

  const borderMap = {
    critical: 'border-red-500/30',
    warning: 'border-gold-500/30',
    info: 'border-emerald-500/30',
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg"
        aria-label={`Notifications: ${unreadCount} unread`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-80 max-h-96 glass-card p-0 overflow-hidden border border-white/10"
              role="dialog"
              aria-label="Notification panel"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Notifications
                </h3>
                {alerts.length > 0 && (
                  <button
                    onClick={() => clearAlerts()}
                    className="text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded px-2 py-1"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="overflow-y-auto max-h-72">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-white/30 text-xs uppercase tracking-widest">All clear</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {alerts.map((alert: Alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border bg-white/5",
                          borderMap[alert.type],
                          !alert.acknowledged && "bg-white/10"
                        )}
                      >
                        {iconMap[alert.type]}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/70 leading-relaxed">{alert.message}</p>
                          <p className="text-[9px] text-white/25 mt-1 uppercase tracking-widest">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0 focus:outline-none"
                            aria-label="Dismiss alert"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
