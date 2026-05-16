import React, { useState, useEffect } from 'react'
import { useSimulationStore } from '../../store/useSimulationStore'
import { generateCOOReport } from './cooService'

export const VirtualCOO: React.FC = () => {
  const { totalBalance, fleetHealth, operationalEfficiency, transactions } = useSimulationStore()
  const [report, setReport] = useState<string>("System ready. Awaiting neural link...")
  const [displayedText, setDisplayedText] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)

  const fetchReport = async () => {
    setIsTyping(true)
    setDisplayedText("")
    const data = {
      totalBalance,
      fleetHealth,
      operationalEfficiency,
      recentTransactions: transactions.slice(0, 3)
    }
    const result = await generateCOOReport(data)
    setReport(result)
  }

  useEffect(() => {
    if (isTyping && displayedText.length < report.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(report.slice(0, displayedText.length + 1))
      }, 30)
      return () => clearTimeout(timeout)
    } else if (displayedText.length === report.length) {
      setIsTyping(false)
    }
  }, [displayedText, report, isTyping])

  useEffect(() => {
    fetchReport()
  }, [])

  return (
    <div className="font-mono text-sm leading-relaxed min-h-[220px] flex flex-col justify-between" style={{ color: 'var(--app-text-muted)' }}>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-emerald-500' : 'bg-emerald-500/50'}`} />
          <span className="text-xs text-emerald-500 font-medium">Neural Core Active</span>
        </div>

        <p className="relative">
          <span className="text-emerald-500 font-bold mr-2">{'>'}</span>
          {displayedText}
          {isTyping && <span className="inline-block w-2 h-4 bg-emerald-500 ml-1" />}
        </p>
      </div>

      {!isTyping && (
        <button
          onClick={fetchReport}
          className="mt-6 text-xs text-emerald-500/50 hover:text-emerald-500 transition-colors self-start"
        >
          Refresh Strategic Analysis
        </button>
      )}
    </div>
  )
}
