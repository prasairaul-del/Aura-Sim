import React, { useState } from 'react'
import { Button, FormInput, FormSelect, Modal, SectionHeader, SimpleCard, StatCard } from './ui/GlassComponents'
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
      <SectionHeader
        title="Staff management"
        description="Manage team members, salaries, and performance"
        action={
          <Button onClick={() => setShowHireModal(true)}>
            <UserPlus className="w-4 h-4" />
            Hire staff
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-emerald-500" />}
          label="Active staff"
          value={activeStaff.length.toString()}
          subtext="Total team members"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-amber-500" />}
          label="Monthly payroll"
          value={formatCurrency(totalMonthlySalary)}
          subtext="Total salaries"
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-emerald-500" />}
          label="Avg performance"
          value={`${avgPerformance}%`}
          subtext="Team average"
        />
        <StatCard
          icon={<Briefcase className="w-5 h-5 text-amber-500" />}
          label="Departments"
          value={new Set(activeStaff.map(s => s.department)).size.toString()}
          subtext="Active departments"
        />
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
      <Modal isOpen={showHireModal} onClose={() => setShowHireModal(false)} title="Hire new staff member" size="sm">
        <div className="space-y-4">
          <FormInput
            label="Full name *"
            value={newStaff.name}
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            placeholder="Enter full name"
          />
          <FormInput
            label="Role/title *"
            value={newStaff.role}
            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
            placeholder="e.g., Senior Driver"
          />
          <FormSelect
            label="Department"
            value={newStaff.department}
            onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
          >
            <option value="Operations" style={{ backgroundColor: 'var(--app-option-bg)' }}>Operations</option>
            <option value="Fleet" style={{ backgroundColor: 'var(--app-option-bg)' }}>Fleet</option>
            <option value="Maintenance" style={{ backgroundColor: 'var(--app-option-bg)' }}>Maintenance</option>
            <option value="Marketing" style={{ backgroundColor: 'var(--app-option-bg)' }}>Marketing</option>
            <option value="Finance" style={{ backgroundColor: 'var(--app-option-bg)' }}>Finance</option>
            <option value="HR" style={{ backgroundColor: 'var(--app-option-bg)' }}>HR</option>
          </FormSelect>
          <FormInput
            label="Monthly salary ($)"
            type="number"
            value={newStaff.salary || ''}
            onChange={(e) => setNewStaff({ ...newStaff, salary: Number(e.target.value) })}
            placeholder="0.00"
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleHire} className="flex-1">Hire employee</Button>
            <Button variant="secondary" onClick={() => setShowHireModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
