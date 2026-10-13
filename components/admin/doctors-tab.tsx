"use client"

import { Stethoscope, CalendarDays, Users } from "lucide-react"
import { AppointmentsPerDoctor } from "./analytics-charts"
import { useT } from "@/lib/i18n/use-t"
import { getDoctorInitials } from "@/lib/db/repositories/users"
import type { DashboardData } from "@/lib/actions/admin/get-dashboard-data"

type Props = {
  data: DashboardData | null
}

export function DoctorsTab({ data }: Props) {
  const { t } = useT()

  const doctorStats = data?.doctorPerformance ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Bar chart */}
      <AppointmentsPerDoctor data={data} />

      {/* Doctor performance cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {doctorStats.map((stat) => {
          const initials = getDoctorInitials({
            id: stat.doctorId,
            full_name: stat.doctorName,
          } as any)

          return (
            <div
              key={stat.doctorId}
              className="rounded-2xl border border-line bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-steel text-sm font-semibold text-silver">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{stat.doctorName}</p>
                  <p className="truncate font-mono text-xs text-mist ltr-in-rtl">{stat.doctorEmail}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-steel/40 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CalendarDays className="h-4 w-4 text-arc" strokeWidth={1.75} />
                  </div>
                  <p className="mt-1 font-latin text-lg font-semibold text-foreground ltr-in-rtl">{stat.total}</p>
                  <p className="text-[11px] text-muted-foreground">{t.admin.totalCount}</p>
                </div>
                <div className="rounded-lg bg-steel/40 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Stethoscope className="h-4 w-4 text-ok" strokeWidth={1.75} />
                  </div>
                  <p className="mt-1 font-latin text-lg font-semibold text-foreground ltr-in-rtl">{stat.completed}</p>
                  <p className="text-[11px] text-muted-foreground">{t.admin.completedCount}</p>
                </div>
                <div className="rounded-lg bg-steel/40 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-arc" strokeWidth={1.75} />
                  </div>
                  <p className="mt-1 font-latin text-lg font-semibold text-foreground ltr-in-rtl">{stat.completionRate}%</p>
                  <p className="text-[11px] text-muted-foreground">{t.admin.completionRate}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {doctorStats.length === 0 && (
        <div className="rounded-2xl border border-line bg-card p-8 text-center">
          <Stethoscope className="mx-auto h-8 w-8 text-mist" strokeWidth={1.75} />
          <p className="mt-3 text-sm text-muted-foreground">No doctor data available.</p>
        </div>
      )}
    </div>
  )
}
