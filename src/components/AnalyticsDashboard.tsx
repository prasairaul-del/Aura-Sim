import React from 'react'
import { useSimulationStore } from '../store/useSimulationStore'
import { GlassCard } from './ui/GlassComponents'
import { formatCurrency } from '../lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Activity, Wrench, Car } from 'lucide-react'
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

  // Calculate revenue by vehicle
  const revenueByVehicle = fleet.map(vehicle => ({
    name: vehicle.model.split(' ').slice(0, 2).join(' '),
    revenue: vehicle.revenueGenerated,
    health: vehicle.health,
    maintenanceCosts: vehicle.maintenanceCosts || 0,
  }))

  // Calculate transaction trends (last 10 transactions)
  const recentTransactions = transactions.slice(0, 10).reverse()
  const transactionTrend = recentTransactions.map((tx, index) => ({
    name: `Tx ${index + 1}`,
    amount: tx.type === 'income' ? tx.amount : -tx.amount,
    type: tx.type,
  }))

  // Calculate fleet status distribution
  const fleetStatus = [
    { name: 'Available', value: fleet.filter(v => v.status === 'available').length, color: '#10b981' },
    { name: 'In Service', value: fleet.filter(v => v.status === 'in-service').length, color: '#d4af37' },
    { name: 'Maintenance', value: fleet.filter(v => v.status === 'maintenance').length, color: '#ef4444' },
  ].filter(item => item.value > 0)

  // Calculate key metrics
  const totalRevenue = fleet.reduce((sum, v) => sum + v.revenueGenerated, 0)
  const totalMaintenanceCosts = fleet.reduce((sum, v) => sum + (v.maintenanceCosts || 0), 0)
  const netProfit = totalRevenue - totalMaintenanceCosts
  const avgHealth = fleet.length > 0 ? Math.round(fleet.reduce((sum, v) => sum + v.health, 0) / fleet.length) : 0

  return (
    <div className="space-y-6" id="analytics">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h3>
          <p className="text-white/60 text-sm">Comprehensive fleet performance insights</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glowColor="emerald">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>All time</span>
          </div>
        </GlassCard>

        <GlassCard glowColor="gold">
          <div className="flex items-center justify-between mb-2">
            <Wrench className="w-5 h-5 text-gold-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Maintenance Costs</span>
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(totalMaintenanceCosts)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-gold-400">
            <Activity className="w-3 h-3" />
            <span>{fleet.length} vehicles</span>
          </div>
        </GlassCard>

        <GlassCard glowColor={netProfit >= 0 ? 'emerald' : 'gold'}>
          <div className="flex items-center justify-between mb-2">
            {netProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-[10px] uppercase tracking-widest text-white/50">Net Profit</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(netProfit)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-white/50">
            <span>Revenue - Costs</span>
          </div>
        </GlassCard>

        <GlassCard glowColor="emerald">
          <div className="flex items-center justify-between mb-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Avg Health</span>
          </div>
          <p className="text-2xl font-bold font-mono">{avgHealth}%</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-white/50">
            <span>Fleet viability</span>
          </div>
        </GlassCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Vehicle */}
        <GlassCard glowColor="emerald">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Revenue by Vehicle</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByVehicle}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Fleet Status Distribution */}
        <GlassCard glowColor="gold">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Fleet Status</h4>
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
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Transaction Trend */}
        <GlassCard glowColor="emerald">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Recent Transaction Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={transactionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
              />
              <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Maintenance Costs by Vehicle */}
        <GlassCard glowColor="gold">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Maintenance Costs by Vehicle</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByVehicle}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
              />
              <Bar dataKey="maintenanceCosts" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Summary Stats */}
      <GlassCard glowColor="emerald">
        <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Performance Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Fleet Health</p>
            <p className="text-xl font-bold font-mono">{fleetHealth}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Operational Efficiency</p>
            <p className="text-xl font-bold font-mono">{operationalEfficiency}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Total Vehicles</p>
            <p className="text-xl font-bold font-mono">{fleet.length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Current Balance</p>
            <p className="text-xl font-bold font-mono">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
