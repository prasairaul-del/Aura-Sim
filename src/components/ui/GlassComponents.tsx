import React from 'react'
import { cn } from '../../lib/utils'

interface SimpleCardProps {
  children: React.ReactNode
  className?: string
}

export const SimpleCard: React.FC<SimpleCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn("p-5 border", className)}
      style={{ backgroundColor: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)' }}
    >
      {children}
    </div>
  )
}

export const StatusBadge: React.FC<{ status: string; health?: number }> = ({ status, health }) => {
  const styles: Record<string, string> = {
    'available': 'text-emerald-500',
    'in-service': 'text-gold-500',
    'maintenance': 'text-red-500',
  }

  return (
    <span className={cn("text-xs", styles[status] || styles['available'])}>
      {status} {health !== undefined && `• ${health}%`}
    </span>
  )
}

// Legacy alias for backward compatibility
export const GlassCard = SimpleCard
