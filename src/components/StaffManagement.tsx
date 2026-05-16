import React, { useState } from 'react'
import { GlassCard } from './ui/GlassComponents'
import { formatCurrency } from '../lib/utils'
import { Users, UserPlus, UserMinus, DollarSign, Star, Briefcase } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  salary: number
  performance: number // 0-100
  hireDate: string
  status: 'active' | 'on-leave' | 'terminated'
}

export const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: 'Marcus Wellington', role: 'Fleet Manager', department: 'Operations', salary: 8500, performance: 92, hireDate: '2023-06-15', status: 'active' },
    { id: '2', name: 'Sarah Chen', role: 'Senior Driver', department: 'Fleet', salary: 4500, performance: 88, hireDate: '2023-08-20', status: 'active' },
    { id: '3', name: 'James Rodriguez', role: 'Mechanic', department: 'Maintenance', salary: 5200, performance: 75, hireDate: '2023-09-10', status: 'active' },
    { id: '4', name: 'Emily Watson', role: 'Marketing Director', department: 'Marketing', salary: 7800, performance: 85, hireDate: '2024-01-05', status: 'active' },
    { id: '5', name: 'David Kim', role: 'Accountant', department: 'Finance', salary: 6200, performance: 90, hireDate: '2024-02-15', status: 'on-leave' },
  ])
  const [showHireModal, setShowHireModal] = useState(false)
  const [newStaff, setNewStaff] = useState({ name: '', role: '', department: 'Operations', salary: 0 })

  const handleHire = () => {
    if (!newStaff.name || !newStaff.role || !newStaff.salary) return
    const newMember: StaffMember = {
      ...newStaff,
      id: Math.random().toString(36).substring(2, 9),
      performance: 70 + Math.floor(Math.random() * 20),
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
    }
    setStaff([...staff, newMember])
    setNewStaff({ name: '', role: '', department: 'Operations', salary: 0 })
    setShowHireModal(false)
  }

  const handleFire = (id: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, status: 'terminated' } : s))
  }

  const handleReactivate = (id: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, status: 'active' } : s))
  }

  const activeStaff = staff.filter(s => s.status === 'active')
  const totalMonthlySalary = activeStaff.reduce((sum, s) => sum + s.salary, 0)
  const avgPerformance = activeStaff.length > 0
    ? Math.round(activeStaff.reduce((sum, s) => sum + s.performance, 0) / activeStaff.length)
    : 0

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400'
    if (score >= 75) return 'text-gold-400'
    return 'text-red-400'
  }

  const getPerformanceStars = (score: number) => {
    const stars = Math.round(score / 20)
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < stars ? 'text-gold-400 fill-current' : 'text-white/20'}`} />
    ))
  }

  return (
    <div className="space-y-6" id="staff">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Staff Management</h3>
          <p className="text-white/60 text-sm">Manage team members, salaries, and performance</p>
        </div>
        <button
          onClick={() => setShowHireModal(true)}
          className="px-4 py-2 bg-emerald-500 text-onyx-950 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Hire Staff
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard glowColor="emerald">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Active Staff</span>
          </div>
          <p className="text-2xl font-bold font-mono">{activeStaff.length}</p>
          <p className="text-xs text-white/50 mt-1">Total team members</p>
        </GlassCard>

        <GlassCard glowColor="gold">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-gold-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Monthly Payroll</span>
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(totalMonthlySalary)}</p>
          <p className="text-xs text-white/50 mt-1">Total salaries</p>
        </GlassCard>

        <GlassCard glowColor="emerald">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Avg Performance</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${getPerformanceColor(avgPerformance)}`}>{avgPerformance}%</p>
          <p className="text-xs text-white/50 mt-1">Team average</p>
        </GlassCard>

        <GlassCard glowColor="gold">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-5 h-5 text-gold-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Departments</span>
          </div>
          <p className="text-2xl font-bold font-mono">{new Set(activeStaff.map(s => s.department)).size}</p>
          <p className="text-xs text-white/50 mt-1">Active departments</p>
        </GlassCard>
      </div>

      {/* Staff Directory */}
      <GlassCard glowColor="emerald">
        <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Staff Directory</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Name</th>
                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Role</th>
                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Department</th>
                <th className="text-right py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Salary</th>
                <th className="text-center py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Performance</th>
                <th className="text-center py-3 px-4 text-[10px] uppercase tracking-widest text-white/50">Status</th>
                <th className="text-center py-3 px-4 text-[10px] uppercase tracking-widest text-white/50"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${member.status === 'terminated' ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-gold-500 flex items-center justify-center text-onyx-950 font-bold text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-[10px] text-white/40">Since {member.hireDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/70">{member.role}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {member.department}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 font-mono">{formatCurrency(member.salary)}/mo</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {getPerformanceStars(member.performance)}
                      <span className={`ml-2 text-xs font-mono ${getPerformanceColor(member.performance)}`}>
                        {member.performance}%
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    {member.status === 'active' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                    {member.status === 'on-leave' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
                        On Leave
                      </span>
                    )}
                    {member.status === 'terminated' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        Terminated
                      </span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {member.status === 'active' && (
                      <button
                        onClick={() => handleFire(member.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded text-white/30 hover:text-red-400 transition-colors"
                        aria-label={`Terminate ${member.name}`}
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                    {member.status === 'terminated' && (
                      <button
                        onClick={() => handleReactivate(member.id)}
                        className="p-1.5 hover:bg-emerald-500/10 rounded text-white/30 hover:text-emerald-400 transition-colors"
                        aria-label={`Reactivate ${member.name}`}
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Department Summary */}
      <GlassCard glowColor="gold">
        <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Department Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(staff.filter(s => s.status === 'active').map(s => s.department))).map(dept => {
            const deptStaff = staff.filter(s => s.department === dept && s.status === 'active')
            const deptSalary = deptStaff.reduce((sum, s) => sum + s.salary, 0)
            const deptPerf = Math.round(deptStaff.reduce((sum, s) => sum + s.performance, 0) / deptStaff.length)

            return (
              <div key={dept} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-white/70">{dept}</h5>
                  <span className="text-xs text-white/40">{deptStaff.length} staff</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">Monthly Cost</span>
                    <span className="font-mono text-gold-400">{formatCurrency(deptSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Avg Performance</span>
                    <span className={`font-mono ${getPerformanceColor(deptPerf)}`}>{deptPerf}%</span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getPerformanceColor(deptPerf).replace('text-', 'bg-')}`}
                        style={{ width: `${deptPerf}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <GlassCard glowColor="emerald" className="w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">Hire New Staff Member</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Role/Title *</label>
                <input
                  type="text"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., Senior Driver"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Department</label>
                <select
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="Operations">Operations</option>
                  <option value="Fleet">Fleet</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">Monthly Salary ($)</label>
                <input
                  type="number"
                  value={newStaff.salary || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, salary: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleHire}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-onyx-950 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
                >
                  Hire Employee
                </button>
                <button
                  onClick={() => setShowHireModal(false)}
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