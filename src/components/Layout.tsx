import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation, Outlet } from "react-router-dom"
import { AlertPanel } from "./AlertPanel"
import { Sun, Moon, Menu, X } from "lucide-react"
import { cn } from "../lib/utils"

export const Layout: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen])

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/fleet', label: 'Fleet' },
    { path: '/ledger', label: 'Ledger' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/customers', label: 'Customers' },
    { path: '/budget', label: 'Budget' },
    { path: '/staff', label: 'Staff' },
    { path: '/coo', label: 'COO' },
  ]

  return (
    <div className="min-h-screen relative transition-colors duration-200" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-onyx-950 focus:rounded focus:font-bold"
      >
        Skip to main content
      </a>

      <nav className="fixed top-0 w-full z-50 px-6 py-3 flex justify-between items-center border-b" style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--app-card-border)' }} role="navigation" aria-label="Main navigation">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center">
            <span className="font-bold text-onyx-950 text-sm">A</span>
          </div>
          <h1 className="text-sm font-semibold tracking-tight">Aura-Sim</h1>
        </div>

        <div className="hidden md:flex gap-6 text-sm" style={{ color: 'var(--app-nav-text)' }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "transition-colors duration-150 hover:text-emerald-400",
                location.pathname === link.path && "text-emerald-400 font-medium"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 border transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', borderRadius: '6px' }}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-gold-400" /> : <Moon className="w-3.5 h-3.5" style={{ color: 'var(--app-moon-icon-light)' }} />}
          </button>
          <div className="hidden sm:block">
            <AlertPanel />
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 border transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', borderRadius: '6px' }}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[48px] left-0 w-full border-b z-40 md:hidden"
            style={{ backgroundColor: 'var(--app-overlay-bg)', borderColor: 'var(--app-card-border)' }}
          >
            <div className="flex flex-col p-2 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "px-3 py-2 text-sm hover:text-emerald-400 transition-colors duration-150",
                    location.pathname === link.path && "text-emerald-400 font-medium"
                  )}
                  style={{ color: 'var(--app-nav-text)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--app-card-border)' }}>
                <AlertPanel />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main-content" className="pt-16 px-6 pb-12 relative z-10 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
