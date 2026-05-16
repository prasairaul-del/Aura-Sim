import React from 'react'
import { cn } from '../../lib/utils'

interface SimpleCardProps {
  children: React.ReactNode
  className?: string
}

export const SimpleCard: React.FC<SimpleCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn("p-5 border shadow-sm", className)}
      style={{ backgroundColor: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)' }}
    >
      {children}
    </div>
  )
}

export const StatusBadge: React.FC<{ status: string; health?: number }> = ({ status, health }) => {
  const styles: Record<string, string> = {
    'available': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'in-service': 'bg-amber-100 text-amber-700 border-amber-300',
    'maintenance': 'bg-red-100 text-red-700 border-red-300',
  }

  return (
    <span className={cn("text-xs px-2 py-0.5 rounded border font-medium", styles[status] || styles['available'])}>
      {status} {health !== undefined && `• ${health}%`}
    </span>
  )
}

// Legacy alias for backward compatibility
export const GlassCard = SimpleCard
