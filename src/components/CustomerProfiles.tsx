import React, { useState } from 'react'
import { useSimulationStore } from '../store/useSimulationStore'
import { GlassCard } from './ui/GlassComponents'
import { formatCurrency } from '../lib/utils'
import { Users, Calendar, Plus, Trash2, Check, X, Clock, DollarSign, Mail, Phone } from 'lucide-react'
import type { Customer, Booking } from '../types'

export const CustomerProfiles: React.FC = () => {
  const { customers, bookings, fleet, addCustomer, deleteCustomer, addBooking, updateBookingStatus, cancelBooking } = useSimulationStore()
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddBooking, setShowAddBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Form states
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', tier: 'standard' as Customer['tier'] })
  const [newBooking, setNewBooking] = useState({ customerId: '', vehicleId: '', date: selectedDate, startTime: '09:00', endTime: '17:00', amount: 0, notes: '' })

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) return
    addCustomer(newCustomer)
    setNewCustomer({ name: '', email: '', phone: '', tier: 'standard' })
    setShowAddCustomer(false)
  }

  const handleAddBooking = () => {
    if (!newBooking.customerId || !newBooking.vehicleId || !newBooking.date) return
    addBooking({ ...newBooking, status: 'confirmed' })
    setNewBooking({ customerId: '', vehicleId: '', date: selectedDate, startTime: '09:00', endTime: '17:00', amount: 0, notes: '' })
    setShowAddBooking(false)
  }

  const getBookingsForDate = (date: string) => {
    return bookings.filter(b => b.date === date)
  }

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown'
  }

  const getVehicleModel = (vehicleId: string) => {
    return fleet.find(v => v.id === vehicleId)?.model || 'Unknown'
  }

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'text-emerald-400'
      case 'pending': return 'text-gold-400'
      case 'completed': return 'text-white/50'
      case 'cancelled': return 'text-red-400'
      default: return 'text-white/50'
    }
  }

  const getTierBadge = (tier: Customer['tier']) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'gold': return 'bg-gold-500/20 text-gold-400 border-gold-500/30'
      case 'standard': return 'bg-white/5 text-white/60 border-white/10'
    }
  }

  const availableVehicles = fleet.filter(v => v.status === 'available')

  return (
    <div className="space-y-6" id="customers">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Customer Profiles & Bookings</h3>
          <p className="text-white/60 text-sm">Manage VIP clients and reservation calendar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddBooking(true)}
            className="px-4 py-2 bg-gold-500 text-onyx-950 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            New Booking
          </button>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="px-4 py-2 bg-emerald-500 text-onyx-950 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard glowColor="emerald">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Total Customers</span>
          </div>
          <p className="text-2xl font-bold font-mono">{customers.length}</p>
        </GlassCard>

        <GlassCard glowColor="gold">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-gold-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Active Bookings</span>
          </div>
          <p className="text-2xl font-bold font-mono">{bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}</p>
        </GlassCard>

        <GlassCard glowColor="emerald">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}</p>
        </GlassCard>

        <GlassCard glowColor="gold">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-gold-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Avg Bookings/Customer</span>
          </div>
          <p className="text-2xl font-bold font-mono">
            {customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalBookings, 0) / customers.length) : 0}
          </p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer List */}
        <GlassCard glowColor="emerald">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Customer Directory</h4>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {customers.map(customer => (
              <div key={customer.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-emerald-500/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-white">{customer.name}</h5>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getTierBadge(customer.tier)} uppercase`}>
                        {customer.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/50">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCustomer(customer.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded text-white/30 hover:text-red-400 transition-colors"
                    aria-label="Delete customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/50">Total Bookings</span>
                    <p className="font-mono text-emerald-400">{customer.totalBookings}</p>
                  </div>
                  <div>
                    <span className="text-white/50">Total Spent</span>
                    <p className="font-mono text-emerald-400">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Booking Calendar */}
        <GlassCard glowColor="gold">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/70">Booking Calendar</h4>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {getBookingsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No bookings for this date</p>
              </div>
            ) : (
              getBookingsForDate(selectedDate).map(booking => (
                <div key={booking.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-white">{getCustomerName(booking.customerId)}</p>
                      <p className="text-xs text-white/50">{getVehicleModel(booking.vehicleId)}</p>
                    </div>
                    <span className={`text-xs font-medium ${getStatusColor(booking.status)} uppercase`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/60 mb-2">
                    <span>{booking.startTime} - {booking.endTime}</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(booking.amount)}</span>
                  </div>
                  {booking.notes && <p className="text-xs text-white/40 italic mb-2">{booking.notes}</p>}
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs hover:bg-white/20 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Complete
                      </button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <GlassCard glowColor="emerald" className="w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">Add New Customer</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Name *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Email *</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="+1-555-0000"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Tier</label>
                <select
                  value={newCustomer.tier}
                  onChange={(e) => setNewCustomer({ ...newCustomer, tier: e.target.value as Customer['tier'] })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="standard">Standard</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddCustomer}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-onyx-950 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
                >
                  Add Customer
                </button>
                <button
                  onClick={() => setShowAddCustomer(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <GlassCard glowColor="gold" className="w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">Create New Booking</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Customer *</label>
                <select
                  value={newBooking.customerId}
                  onChange={(e) => setNewBooking({ ...newBooking, customerId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                >
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Vehicle *</label>
                <select
                  value={newBooking.vehicleId}
                  onChange={(e) => setNewBooking({ ...newBooking, vehicleId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                >
                  <option value="">Select vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Date *</label>
                <input
                  type="date"
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newBooking.endTime}
                    onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={newBooking.amount || ''}
                  onChange={(e) => setNewBooking({ ...newBooking, amount: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Notes</label>
                <textarea
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  rows={2}
                  placeholder="Optional booking notes..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddBooking}
                  className="flex-1 px-4 py-2 bg-gold-500 text-onyx-950 rounded-lg font-medium hover:bg-gold-400 transition-colors"
                >
                  Create Booking
                </button>
                <button
                  onClick={() => setShowAddBooking(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
