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

  // Close mobile menu on Escape key
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
    { path: '/dashboard', label: 'DASHBOARD' },
    { path: '/fleet', label: 'FLEET' },
    { path: '/ledger', label: 'LEDGER' },
    { path: '/analytics', label: 'ANALYTICS' },
    { path: '/customers', label: 'CUSTOMERS' },
    { path: '/budget', label: 'BUDGET' },
    { path: '/staff', label: 'STAFF' },
    { path: '/coo', label: 'VIRTUAL COO' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-onyx-950 focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Background Ambient Glows */}
      {darkMode && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </>
      )}

      <nav className="fixed top-0 w-full z-50 px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center border-b" style={{ borderColor: 'var(--app-card-border)' }} role="navigation" aria-label="Main navigation">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <span className="font-bold text-onyx-950">A</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tighter uppercase gold-text-glow">Aura-Sim</h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 text-sm font-medium" style={{ color: 'var(--app-nav-text)' }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "hover:text-emerald-400 transition-colors duration-150",
                location.pathname === link.path && "text-emerald-400 font-bold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 border rounded-lg text-xs transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)' }}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4" style={{ color: 'var(--app-moon-icon-light)' }} />}
          </button>
          <div className="hidden sm:block">
            <AlertPanel />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border rounded-lg text-xs transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            style={{ backgroundColor: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)' }}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[60px] left-0 w-full backdrop-blur-lg border-b z-40 md:hidden"
            style={{ backgroundColor: 'var(--app-overlay-bg)', borderColor: 'var(--app-card-border)' }}
          >
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "px-4 py-3 text-sm font-medium hover:text-emerald-400 rounded-lg transition-colors duration-150",
                    location.pathname === link.path && "text-emerald-400 font-bold bg-white/5"
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

      <main id="main-content" className="pt-20 sm:pt-24 px-4 sm:px-8 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
