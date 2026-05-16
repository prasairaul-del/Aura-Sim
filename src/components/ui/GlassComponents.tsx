import React from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- SimpleCard ---
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

// --- StatusBadge ---
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

// --- Button ---
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-500 text-onyx-950 font-medium hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500/50',
  secondary: 'border text-muted-foreground hover:bg-muted',
  danger: 'text-red-500 hover:bg-red-500/10',
  ghost: 'text-muted-foreground hover:bg-muted',
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  return (
    <button
      className={cn("px-4 py-2 text-xs font-medium focus:outline-none transition-colors", variantStyles[variant], className)}
      style={{ borderRadius: '6px' }}
      {...props}
    >
      {children}
    </button>
  )
}

// --- FormInput ---
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const FormInput: React.FC<FormInputProps> = ({ label, className, id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-xs text-muted-foreground">{label}</label>}
      <input
        id={inputId}
        className={cn("w-full px-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500/50", className)}
        style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)', borderRadius: '6px' }}
        {...props}
      />
    </div>
  )
}

// --- FormSelect ---
export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: React.ReactNode
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, children, id, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={selectId} className="text-xs text-muted-foreground">{label}</label>}
      <select
        id={selectId}
        className={cn("w-full px-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500/50", props.className)}
        style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-input-text)', borderRadius: '6px' }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

// --- StatCard ---
export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subtext?: string
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, className }) => {
  return (
    <SimpleCard className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-mono font-bold">{value}</div>
      {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
    </SimpleCard>
  )
}

// --- SectionHeader ---
export interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, action, className }) => {
  return (
    <div className={cn("flex justify-between items-end", className)}>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p style={{ color: 'var(--app-text-muted)' }} className="text-sm mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// --- Modal ---
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn("w-full max-h-[85vh] overflow-y-auto border shadow-lg", sizeClasses[size])}
            style={{ backgroundColor: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', borderRadius: '8px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="text-base font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Legacy alias for backward compatibility
export const GlassCard = SimpleCard
