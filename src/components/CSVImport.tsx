import React, { useState, useRef } from 'react'
import { useSimulationStore } from '../store/useSimulationStore'
import { GlassCard } from './ui/GlassComponents'
import { Upload, CheckCircle, AlertCircle, X, Download } from 'lucide-react'
import type { Vehicle, Transaction } from '../types'

interface ImportResult {
  vehicles: number
  transactions: number
  errors: string[]
}

export const CSVImport: React.FC = () => {
  const { addVehicle, addTransaction } = useSimulationStore()
  const [showModal, setShowModal] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseVehiclesCSV = (text: string): { vehicles: Omit<Vehicle, 'id'>[]; errors: string[] } => {
    const lines = text.trim().split('\n')
    const vehicles: Omit<Vehicle, 'id'>[] = []
    const errors: string[] = []

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const cols = line.split(',').map(c => c.trim())
      if (cols.length < 2) {
        errors.push(`Line ${i + 1}: Insufficient columns`)
        continue
      }

      const model = cols[0]
      const status = cols[1]?.toLowerCase() as Vehicle['status']
      const health = parseFloat(cols[2]) || 100
      const revenue = parseFloat(cols[3]) || 0

      if (!['available', 'in-service', 'maintenance'].includes(status)) {
        errors.push(`Line ${i + 1}: Invalid status '${cols[1]}'. Use: available, in-service, maintenance`)
        continue
      }

      vehicles.push({
        model,
        status,
        health: Math.max(0, Math.min(100, health)),
        lastService: new Date().toISOString().split('T')[0],
        revenueGenerated: revenue,
        totalServiceHours: 0,
        maintenanceCosts: 0,
      })
    }

    return { vehicles, errors }
  }

  const parseTransactionsCSV = (text: string): { transactions: Omit<Transaction, 'id' | 'date'>[]; errors: string[] } => {
    const lines = text.trim().split('\n')
    const transactions: Omit<Transaction, 'id' | 'date'>[] = []
    const errors: string[] = []

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const cols = line.split(',').map(c => c.trim())
      if (cols.length < 4) {
        errors.push(`Line ${i + 1}: Insufficient columns (need merchant, category, amount, type)`)
        continue
      }

      const merchant = cols[0]
      const category = cols[1] as Transaction['category']
      const amount = parseFloat(cols[2])
      const type = cols[3]?.toLowerCase() as Transaction['type']

      if (!['Fleet', 'Operations', 'Marketing', 'Staff', 'VIP Services'].includes(category)) {
        errors.push(`Line ${i + 1}: Invalid category '${category}'`)
        continue
      }

      if (!['income', 'expense'].includes(type)) {
        errors.push(`Line ${i + 1}: Invalid type '${cols[3]}'. Use: income, expense`)
        continue
      }

      if (isNaN(amount) || amount <= 0) {
        errors.push(`Line ${i + 1}: Invalid amount '${cols[2]}'`)
        continue
      }

      transactions.push({ merchant, category, amount, type })
    }

    return { transactions, errors }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setImportResult({ vehicles: 0, transactions: 0, errors: ['Please upload a CSV file'] })
      return
    }

    const text = await file.text()
    const errors: string[] = []
    let vehiclesImported = 0
    let transactionsImported = 0

    // Detect file type based on first column header
    const firstLine = text.split('\n')[0].toLowerCase()

    if (firstLine.includes('model') || firstLine.includes('vehicle')) {
      // Vehicle import
      const { vehicles, errors: vehicleErrors } = parseVehiclesCSV(text)
      errors.push(...vehicleErrors)

      vehicles.forEach(v => {
        addVehicle(v)
        vehiclesImported++
      })
    } else if (firstLine.includes('merchant') || firstLine.includes('transaction')) {
      // Transaction import
      const { transactions, errors: txErrors } = parseTransactionsCSV(text)
      errors.push(...txErrors)

      transactions.forEach(t => {
        addTransaction(t)
        transactionsImported++
      })
    } else {
      errors.push('Could not detect CSV format. First row should contain headers like "model,status,health,revenue" or "merchant,category,amount,type"')
    }

    setImportResult({ vehicles: vehiclesImported, transactions: transactionsImported, errors })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const downloadSampleVehicles = () => {
    const csv = 'model,status,health,revenue\nRolls-Royce Phantom,available,100,0\nBentley Continental,in-service,85,25000\nMercedes S-Class,maintenance,45,12000'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-vehicles.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadSampleTransactions = () => {
    const csv = 'merchant,category,amount,type\nVIP Client Transfer,VIP Services,2500,income\nFuel & Logistics,Operations,350,expense\nAirport Service,Fleet,1800,income\nOffice Supplies,Staff,120,expense'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <button
        onClick={() => { setShowModal(true); setImportResult(null) }}
        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Import CSV
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <GlassCard glowColor="emerald" className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Import Data</h3>
                <p className="text-white/60 text-sm">Upload vehicles or transactions from CSV</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close import dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!importResult ? (
              <>
                {/* Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-emerald-400' : 'text-white/30'}`} />
                  <p className="text-white/70 mb-2">Drag and drop your CSV file here</p>
                  <p className="text-white/40 text-sm mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-500 text-onyx-950 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]) }}
                    className="hidden"
                  />
                </div>

                {/* Sample Downloads */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-white/50 mb-3">Download sample CSV files:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadSampleVehicles}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Vehicles Template
                    </button>
                    <button
                      onClick={downloadSampleTransactions}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Transactions Template
                    </button>
                  </div>
                </div>

                {/* Format Info */}
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2">Expected Formats</h4>
                  <div className="space-y-2 text-[10px] text-white/40 font-mono">
                    <p>Vehicles: model, status, health, revenue</p>
                    <p>Transactions: merchant, category, amount, type</p>
                  </div>
                </div>
              </>
            ) : (
              /* Results */
              <div className="space-y-4">
                {importResult.errors.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-emerald-400 font-medium">Import Successful</p>
                      <p className="text-xs text-white/50">
                        {importResult.vehicles > 0 && `${importResult.vehicles} vehicles imported. `}
                        {importResult.transactions > 0 && `${importResult.transactions} transactions imported.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gold-400 font-medium">Import Completed with Errors</p>
                        <p className="text-xs text-white/50">
                          {importResult.vehicles > 0 && `${importResult.vehicles} vehicles imported. `}
                          {importResult.transactions > 0 && `${importResult.transactions} transactions imported.`}
                        </p>
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {importResult.errors.map((error, i) => (
                        <div key={i} className="text-xs text-red-400 p-2 bg-red-500/5 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setShowModal(false); setImportResult(null) }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </>
  )
}
