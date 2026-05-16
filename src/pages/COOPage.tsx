import { VirtualCOO } from '../features/ai/VirtualCOO'
import { PerformanceChart } from '../components/PerformanceChart'

export function COOPage() {
  return (
    <div className="space-y-6">
      <VirtualCOO />
      <PerformanceChart />
    </div>
  )
}
