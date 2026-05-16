import React, { useState } from 'react'
import { GlassCard } from './ui/GlassComponents'
import { AlertTriangle, Settings, Save } from 'lucide-react'

interface AlertThresholds {
  lowHealthThreshold: number
  criticalHealthThreshold: number
  negativeBalanceThreshold: number
  lowBalancePercentage: number
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  lowHealthThreshold: 30,
  criticalHealthThreshold: 10,
  negativeBalanceThreshold: 0,
  lowBalancePercentage: 10,
}

export const AlertSettings: React.FC = () => {
  const [thresholds, setThresholds] = useState<AlertThresholds>(() => {
    const saved = localStorage.getItem('aura-alert-thresholds')
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS
  })
  const [isOpen, setIsOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSave = () => {
    localStorage.setItem('aura-alert-thresholds', JSON.stringify(thresholds))
    setHasChanges(false)
    window.dispatchEvent(new CustomEvent('alert-thresholds-updated', { detail: thresholds }))
  }

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS)
    localStorage.removeItem('aura-alert-thresholds')
    setHasChanges(true)
  }

  const updateThreshold = (key: keyof AlertThresholds, value: number) => {
    setThresholds(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors z-40"
        aria-label="Alert settings"
        title="Alert threshold settings"
      >
        <Settings className="w-5 h-5 text-white/60" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
        >
          <GlassCard glowColor="gold" className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Alert Thresholds</h3>
                <p className="text-white/60 text-sm">Configure when alerts are triggered</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close alert settings"
              >
                <AlertTriangle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Vehicle Health Thresholds */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gold-400 mb-4">Vehicle Health Alerts</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">
                      Low Health Warning Threshold (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={thresholds.lowHealthThreshold}
                        onChange={(e) => updateThreshold('lowHealthThreshold', Number(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-mono w-12 text-right">{thresholds.lowHealthThreshold}%</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">
                      Triggers warning when vehicle health drops below this level
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-white/50 mb-2">
                      Critical Health Threshold (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="25"
                        value={thresholds.criticalHealthThreshold}
                        onChange={(e) => updateThreshold('criticalHealthThreshold', Number(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-mono w-12 text-right">{thresholds.criticalHealthThreshold}%</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">
                      Triggers critical alert when vehicle health is at or below this level
                    </p>
                  </div>
                </div>
              </div>

              {/* Balance Thresholds */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-emerald-400 mb-4">Balance Alerts</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">
                      Negative Balance Threshold ($)
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/40">$</span>
                      <input
                        type="number"
                        value={thresholds.negativeBalanceThreshold}
                        onChange={(e) => updateThreshold('negativeBalanceThreshold', Number(e.target.value))}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">
                      Triggers critical alert when balance falls below this amount
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-white/50 mb-2">
                      Low Balance Warning (% of initial)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={thresholds.lowBalancePercentage}
                        onChange={(e) => updateThreshold('lowBalancePercentage', Number(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-mono w-12 text-right">{thresholds.lowBalancePercentage}%</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">
                      Warns when balance drops below this percentage of starting capital ($1,250,000)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    hasChanges
                      ? 'bg-gold-500 text-onyx-950 hover:bg-gold-400'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] text-white/30 text-center">
                Settings are saved locally and persist across sessions
              </p>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  )
}
