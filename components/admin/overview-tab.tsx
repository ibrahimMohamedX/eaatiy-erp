import { KpiGrid } from "./kpi-grid"
import { RevenueChart, StatusDonut } from "./analytics-charts"

export function OverviewTab() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* KPI metric cards */}
      <KpiGrid />

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="aspect-[16/9] min-h-[360px]">
          <RevenueChart />
        </div>
        <div className="min-h-[360px]">
          <StatusDonut />
        </div>
      </div>
    </div>
  )
}