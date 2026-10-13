"use client"

import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import { useT, resolveLabel } from "@/lib/i18n/use-t"
import type { AppointmentRow } from "@/lib/actions/admin/get-appointments-data"

/** Archai tinted-pill classes per appointment status */
const STATUS_PILL: Record<string, string> = {
  waiting: "bg-warn/10 text-warn",
  called: "bg-copper/10 text-copper",
  in_consultation: "bg-arc/10 text-arc",
  completed: "bg-ok/10 text-ok",
  cancelled: "bg-err/10 text-err",
}

const STATUS_DOT: Record<string, string> = {
  waiting: "bg-warn",
  called: "bg-copper",
  in_consultation: "bg-arc",
  completed: "bg-ok",
  cancelled: "bg-err",
}

type Props = {
  rows: AppointmentRow[] | null
}

export function AppointmentsTab({ rows }: Props) {
  const { t } = useT()

  return (
    <div className="flex flex-col p-6">
      <div className="rounded-2xl border border-line bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">{t.admin.todaysAppointments}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.admin.allDoctorsScheduled.replace("{count}", String(rows?.length ?? 0))}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {t.admin.appointmentColLabels.map((h: string) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist"
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
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line font-mono text-xs font-bold text-mist ltr-in-rtl">
                          {apt.queueNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[15px] font-semibold text-foreground">
                        {apt.patientName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">
                        {apt.patientDob ? `${deriveAge(apt.patientDob)} yrs` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-steel text-[10px] font-semibold text-silver">
                            {apt.doctorName
                              .replace(/^Dr\.\s*/i, "")
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                          <span className="text-[15px] text-foreground">{apt.doctorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">
                        {apt.scheduledStart.slice(11, 16)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {apt.type === "new" ? t.admin.typeNew : t.admin.typeFollowUp}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            STATUS_PILL[apt.status] ?? "bg-steel text-silver"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${STATUS_DOT[apt.status] ?? "bg-silver"}`}
                          />
                          {resolveLabel(meta.labelKey, t)}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
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
