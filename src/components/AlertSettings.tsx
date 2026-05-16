import React, { useState } from 'react'
import { SimpleCard } from './ui/GlassComponents'
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
        className="fixed bottom-4 left-4 p-3 border rounded-md hover:bg-muted transition-colors z-40"
        aria-label="Alert settings"
        title="Alert threshold settings"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
        >
          <SimpleCard className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Alert thresholds</h3>
                <p className="text-muted-foreground text-sm">Configure when alerts are triggered</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                aria-label="Close alert settings"
              >
                <AlertTriangle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Vehicle Health Thresholds */}
              <div>
                <h4 className="text-xs font-semibold text-amber-600 mb-4">Vehicle health alerts</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">
                      Low health warning threshold (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={thresholds.lowHealthThreshold}
                        onChange={(e) => updateThreshold('lowHealthThreshold', Number(e.target.value))}
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-mono w-12 text-right">{thresholds.lowHealthThreshold}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Triggers warning when vehicle health drops below this level
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">
                      Critical health threshold (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="25"
                        value={thresholds.criticalHealthThreshold}
                        onChange={(e) => updateThreshold('criticalHealthThreshold', Number(e.target.value))}
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-mono w-12 text-right">{thresholds.criticalHealthThreshold}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Triggers critical alert when vehicle health is at or below this level
                    </p>
                  </div>
                </div>
              </div>

              {/* Balance Thresholds */}
              <div>
                <h4 className="text-xs font-semibold text-emerald-600 mb-4">Balance alerts</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">
                      Negative balance threshold ($)
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">$</span>
                      <input
                        type="number"
                        value={thresholds.negativeBalanceThreshold}
                        onChange={(e) => updateThreshold('negativeBalanceThreshold', Number(e.target.value))}
                        className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Triggers critical alert when balance falls below this amount
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">
                      Low balance warning (% of initial)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={thresholds.lowBalancePercentage}
                        onChange={(e) => updateThreshold('lowBalancePercentage', Number(e.target.value))}
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-mono w-12 text-right">{thresholds.lowBalancePercentage}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Warns when balance drops below this percentage of starting capital ($1,250,000)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                    hasChanges
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Save settings
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border rounded-md text-muted-foreground hover:bg-muted transition-colors"
                >
                  Reset to defaults
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-[10px] text-muted-foreground text-center">
                Settings are saved locally and persist across sessions
              </p>
            </div>
          </SimpleCard>
        </div>
      )}
    </>
  )
}
