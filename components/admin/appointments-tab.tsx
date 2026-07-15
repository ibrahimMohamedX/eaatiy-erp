"use client"

import { getTodayAppointments, getPatient, getUser, getDoctorInitials } from "@/lib/mock-data"
import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import { statusBg } from "@/lib/color-utils"
import { useT, resolveLabel } from "@/lib/i18n/use-t"

export function AppointmentsTab() {
  const { t } = useT()
  const appointments = getTodayAppointments()

  return (
    <div className="flex flex-col p-6">
      <div className="rounded-[12px] border border-[#E5E7EB] dark:border-[#374151] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.admin.todaysAppointments}</h3>
            <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.allDoctorsScheduled.replace("{count}", String(appointments.length))}</p>
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
              {appointments.map((apt) => {
                const patient = getPatient(apt.patient_id)
                const doctor = getUser(apt.doctor_id)
                const meta = APPOINTMENT_STATUS_META[apt.status]
                if (!patient) return null

                return (
                  <tr
                    key={apt.id}
                    className="border-b border-[#E5E7EB] dark:border-[#374151] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] dark:border-[#374151] text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF]">
                        {apt.queue_number}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
                      {patient.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {deriveAge(patient.date_of_birth)} yrs
                    </td>
                    <td className="px-4 py-3">
                      {doctor && (
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] dark:border-[#374151] text-[10px] font-semibold text-[#6B7280]">
                            {getDoctorInitials(doctor)}
                          </span>
                          <span className="text-sm text-[#111827] dark:text-[#F9FAFB]">{doctor.full_name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB]">
                      {apt.scheduled_start.slice(11, 16)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-[#E5E7EB] dark:border-[#374151] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}