import React, { useState } from "react"
import { motion } from "framer-motion"
import { AlertPanel } from "./AlertPanel"
import { Sun, Moon } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className={`min-h-screen text-foreground relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#050505]' : 'bg-gray-100'}`}>
      {/* Background Ambient Glows */}
      {darkMode && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </>
      )}

      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <span className="font-bold text-onyx-950">A</span>
          </div>
          <h1 className="text-xl font-bold tracking-tighter uppercase gold-text-glow">Aura-Sim</h1>
        </div>
        <div className="flex gap-8 text-sm font-medium text-white/60">
          <a href="#dashboard" className="hover:text-emerald-400 transition-colors" aria-current="page">DASHBOARD</a>
          <a href="#fleet" className="hover:text-emerald-400 transition-colors">FLEET</a>
          <a href="#ledger" className="hover:text-emerald-400 transition-colors">LEDGER</a>
          <a href="#coo" className="hover:text-emerald-400 transition-colors">VIRTUAL COO</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-white/5 border border-white/10 rounded-full text-xs hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <AlertPanel />
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold hover:bg-white/10 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            LIVE FEED: ACTIVE
          </button>
        </div>
      </nav>

      <main className="pt-24 px-8 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
