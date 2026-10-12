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
              className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 dark:border-[#374151] dark:bg-[#1F2937]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F766E]/[0.08] text-sm font-semibold text-[#0F766E] ring-1 ring-[#0F766E]/20">
                  {initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{stat.doctorName}</p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{stat.doctorEmail}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-[8px] bg-[#F9FAFB] p-3 text-center dark:bg-[#374151]">
                  <div className="flex items-center justify-center gap-1">
                    <CalendarDays className="h-4 w-4 text-[#0F766E]" strokeWidth={1.5} />
                  </div>
                  <p className="mt-1 text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">{stat.total}</p>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.totalCount}</p>
                </div>
                <div className="rounded-[8px] bg-[#F9FAFB] p-3 text-center dark:bg-[#374151]">
                  <div className="flex items-center justify-center gap-1">
                    <Stethoscope className="h-4 w-4 text-[#059669]" strokeWidth={1.5} />
                  </div>
                  <p className="mt-1 text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">{stat.completed}</p>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.completedCount}</p>
                </div>
                <div className="rounded-[8px] bg-[#F9FAFB] p-3 text-center dark:bg-[#374151]">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-[#2563EB]" strokeWidth={1.5} />
                  </div>
                  <p className="mt-1 text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">{stat.completionRate}%</p>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.completionRate}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {doctorStats.length === 0 && (
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-8 text-center dark:border-[#374151] dark:bg-[#1F2937]">
          <Stethoscope className="mx-auto h-8 w-8 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">No doctor data available.</p>
        </div>
      )}
    </div>
  )
}