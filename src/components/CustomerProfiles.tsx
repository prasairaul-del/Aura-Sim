import React, { useState } from 'react'
import { useSimulationStore } from '../store/useSimulationStore'
import { Button, FormInput, FormSelect, Modal, SectionHeader, SimpleCard, StatCard } from './ui/GlassComponents'
import { formatCurrency } from '../lib/utils'
import { Users, Calendar, Plus, Trash2, Check, X, Clock, DollarSign, Mail, Phone } from 'lucide-react'
import type { Customer, Booking } from '../types'

export const CustomerProfiles: React.FC = () => {
  const { customers, bookings, fleet, addCustomer, deleteCustomer, addBooking, updateBookingStatus, cancelBooking } = useSimulationStore()
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddBooking, setShowAddBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

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

  const getBookingsForDate = (date: string) => bookings.filter(b => b.date === date)
  const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || 'Unknown'
  const getVehicleModel = (vehicleId: string) => fleet.find(v => v.id === vehicleId)?.model || 'Unknown'

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'text-emerald-500'
      case 'pending': return 'text-gold-500'
      case 'completed': return 'text-gray-500'
      case 'cancelled': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getTierBadge = (tier: Customer['tier']) => {
    switch (tier) {
      case 'platinum': return 'text-purple-400'
      case 'gold': return 'text-gold-500'
      default: return 'text-gray-500'
    }
  }

  const availableVehicles = fleet.filter(v => v.status === 'available')

  return (
    <div className="space-y-6" id="customers">
      <SectionHeader
        title="Customer Profiles & Bookings"
        description="Manage clients and reservations"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowAddBooking(true)} style={{ backgroundColor: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', color: 'var(--app-text-muted)' }}>
              <Calendar className="w-3.5 h-3.5" />
              New Booking
            </Button>
            <Button onClick={() => setShowAddCustomer(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add Customer
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-emerald-400" />} label="Total Customers" value={customers.length.toString()} />
        <StatCard icon={<Calendar className="w-5 h-5 text-gold-400" />} label="Active Bookings" value={bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length.toString()} />
        <StatCard icon={<DollarSign className="w-5 h-5 text-emerald-400" />} label="Total Revenue" value={formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))} />
        <StatCard icon={<Clock className="w-5 h-5 text-gold-400" />} label="Avg Bookings/Customer" value={customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalBookings, 0) / customers.length).toString() : '0'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleCard>
          <h4 className="text-sm font-medium mb-4">Customer Directory</h4>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {customers.map(customer => (
              <div key={customer.id} className="p-3 border hover:border-emerald-500/30 transition-colors" style={{ borderColor: 'var(--app-card-border)', backgroundColor: 'var(--app-card-bg)', borderRadius: '8px' }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">{customer.name}</h5>
                      <span className={`text-xs ${getTierBadge(customer.tier)} uppercase`}>
                        {customer.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--app-text-muted)' }}>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCustomer(customer.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                    style={{ color: 'var(--app-text-muted)' }}
                    aria-label="Delete customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span style={{ color: 'var(--app-text-muted)' }}>Total Bookings</span>
                    <p className="font-mono text-emerald-500">{customer.totalBookings}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--app-text-muted)' }}>Total Spent</span>
                    <p className="font-mono text-emerald-500">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SimpleCard>

        <SimpleCard>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium">Booking Calendar</h4>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              style={{ borderColor: 'var(--app-input-border)', backgroundColor: 'var(--app-input-bg)', color: 'var(--app-input-text)', borderRadius: '6px' }}
            />
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {getBookingsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--app-text-muted)' }}>
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No bookings for this date</p>
              </div>
            ) : (
              getBookingsForDate(selectedDate).map(booking => (
                <div key={booking.id} className="p-3 border" style={{ borderColor: 'var(--app-card-border)', backgroundColor: 'var(--app-card-bg)', borderRadius: '8px' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{getCustomerName(booking.customerId)}</p>
                      <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{getVehicleModel(booking.vehicleId)}</p>
                    </div>
                    <span className={`text-xs font-medium ${getStatusColor(booking.status)} uppercase`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-2" style={{ color: 'var(--app-text-muted)' }}>
                    <span>{booking.startTime} - {booking.endTime}</span>
                    <span className="font-mono text-emerald-500">{formatCurrency(booking.amount)}</span>
                  </div>
                  {booking.notes && <p className="text-xs italic mb-2" style={{ color: 'var(--app-text-muted)' }}>{booking.notes}</p>}
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="px-2 py-1 text-emerald-500 text-xs rounded hover:bg-emerald-500/10 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="px-2 py-1 border text-xs rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
                        style={{ borderColor: 'var(--app-card-border)', backgroundColor: 'var(--app-card-bg-hover)', color: 'var(--app-text-muted)' }}
                      >
                        <Check className="w-3 h-3" /> Complete
                      </button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="px-2 py-1 text-red-500 text-xs rounded hover:bg-red-500/10 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </SimpleCard>
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={showAddCustomer} onClose={() => setShowAddCustomer(false)} title="Add New Customer" size="sm">
        <div className="space-y-3">
          <FormInput label="Name *" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder="Enter customer name" />
          <FormInput label="Email *" type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="customer@example.com" />
          <FormInput label="Phone" type="tel" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="+1-555-0000" />
          <FormSelect label="Tier" value={newCustomer.tier} onChange={(e) => setNewCustomer({ ...newCustomer, tier: e.target.value as Customer['tier'] })}>
            <option value="standard" style={{ backgroundColor: 'var(--app-option-bg)' }}>Standard</option>
            <option value="gold" style={{ backgroundColor: 'var(--app-option-bg)' }}>Gold</option>
            <option value="platinum" style={{ backgroundColor: 'var(--app-option-bg)' }}>Platinum</option>
          </FormSelect>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddCustomer} className="flex-1">Add Customer</Button>
            <Button variant="secondary" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Add Booking Modal */}
      <Modal isOpen={showAddBooking} onClose={() => setShowAddBooking(false)} title="Create New Booking" size="sm">
        <div className="space-y-3">
          <FormSelect label="Customer *" value={newBooking.customerId} onChange={(e) => setNewBooking({ ...newBooking, customerId: e.target.value })}>
            <option value="" style={{ backgroundColor: 'var(--app-option-bg)' }}>Select customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id} style={{ backgroundColor: 'var(--app-option-bg)' }}>{c.name} ({c.tier})</option>
            ))}
          </FormSelect>
          <FormSelect label="Vehicle *" value={newBooking.vehicleId} onChange={(e) => setNewBooking({ ...newBooking, vehicleId: e.target.value })}>
            <option value="" style={{ backgroundColor: 'var(--app-option-bg)' }}>Select vehicle</option>
            {availableVehicles.map(v => (
              <option key={v.id} value={v.id} style={{ backgroundColor: 'var(--app-option-bg)' }}>{v.model}</option>
            ))}
          </FormSelect>
          <FormInput label="Date *" type="date" value={newBooking.date} onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Start Time" type="time" value={newBooking.startTime} onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })} />
            <FormInput label="End Time" type="time" value={newBooking.endTime} onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })} />
          </div>
          <FormInput label="Amount ($)" type="number" value={newBooking.amount || ''} onChange={(e) => setNewBooking({ ...newBooking, amount: Number(e.target.value) })} placeholder="0.00" />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Notes</label>
            <textarea
              value={newBooking.notes}
              onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)', borderRadius: '6px' }}
              rows={2}
              placeholder="Optional booking notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddBooking} className="flex-1">Create Booking</Button>
            <Button variant="secondary" onClick={() => setShowAddBooking(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
