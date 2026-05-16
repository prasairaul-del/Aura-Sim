import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { FleetPage } from './pages/FleetPage'
import { LedgerPage } from './pages/LedgerPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CustomersPage } from './pages/CustomersPage'
import { BudgetPage } from './pages/BudgetPage'
import { StaffPage } from './pages/StaffPage'
import { COOPage } from './pages/COOPage'
import { useSimulationStore } from './store/useSimulationStore'
import { useEffect } from 'react'
import { AlertSettings } from './components/AlertSettings'
import { ScenarioManager } from './components/ScenarioManager'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { OnboardingTutorial } from './components/OnboardingTutorial'

function App() {
  const { tick } = useSimulationStore()

  // Keep simulation ticking globally regardless of current route
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        tick()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [tick])

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="fleet" element={<FleetPage />} />
          <Route path="ledger" element={<LedgerPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="coo" element={<COOPage />} />
        </Route>
      </Routes>
      <OnboardingTutorial onComplete={() => {}} />
      <KeyboardShortcuts />
      <AlertSettings />
      <ScenarioManager />
    </>
  )
}

export default App
