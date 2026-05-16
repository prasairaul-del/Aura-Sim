import React, { useState } from 'react'
import { SimpleCard } from './ui/GlassComponents'
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
      <Star key={i} className={`w-3 h-3 ${i < stars ? 'text-gold-400 fill-current' : 'text-gray-300'}`} />
    ))
  }

  return (
    <div className="space-y-6" id="staff">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Staff management</h3>
          <p className="text-muted-foreground text-sm">Manage team members, salaries, and performance</p>
        </div>
        <button
          onClick={() => setShowHireModal(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Hire staff
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SimpleCard>
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Active staff</span>
          </div>
          <p className="text-2xl font-bold">{activeStaff.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total team members</p>
        </SimpleCard>

        <SimpleCard>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Monthly payroll</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalMonthlySalary)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total salaries</p>
        </SimpleCard>

        <SimpleCard>
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Avg performance</span>
          </div>
          <p className={`text-2xl font-bold ${getPerformanceColor(avgPerformance)}`}>{avgPerformance}%</p>
          <p className="text-xs text-muted-foreground mt-1">Team average</p>
        </SimpleCard>

        <SimpleCard>
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Departments</span>
          </div>
          <p className="text-2xl font-bold">{new Set(activeStaff.map(s => s.department)).size}</p>
          <p className="text-xs text-muted-foreground mt-1">Active departments</p>
        </SimpleCard>
      </div>

      {/* Staff Directory */}
      <SimpleCard>
        <h4 className="text-sm font-semibold mb-4">Staff directory</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-xs text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground">Department</th>
                <th className="text-right py-3 px-4 text-xs text-muted-foreground">Salary</th>
                <th className="text-center py-3 px-4 text-xs text-muted-foreground">Performance</th>
                <th className="text-center py-3 px-4 text-xs text-muted-foreground">Status</th>
                <th className="text-center py-3 px-4 text-xs text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id} className={`border-b hover:bg-muted/50 transition-colors ${member.status === 'terminated' ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">Since {member.hireDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{member.role}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded border">
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
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                    {member.status === 'on-leave' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                        On leave
                      </span>
                    )}
                    {member.status === 'terminated' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                        Terminated
                      </span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {member.status === 'active' && (
                      <button
                        onClick={() => handleFire(member.id)}
                        className="p-1.5 hover:bg-red-100 rounded text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label={`Terminate ${member.name}`}
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                    {member.status === 'terminated' && (
                      <button
                        onClick={() => handleReactivate(member.id)}
                        className="p-1.5 hover:bg-emerald-100 rounded text-muted-foreground hover:text-emerald-500 transition-colors"
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
      </SimpleCard>

      {/* Department Summary */}
      <SimpleCard>
        <h4 className="text-sm font-semibold mb-4">Department summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(staff.filter(s => s.status === 'active').map(s => s.department))).map(dept => {
            const deptStaff = staff.filter(s => s.department === dept && s.status === 'active')
            const deptSalary = deptStaff.reduce((sum, s) => sum + s.salary, 0)
            const deptPerf = Math.round(deptStaff.reduce((sum, s) => sum + s.performance, 0) / deptStaff.length)

            return (
              <div key={dept} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium">{dept}</h5>
                  <span className="text-xs text-muted-foreground">{deptStaff.length} staff</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly cost</span>
                    <span className="font-mono text-amber-600">{formatCurrency(deptSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg performance</span>
                    <span className={`font-mono ${getPerformanceColor(deptPerf)}`}>{deptPerf}%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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
      </SimpleCard>

      {/* Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <SimpleCard className="w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Hire new staff member</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Full name *</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Role/title *</label>
                <input
                  type="text"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Senior Driver"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Department</label>
                <select
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <label className="block text-xs text-muted-foreground mb-1">Monthly salary ($)</label>
                <input
                  type="number"
                  value={newStaff.salary || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, salary: Number(e.target.value) })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleHire}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-md font-medium hover:bg-emerald-600 transition-colors"
                >
                  Hire employee
                </button>
                <button
                  onClick={() => setShowHireModal(false)}
                  className="px-4 py-2 border rounded-md text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </SimpleCard>
        </div>
      )}
    </div>
  )
}
