import React, { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SimpleCard } from './ui/GlassComponents'
import { useSimulationStore } from '../store/useSimulationStore'

interface ChartDataPoint {
  name: string;
  value: number;
}

export const PerformanceChart: React.FC = () => {
  const { transactions, totalBalance } = useSimulationStore()

  // Generate chart data from transaction history — memoized to prevent recalculation on unrelated re-renders
  const data = useMemo<ChartDataPoint[]>(() => {
    if (transactions.length === 0) {
      return [{ name: 'Start', value: Math.round(totalBalance / 1000) }]
    }

    const sortedTransactions = [...transactions].reverse()
    let runningBalance = totalBalance

    const chartPoints: ChartDataPoint[] = sortedTransactions.map((t) => {
      const date = new Date(t.date)
      const timeLabel = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })

      const adjustment = t.type === 'income' ? -t.amount : t.amount
      runningBalance += adjustment

      return {
        name: timeLabel,
        value: Math.round(runningBalance / 1000)
      }
    })

    chartPoints.push({
      name: 'Now',
      value: Math.round(totalBalance / 1000)
    })

    return chartPoints.slice(-24)
  }, [transactions, totalBalance])

  return (
    <SimpleCard className="h-[300px] p-0 overflow-hidden">
      <div className="p-6 pb-0">
        <h4 className="text-xs font-semibold mb-1">Yield velocity</h4>
        <p className="text-[10px] text-muted-foreground">24-hour performance cycle</p>
      </div>
      
      <div className="h-[220px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#10b981' }}
              formatter={(value) => [`$${value}k`, 'Balance']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SimpleCard>
  )
}
