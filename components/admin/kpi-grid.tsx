"use client"

import { DollarSign, Wallet, CalendarDays, UserPlus, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import type { DashboardData } from "@/lib/actions/admin/get-dashboard-data"

type KpiDef = {
  label: string
  icon: LucideIcon
  /** Archai semantic tone class (text-arc / text-warn / text-ok / text-err / text-copper) */
  tone: string
  /** 10% tinted tile for the tone */
  tile: string
  getValue: (data: DashboardData) => string
  trend?: { pct: string; direction: "up" | "down"; tone: string }
}

function buildKpiDefs(t: Record<string, any>): KpiDef[] {
  return [
    {
      label: t.admin.totalRevenue,
      icon: DollarSign,
      tone: "text-arc",
      tile: "bg-arc/10",
      getValue: (d) => `$${d.revenueSummary.totalPaid.toLocaleString()}`,
      trend: { pct: "+12%", direction: "up", tone: "text-ok" },
    },
    {
      label: t.admin.outstandingBalance,
      icon: Wallet,
      tone: "text-warn",
      tile: "bg-warn/10",
      getValue: (d) => `$${d.revenueSummary.outstandingBalance.toLocaleString()}`,
      trend: { pct: "+4%", direction: "up", tone: "text-err" },
    },
    {
      label: t.admin.totalAppointments,
      icon: CalendarDays,
      tone: "text-warn",
      tile: "bg-warn/10",
      getValue: (d) => String(d.appointmentStats.total),
    },
    {
      label: t.admin.newPatients,
      icon: UserPlus,
      tone: "text-copper",
      tile: "bg-copper/10",
      getValue: (d) => String(d.newPatients),
    },
    {
      label: t.admin.completionRate,
      icon: CheckCircle2,
      tone: "text-ok",
      tile: "bg-ok/10",
      getValue: (d) => `${d.appointmentStats.completionRate}%`,
    },
    {
      label: t.admin.cancellationRate,
      icon: XCircle,
      tone: "text-err",
      tile: "bg-err/10",
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
            className="group flex flex-col justify-between rounded-2xl border border-line bg-card p-4 transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-mist"
          >
            <div className="flex items-start justify-between">
              <span className={`flex size-9 items-center justify-center rounded-xl ${kpi.tile}`}>
                <Icon className={`size-[18px] ${kpi.tone}`} strokeWidth={1.75} />
              </span>
              {kpi.trend && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${kpi.trend.tone}`}
                >
                  <ArrowUpRight
                    className={`size-3.5 ${kpi.trend.direction === "down" ? "rotate-90" : ""}`}
                    strokeWidth={1.75}
                  />
                  {kpi.trend.pct}
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="font-latin text-2xl font-semibold leading-none text-foreground ltr-in-rtl">
                {value}
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">{kpi.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
