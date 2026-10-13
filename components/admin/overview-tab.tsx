"use client"

import { KpiGrid } from "./kpi-grid"
import { RevenueChart, StatusDonut } from "./analytics-charts"
import type { DashboardData } from "@/lib/actions/admin/get-dashboard-data"

type Props = {
  data: DashboardData | null
}

export function OverviewTab({ data }: Props) {
  return (
    <div className="flex animate-archai-fade-in flex-col gap-6 p-6">
      {/* KPI metric cards */}
      <KpiGrid data={data} />

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="aspect-[16/9] min-h-[360px]">
          <RevenueChart data={data} />
        </div>
        <div className="min-h-[360px]">
          <StatusDonut data={data} />
        </div>
      </div>
    </div>
  )
}