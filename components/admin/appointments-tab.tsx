"use client"

import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import { statusBg } from "@/lib/color-utils"
import { useT, resolveLabel } from "@/lib/i18n/use-t"
import type { AppointmentRow } from "@/lib/actions/admin/get-appointments-data"

type Props = {
  rows: AppointmentRow[] | null
}

export function AppointmentsTab({ rows }: Props) {
  const { t } = useT()

  return (
    <div className="flex flex-col p-6">
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 dark:border-[#374151]">
          <div>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.admin.todaysAppointments}</h3>
            <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {t.admin.allDoctorsScheduled.replace("{count}", String(rows?.length ?? 0))}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-[#374151]">
                {t.admin.appointmentColLabels.map((h: string) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows && rows.length > 0 ? (
                rows.map((apt) => {
                  const meta = APPOINTMENT_STATUS_META[apt.status as keyof typeof APPOINTMENT_STATUS_META]

                  return (
                    <tr
                      key={apt.appointmentId}
                      className="border-b border-[#E5E7EB] last:border-b-0 dark:border-[#374151]"
                    >
                      <td className="px-4 py-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-xs font-bold text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
                          {apt.queueNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
                        {apt.patientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {apt.patientDob ? `${deriveAge(apt.patientDob)} yrs` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[10px] font-semibold text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
                            {apt.doctorName
                              .replace(/^Dr\.\s*/i, "")
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                          <span className="text-sm text-[#111827] dark:text-[#F9FAFB]">{apt.doctorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB]">
                        {apt.scheduledStart.slice(11, 16)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
                          {apt.type === "new" ? t.admin.typeNew : t.admin.typeFollowUp}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: statusBg(meta.color),
                            color: meta.color,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          {resolveLabel(meta.labelKey, t)}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    No appointments found for the selected date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}