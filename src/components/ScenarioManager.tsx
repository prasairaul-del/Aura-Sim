import React, { useState } from 'react'
import { GlassCard } from './ui/GlassComponents'
import { Layers, Plus, Trash2, Check } from 'lucide-react'

interface SimulationProfile {
  id: string
  name: string
  description: string
  createdAt: string
  fleetSize: number
  initialBalance: number
}

export const ScenarioManager: React.FC = () => {
  const [profiles, setProfiles] = useState<SimulationProfile[]>(() => {
    const saved = localStorage.getItem('aura-simulation-profiles')
    return saved ? JSON.parse(saved) : [
      { id: 'default', name: 'Default Scenario', description: 'Standard luxury fleet simulation', createdAt: new Date().toISOString(), fleetSize: 3, initialBalance: 1250000 },
    ]
  })
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('aura-active-profile') || 'default'
  })
  const [showNewProfile, setShowNewProfile] = useState(false)
  const [newProfile, setNewProfile] = useState({ name: '', description: '', fleetSize: 3, initialBalance: 1250000 })

  const handleCreateProfile = () => {
    if (!newProfile.name) return
    const profile: SimulationProfile = {
      ...newProfile,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    }
    const updated = [...profiles, profile]
    setProfiles(updated)
    localStorage.setItem('aura-simulation-profiles', JSON.stringify(updated))
    setNewProfile({ name: '', description: '', fleetSize: 3, initialBalance: 1250000 })
    setShowNewProfile(false)
  }

  const handleDeleteProfile = (id: string) => {
    if (id === 'default') return // Cannot delete default
    const updated = profiles.filter(p => p.id !== id)
    setProfiles(updated)
    localStorage.setItem('aura-simulation-profiles', JSON.stringify(updated))
    if (activeProfileId === id) {
      setActiveProfileId('default')
      localStorage.setItem('aura-active-profile', 'default')
    }
  }

  const handleSwitchProfile = (id: string) => {
    setActiveProfileId(id)
    localStorage.setItem('aura-active-profile', id)
    // Trigger a custom event for other components to react
    window.dispatchEvent(new CustomEvent('profile-switched', { detail: id }))
  }

  const activeProfile = profiles.find(p => p.id === activeProfileId)

  return (
    <>
      <button
        onClick={() => setShowNewProfile(true)}
        className="fixed bottom-4 left-20 p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors z-40"
        aria-label="Scenario manager"
        title="Manage simulation scenarios"
      >
        <Layers className="w-5 h-5 text-white/60" />
      </button>

      {showNewProfile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewProfile(false) }}
        >
          <GlassCard glowColor="emerald" className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Simulation Scenarios</h3>
                <p className="text-white/60 text-sm">Manage different fleet configurations</p>
              </div>
              <button
                onClick={() => setShowNewProfile(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close scenario manager"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* Active Profile Indicator */}
            {activeProfile && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs uppercase tracking-widest text-emerald-400">Active Scenario</span>
                </div>
                <p className="font-medium">{activeProfile.name}</p>
                <p className="text-xs text-white/50">{activeProfile.description}</p>
              </div>
            )}

            {/* Profile List */}
            <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
              {profiles.map(profile => (
                <div
                  key={profile.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    profile.id === activeProfileId
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => handleSwitchProfile(profile.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{profile.name}</h4>
                        {profile.id === activeProfileId && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Active</span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mb-2">{profile.description}</p>
                      <div className="flex gap-4 text-[10px] text-white/40">
                        <span>{profile.fleetSize} vehicles</span>
                        <span>${profile.initialBalance.toLocaleString()} initial</span>
                      </div>
                    </div>
                    {profile.id !== 'default' && (
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded text-white/30 hover:text-red-400 transition-colors ml-2"
                        aria-label={`Delete ${profile.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Create New Profile Form */}
            <div className="pt-6 border-t border-white/10">
              <h4 className="text-xs uppercase tracking-widest text-gold-400 mb-4">Create New Scenario</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Scenario Name *</label>
                  <input
                    type="text"
                    value={newProfile.name}
                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="e.g., Aggressive Growth"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Description</label>
                  <input
                    type="text"
                    value={newProfile.description}
                    onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Brief description of this scenario"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Initial Fleet Size</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newProfile.fleetSize}
                      onChange={(e) => setNewProfile({ ...newProfile, fleetSize: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Starting Balance ($)</label>
                    <input
                      type="number"
                      value={newProfile.initialBalance}
                      onChange={(e) => setNewProfile({ ...newProfile, initialBalance: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateProfile}
                  disabled={!newProfile.name}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    newProfile.name
                      ? 'bg-emerald-500 text-onyx-950 hover:bg-emerald-400'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Create Scenario
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] text-white/30 text-center">
                Profiles are saved locally. Switching scenarios preserves current progress.
              </p>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  )
}
