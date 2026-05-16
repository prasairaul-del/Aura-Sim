import React, { useState } from 'react'
import { SimpleCard } from './ui/GlassComponents'
import { Layers, Plus, Trash2, Check } from 'lucide-react'
import { useSimulationStore } from '../store/useSimulationStore'

interface SimulationProfile {
  id: string
  name: string
  description: string
  createdAt: string
  fleetSize: number
  initialBalance: number
  customVehicles?: CustomVehicle[]
}

interface CustomVehicle {
  model: string
  purchaseDate: string
  currentValuation: number
  health?: number
  status?: 'available' | 'in-service' | 'maintenance'
}

export const ScenarioManager: React.FC = () => {
  const { resetSimulation } = useSimulationStore()
  const [profiles, setProfiles] = useState<SimulationProfile[]>(() => {
    const saved = localStorage.getItem('aura-simulation-profiles')
    return saved ? JSON.parse(saved) : [
      { id: 'default', name: 'Standard Fleet', description: 'Balanced luxury fleet simulation', createdAt: new Date().toISOString(), fleetSize: 3, initialBalance: 1250000 },
      { id: 'aggressive-growth', name: 'Aggressive Growth', description: 'Growth phase with 20 limo fleet', createdAt: new Date().toISOString(), fleetSize: 20, initialBalance: 3000000 },
      { id: 'conservative', name: 'Conservative Start', description: 'Small fleet, high cash reserves', createdAt: new Date().toISOString(), fleetSize: 2, initialBalance: 2000000 },
      { id: 'mega-fleet', name: 'Mega Fleet', description: 'Large scale operation with 50 vehicles', createdAt: new Date().toISOString(), fleetSize: 50, initialBalance: 8000000 },
    ]
  })
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('aura-active-profile') || 'default'
  })
  const [showNewProfile, setShowNewProfile] = useState(false)
  const [newProfile, setNewProfile] = useState({ name: '', description: '', fleetSize: 3, initialBalance: 1250000 })
  const [useCustomVehicles, setUseCustomVehicles] = useState(false)
  const [customVehicles, setCustomVehicles] = useState<CustomVehicle[]>([])
  const [newVehicle, setNewVehicle] = useState<CustomVehicle>({ model: '', purchaseDate: new Date().toISOString().split('T')[0], currentValuation: 0, health: 100, status: 'available' })

  const handleAddCustomVehicle = () => {
    if (!newVehicle.model || !newVehicle.currentValuation) return
    setCustomVehicles([...customVehicles, { ...newVehicle, id: Math.random().toString(36).substring(2, 9) } as any])
    setNewVehicle({ model: '', purchaseDate: new Date().toISOString().split('T')[0], currentValuation: 0, health: 100, status: 'available' })
  }

  const handleRemoveCustomVehicle = (index: number) => {
    setCustomVehicles(customVehicles.filter((_, i) => i !== index))
  }

  const handleCreateProfile = () => {
    if (!newProfile.name) return
    const profile: SimulationProfile = {
      ...newProfile,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      customVehicles: useCustomVehicles ? customVehicles : undefined,
    }
    const updated = [...profiles, profile]
    setProfiles(updated)
    localStorage.setItem('aura-simulation-profiles', JSON.stringify(updated))
    setNewProfile({ name: '', description: '', fleetSize: 3, initialBalance: 1250000 })
    setUseCustomVehicles(false)
    setCustomVehicles([])
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
    const profile = profiles.find(p => p.id === id)
    if (!profile) return
    
    setActiveProfileId(id)
    localStorage.setItem('aura-active-profile', id)
    
    // Reset simulation with new scenario parameters
    resetSimulation(profile.fleetSize, profile.initialBalance, profile.customVehicles)
  }

  const activeProfile = profiles.find(p => p.id === activeProfileId)

  return (
    <>
      <button
        onClick={() => setShowNewProfile(true)}
        className="fixed bottom-4 left-20 p-3 border rounded-md hover:bg-muted transition-colors z-40"
        aria-label="Scenario manager"
        title="Manage simulation scenarios"
      >
        <Layers className="w-5 h-5 text-muted-foreground" />
      </button>

      {showNewProfile && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewProfile(false) }}
        >
          <SimpleCard className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Simulation scenarios</h3>
                <p className="text-muted-foreground text-sm">Manage different fleet configurations</p>
              </div>
              <button
                onClick={() => setShowNewProfile(false)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                aria-label="Close scenario manager"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* Active Profile Indicator */}
            {activeProfile && (
              <div className="mb-6 p-4 bg-emerald-100 border border-emerald-200 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">Active scenario</span>
                </div>
                <p className="font-medium">{activeProfile.name}</p>
                <p className="text-xs text-muted-foreground">{activeProfile.description}</p>
              </div>
            )}

            {/* Profile List */}
            <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
              {profiles.map(profile => (
                <div
                  key={profile.id}
                  className={`p-4 rounded-md border transition-colors ${
                    profile.id === activeProfileId
                      ? 'bg-emerald-100 border-emerald-500'
                      : 'border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => handleSwitchProfile(profile.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{profile.name}</h4>
                        {profile.id === activeProfileId && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-700">Active</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{profile.description}</p>
                      <div className="flex gap-4 text-[10px] text-muted-foreground">
                        <span>{profile.fleetSize} vehicles</span>
                        <span>${profile.initialBalance.toLocaleString()} initial</span>
                      </div>
                    </div>
                    {profile.id !== 'default' && (
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="p-1.5 hover:bg-red-100 rounded text-muted-foreground hover:text-red-500 transition-colors ml-2"
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
            <div className="pt-6 border-t">
              <h4 className="text-xs font-semibold text-amber-600 mb-4">Create new scenario</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Scenario name *</label>
                  <input
                    type="text"
                    value={newProfile.name}
                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Aggressive growth"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Description</label>
                  <input
                    type="text"
                    value={newProfile.description}
                    onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Brief description of this scenario"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Initial fleet size</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={newProfile.fleetSize}
                      onChange={(e) => setNewProfile({ ...newProfile, fleetSize: Number(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Max 200 vehicles for auto-generated fleet</p>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Starting balance ($)</label>
                    <input
                      type="number"
                      value={newProfile.initialBalance}
                      onChange={(e) => setNewProfile({ ...newProfile, initialBalance: Number(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Custom Vehicle Entry Toggle */}
                <div className="pt-2 border-t">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomVehicles}
                      onChange={(e) => setUseCustomVehicles(e.target.checked)}
                      className="w-4 h-4 rounded border-emerald-500 text-emerald-500 focus:ring-emerald-500/50"
                    />
                    <span className="text-xs font-medium">Manually enter vehicles (instead of auto-generating)</span>
                  </label>
                </div>

                {/* Custom Vehicle Entry Form */}
                {useCustomVehicles && (
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-semibold text-emerald-600">Custom Fleet Configuration</h5>
                    
                    {/* Add Vehicle Form */}
                    <div className="p-3 border rounded-md bg-muted/30 space-y-3">
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-1">Vehicle model *</label>
                        <input
                          type="text"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                          className="w-full border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          placeholder="e.g., Rolls-Royce Ghost 2023"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-1">Purchase date</label>
                          <input
                            type="date"
                            value={newVehicle.purchaseDate}
                            onChange={(e) => setNewVehicle({ ...newVehicle, purchaseDate: e.target.value })}
                            className="w-full border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-1">Current valuation ($) *</label>
                          <input
                            type="number"
                            value={newVehicle.currentValuation || ''}
                            onChange={(e) => setNewVehicle({ ...newVehicle, currentValuation: Number(e.target.value) })}
                            className="w-full border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-1">Health (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newVehicle.health}
                            onChange={(e) => setNewVehicle({ ...newVehicle, health: Number(e.target.value) })}
                            className="w-full border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-1">Status</label>
                          <select
                            value={newVehicle.status}
                            onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value as any })}
                            className="w-full border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          >
                            <option value="available">Available</option>
                            <option value="in-service">In Service</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={handleAddCustomVehicle}
                        disabled={!newVehicle.model || !newVehicle.currentValuation}
                        className="w-full px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-md font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add vehicle
                      </button>
                    </div>

                    {/* Vehicle List */}
                    {customVehicles.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {customVehicles.map((vehicle, index) => (
                          <div key={index} className="p-2 border rounded-md bg-card text-xs">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{vehicle.model}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  Purchased: {vehicle.purchaseDate} • Value: ${vehicle.currentValuation.toLocaleString()} • Health: {vehicle.health}%
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveCustomVehicle(index)}
                                className="p-1 hover:bg-red-100 rounded text-red-500 ml-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] text-muted-foreground text-center pt-1">
                          {customVehicles.length} vehicle{customVehicles.length !== 1 ? 's' : ''} configured
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleCreateProfile}
                  disabled={!newProfile.name}
                  className={`w-full px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                    newProfile.name
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Create scenario
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-[10px] text-muted-foreground text-center">
                Profiles are saved locally. Switching scenarios preserves current progress.
              </p>
            </div>
          </SimpleCard>
        </div>
      )}
    </>
  )
}
