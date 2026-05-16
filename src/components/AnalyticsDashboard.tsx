import React from 'react'
import { useSimulationStore } from '../store/useSimulationStore'
import { SectionHeader, SimpleCard, StatCard } from './ui/GlassComponents'
import { formatCurrency } from '../lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Wrench, Car } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export const AnalyticsDashboard: React.FC = () => {
  const { fleet, transactions, totalBalance, fleetHealth, operationalEfficiency } = useSimulationStore()

  const revenueByVehicle = fleet.map(vehicle => ({
    name: vehicle.model.split(' ').slice(0, 2).join(' '),
    revenue: vehicle.revenueGenerated,
    health: vehicle.health,
    maintenanceCosts: vehicle.maintenanceCosts || 0,
  }))

  const recentTransactions = transactions.slice(0, 10).reverse()
  const transactionTrend = recentTransactions.map((tx, index) => ({
    name: `Tx ${index + 1}`,
    amount: tx.type === 'income' ? tx.amount : -tx.amount,
    type: tx.type,
  }))

  const fleetStatus = [
    { name: 'Available', value: fleet.filter(v => v.status === 'available').length, color: '#10b981' },
    { name: 'In Service', value: fleet.filter(v => v.status === 'in-service').length, color: '#d4af37' },
    { name: 'Maintenance', value: fleet.filter(v => v.status === 'maintenance').length, color: '#ef4444' },
  ].filter(item => item.value > 0)

  const totalRevenue = fleet.reduce((sum, v) => sum + v.revenueGenerated, 0)
  const totalMaintenanceCosts = fleet.reduce((sum, v) => sum + (v.maintenanceCosts || 0), 0)
  const netProfit = totalRevenue - totalMaintenanceCosts
  const avgHealth = fleet.length > 0 ? Math.round(fleet.reduce((sum, v) => sum + v.health, 0) / fleet.length) : 0

  const tooltipStyle = { backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '6px' }
  const gridStroke = 'rgba(255,255,255,0.1)'
  const axisStroke = 'rgba(255,255,255,0.5)'

  return (
    <div className="space-y-6" id="analytics">
      <SectionHeader
        title="Analytics Dashboard"
        description="Fleet performance insights"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtext="All time"
        />

        <StatCard
          icon={<Wrench className="w-5 h-5 text-gold-400" />}
          label="Maintenance Costs"
          value={formatCurrency(totalMaintenanceCosts)}
          subtext={`${fleet.length} vehicles`}
        />

        <StatCard
          icon={netProfit >= 0
            ? <TrendingUp className="w-5 h-5 text-emerald-400" />
            : <TrendingDown className="w-5 h-5 text-red-400" />
          }
          label="Net Profit"
          value={formatCurrency(netProfit)}
          subtext="Revenue - Costs"
        />

        <StatCard
          icon={<Car className="w-5 h-5 text-emerald-400" />}
          label="Avg Health"
          value={`${avgHealth}%`}
          subtext="Fleet viability"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleCard>
          <h4 className="text-sm font-medium mb-4">Revenue by Vehicle</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByVehicle}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" stroke={axisStroke} fontSize={10} />
              <YAxis stroke={axisStroke} fontSize={10} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SimpleCard>

        <SimpleCard>
          <h4 className="text-sm font-medium mb-4">Fleet Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={fleetStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {fleetStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SimpleCard>

        <SimpleCard>
          <h4 className="text-sm font-medium mb-4">Recent Transaction Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={transactionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" stroke={axisStroke} fontSize={10} />
              <YAxis stroke={axisStroke} fontSize={10} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
              <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </SimpleCard>

        <SimpleCard>
          <h4 className="text-sm font-medium mb-4">Maintenance Costs by Vehicle</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByVehicle}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" stroke={axisStroke} fontSize={10} />
              <YAxis stroke={axisStroke} fontSize={10} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
              <Bar dataKey="maintenanceCosts" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SimpleCard>
      </div>

      <SimpleCard>
        <h4 className="text-sm font-medium mb-4">Performance Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--app-text-muted)' }}>Fleet Health</p>
            <p className="text-lg font-semibold font-mono">{fleetHealth}%</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--app-text-muted)' }}>Operational Efficiency</p>
            <p className="text-lg font-semibold font-mono">{operationalEfficiency}%</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--app-text-muted)' }}>Total Vehicles</p>
            <p className="text-lg font-semibold font-mono">{fleet.length}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--app-text-muted)' }}>Current Balance</p>
            <p className="text-lg font-semibold font-mono">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </SimpleCard>
    </div>
  )
}
