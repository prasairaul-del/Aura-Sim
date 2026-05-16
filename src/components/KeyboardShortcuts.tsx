import React, { useEffect, useState } from 'react'
import { useSimulationStore } from '../store/useSimulationStore'
import { SimpleCard } from './ui/GlassComponents'
import { Keyboard, X } from 'lucide-react'

interface Shortcut {
  keys: string[]
  description: string
  action: () => void
}

export const KeyboardShortcuts: React.FC = () => {
  const { toggleSimulation } = useSimulationStore()
  const [showHelp, setShowHelp] = useState(false)

  const shortcuts: Shortcut[] = [
    {
      keys: ['Space'],
      description: 'Toggle simulation',
      action: () => {
        toggleSimulation()
      },
    },
    {
      keys: ['?'],
      description: 'Show keyboard shortcuts',
      action: () => setShowHelp(true),
    },
    {
      keys: ['Escape'],
      description: 'Close modals/panels',
      action: () => setShowHelp(false),
    },
    {
      keys: ['g', 'd'],
      description: 'Scroll to Dashboard',
      action: () => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      keys: ['g', 'f'],
      description: 'Scroll to Fleet',
      action: () => document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      keys: ['g', 'l'],
      description: 'Scroll to Ledger',
      action: () => document.getElementById('ledger')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      keys: ['g', 'a'],
      description: 'Scroll to Analytics',
      action: () => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      keys: ['g', 'c'],
      description: 'Scroll to Customers',
      action: () => document.getElementById('customers')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      keys: ['g', 'b'],
      description: 'Scroll to Budget',
      action: () => document.getElementById('budget')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      keys: ['g', 's'],
      description: 'Scroll to Staff',
      action: () => document.getElementById('staff')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      keys: ['g', 'o'],
      description: 'Scroll to Virtual COO',
      action: () => document.getElementById('coo')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      keys: ['r'],
      description: 'Refresh page',
      action: () => window.location.reload(),
    },
  ]

  useEffect(() => {
    let pendingKeys: string[] = []
    let timeoutId: NodeJS.Timeout | null = null

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }

      const key = e.key

      // Handle single-key shortcuts immediately
      if (key === ' ') {
        e.preventDefault()
        toggleSimulation()
        return
      }

      if (key === '?') {
        e.preventDefault()
        setShowHelp(prev => !prev)
        return
      }

      if (key === 'Escape') {
        setShowHelp(false)
        return
      }

      if (key === 'r' || key === 'R') {
        e.preventDefault()
        window.location.reload()
        return
      }

      // Handle two-key sequences (g + x)
      if (key === 'g') {
        pendingKeys = ['g']
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          pendingKeys = []
        }, 1000)
        return
      }

      if (pendingKeys.includes('g')) {
        const combo = `g ${key}`
        const shortcut = shortcuts.find(s => s.keys.join(' ') === combo)
        if (shortcut) {
          e.preventDefault()
          shortcut.action()
          pendingKeys = []
          if (timeoutId) clearTimeout(timeoutId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [toggleSimulation])

  return (
    <>
      {/* Keyboard shortcut indicator */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 p-3 border rounded-md hover:bg-muted transition-colors z-40"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setShowHelp(false) }}
        >
          <SimpleCard className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Keyboard shortcuts</h3>
                <p className="text-muted-foreground text-sm">Power user shortcuts for quick navigation</p>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                aria-label="Close keyboard shortcuts"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Simulation Controls */}
              <div>
                <h4 className="text-xs font-semibold text-emerald-600 mb-3">Simulation controls</h4>
                <div className="space-y-2">
                  {shortcuts.filter(s => s.keys.length === 1 && ['Space'].includes(s.keys[0])).map((shortcut, i) => (
                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-md">
                      <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map(key => (
                          <kbd key={key} className="px-2 py-1 bg-muted border rounded text-xs font-mono">
                            {key === ' ' ? 'Space' : key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="text-xs font-semibold text-amber-600 mb-3">Navigation (Go to...)</h4>
                <div className="space-y-2">
                  {shortcuts.filter(s => s.keys.length === 2).map((shortcut, i) => (
                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-md">
                      <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map(key => (
                          <kbd key={key} className="px-2 py-1 bg-muted border rounded text-xs font-mono">
                            {key.toUpperCase()}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-3">General</h4>
                <div className="space-y-2">
                  {shortcuts.filter(s => ['?', 'Escape', 'r'].includes(s.keys[0])).map((shortcut, i) => (
                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-md">
                      <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map(key => (
                          <kbd key={key} className="px-2 py-1 bg-muted border rounded text-xs font-mono">
                            {key === ' ' ? 'Space' : key === '?' ? '?' : key.toUpperCase()}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded">?</kbd> to toggle this help
              </p>
            </div>
          </SimpleCard>
        </div>
      )}
    </>
  )
}
