import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
  glowColor?: 'emerald' | 'gold' | 'white'
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hoverEffect = true,
  glowColor = 'white'
}) => {
  const glowStyles = {
    emerald: 'hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]',
    gold: 'hover:border-gold-500/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]',
    white: 'hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]',
  }

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4 } : {}}
      className={cn(
        "glass-card p-6 transition-all duration-500",
        hoverEffect && glowStyles[glowColor],
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export const StatusBadge: React.FC<{ status: string; health?: number }> = ({ status, health }) => {
  const styles: Record<string, string> = {
    'available': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'in-service': 'bg-gold-500/10 text-gold-500 border-gold-500/20',
    'maintenance': 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  return (
    <div className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
      styles[status] || styles['available']
    )}>
      {status} {health !== undefined && `• ${health}%`}
    </div>
  )
}
