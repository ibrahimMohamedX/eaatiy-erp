"use client"

import { DollarSign, Wallet, CalendarDays, UserPlus, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import type { DashboardData } from "@/lib/actions/admin/get-dashboard-data"

type KpiDef = {
  label: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  getValue: (data: DashboardData) => string
  trend?: { pct: string; direction: "up" | "down"; color: string }
}

function buildKpiDefs(t: Record<string, any>): KpiDef[] {
  return [
    {
      label: t.admin.totalRevenue,
      icon: DollarSign,
      iconColor: "#0F766E",
      iconBg: "rgba(15,118,110,0.12)",
      getValue: (d) => `$${d.revenueSummary.totalPaid.toLocaleString()}`,
      trend: { pct: "+12%", direction: "up", color: "#059669" },
    },
    {
      label: t.admin.outstandingBalance,
      icon: Wallet,
      iconColor: "#D97706",
      iconBg: "rgba(217,119,6,0.12)",
      getValue: (d) => `$${d.revenueSummary.outstandingBalance.toLocaleString()}`,
      trend: { pct: "+4%", direction: "up", color: "#DC2626" },
    },
    {
      label: t.admin.totalAppointments,
      icon: CalendarDays,
      iconColor: "#2563EB",
      iconBg: "rgba(37,99,235,0.12)",
      getValue: (d) => String(d.appointmentStats.total),
    },
    {
      label: t.admin.newPatients,
      icon: UserPlus,
      iconColor: "#059669",
      iconBg: "rgba(5,150,105,0.12)",
      getValue: (d) => String(d.newPatients),
    },
    {
      label: t.admin.completionRate,
      icon: CheckCircle2,
      iconColor: "#0F766E",
      iconBg: "rgba(15,118,110,0.12)",
      getValue: (d) => `${d.appointmentStats.completionRate}%`,
    },
    {
      label: t.admin.cancellationRate,
      icon: XCircle,
      iconColor: "#DC2626",
      iconBg: "rgba(220,38,38,0.12)",
      getValue: (d) => `${d.appointmentStats.cancellationRate}%`,
    },
  ]
}

type Props = {
  data: DashboardData | null
}

export function KpiGrid({ data }: Props) {
  const { t } = useT()
  const KPI_DEFS = buildKpiDefs(t)

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {KPI_DEFS.map((kpi) => {
        const Icon = kpi.icon
        const value = data ? kpi.getValue(data) : "—"
        return (
          <div
            key={kpi.label}
            className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-[#374151] dark:bg-[#1F2937]"
          >
            <div className="flex items-start justify-between">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: kpi.iconBg }}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.5}
                  style={{ color: kpi.iconColor }}
                />
              </span>
              {kpi.trend && (
                <span
                  className="flex items-center gap-0.5 text-xs font-medium"
                  style={{ color: kpi.trend.color }}
                >
                  <ArrowUpRight
                    className={`h-3.5 w-3.5 ${kpi.trend.direction === "down" ? "rotate-90" : ""}`}
                    strokeWidth={1.5}
                  />
                  {kpi.trend.pct}
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-2xl font-semibold tracking-tight text-[#111827] dark:text-[#F9FAFB]">{value}</div>
              <div className="mt-0.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{kpi.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}