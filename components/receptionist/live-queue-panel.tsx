"use client"

import { useState, useTransition } from "react"
import { RefreshCw, ChevronDown, Trash2 } from "lucide-react"
import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import type { Appointment, AppointmentStatus, Patient, User } from "@/lib/types"
import { useT, resolveLabel } from "@/lib/i18n/use-t"
import { cancelAppointment } from "@/lib/actions/receptionist/cancel-appointment"
import { getDoctorInitials } from "@/lib/db/repositories/users"
import { formatTime } from "@/lib/format-time"

type StatusFilter = "All" | "Waiting" | "In Consultation" | "Completed" | "Cancelled"

const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "Waiting",
  "In Consultation",
  "Completed",
  "Cancelled",
]

const STATUS_FILTER_KEY_MAP: Record<StatusFilter, string> = {
  "All": "common.allDoctors", // special: "All" isn't a status, reuse allDoctors key or fallback
  "Waiting": "status.waiting",
  "In Consultation": "status.inConsultation",
  "Completed": "status.completed",
  "Cancelled": "status.cancelled",
}

/** Archai status tones — waiting → warn · called/in_consultation → arc · completed → ok · cancelled → err */
const STATUS_PILL_TONE: Record<AppointmentStatus, string> = {
  waiting: "bg-warn/10 text-warn",
  called: "bg-arc/10 text-arc",
  in_consultation: "bg-arc/10 text-arc",
  completed: "bg-ok/10 text-ok",
  cancelled: "bg-err/10 text-err",
}

const STATUS_PILL_DOT: Record<AppointmentStatus, string> = {
  waiting: "bg-warn",
  called: "bg-arc",
  in_consultation: "bg-arc",
  completed: "bg-ok",
  cancelled: "bg-err",
}

function resolveFilterLabel(f: StatusFilter, t: Record<string, any>): string {
  if (f === "All") return f // "All" is a universal word that works in both languages; leave untranslated for now
  return resolveLabel(STATUS_FILTER_KEY_MAP[f], t)
}

function statusToFilter(s: AppointmentStatus): StatusFilter {
  switch (s) {
    case "waiting":
      return "Waiting"
    case "called":
      return "Waiting" // "Called" patients still appear under Waiting filter for reception visibility
    case "in_consultation":
      return "In Consultation"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
  }
}

function StatusPill({ status, t }: { status: AppointmentStatus; t: Record<string, any> }) {
  const meta = APPOINTMENT_STATUS_META[status]
  const label = resolveLabel(meta.labelKey, t)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_PILL_TONE[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_PILL_DOT[status]}`} />
      {label}
    </span>
  )
}

type Props = {
  appointments: Appointment[]
  patients: Patient[]
  doctors: User[]
  onMutated: () => void
}

/**
 * Live Queue Panel — data table managing today's patient triage.
 * Receives data via props and calls server actions for mutations.
 */
export function LiveQueuePanel({ appointments, patients, doctors, onMutated }: Props) {
  const { t } = useT()
  const [isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [typeFilter, setTypeFilter] = useState<"New" | "Follow-up" | "All">("All")

  const filtered = appointments.filter((a) => {
    if (statusFilter !== "All" && statusToFilter(a.status) !== statusFilter) return false
    if (typeFilter !== "All") {
      const displayType = a.type === "new" ? "New" : "Follow-up"
      if (displayType !== typeFilter) return false
    }
    return true
  })

  function handleCancel(appointmentId: string) {
    startTransition(async () => {
      const result = await cancelAppointment(appointmentId)
      if (result.success) onMutated()
    })
  }

  /** Refresh via parent callback */
  function refresh() {
    onMutated()
    setStatusFilter("All")
    setTypeFilter("All")
  }

  const patientMap = new Map(patients.map((p) => [p.id, p]))
  const doctorMap = new Map(doctors.map((d) => [d.id, d]))

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-foreground">{t.receptionist.liveQueue}</h2>
          {/* Static live dot — the screen's single pulse animation lives in the top bar */}
          <span className="flex size-2 shrink-0 rounded-full bg-arc" aria-hidden />
        </div>
        <button
          type="button"
          onClick={refresh}
          className="flex size-8 items-center justify-center rounded-lg border border-line text-mist transition-colors duration-200 hover:border-mist hover:text-foreground"
          aria-label={t.receptionist.refreshQueue}
        >
          <RefreshCw className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
        >
          {t.common.allDoctors}
          <ChevronDown className="size-4 text-mist" strokeWidth={1.75} />
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={
                f === statusFilter
                  ? "flex h-8 items-center rounded-full bg-accent px-3 text-xs font-medium text-foreground"
                  : "flex h-8 items-center rounded-full border border-line px-3 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-mist hover:text-foreground"
              }
            >
              {f === "All" ? f : resolveLabel(STATUS_FILTER_KEY_MAP[f], t)}
            </button>
          ))}
        </div>

        <div className="ms-auto flex h-9 items-center rounded-lg border border-line p-0.5">
          <button
            type="button"
            onClick={() => setTypeFilter("New")}
            className={
              typeFilter === "New"
                ? "h-8 rounded-lg bg-accent px-3 text-xs font-medium text-foreground"
                : "h-8 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            }
          >
            {t.receptionist.newPatient}
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("Follow-up")}
            className={
              typeFilter === "Follow-up"
                ? "h-8 rounded-lg bg-accent px-3 text-xs font-medium text-foreground"
                : "h-8 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            }
          >
            {t.receptionist.followUp}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-start">
          <thead>
            <tr className="border-b border-line">
              {t.receptionist.queueCols.map((h: string) => (
                <th key={h} className="px-4 py-2.5">
                  <span className="archai-eyebrow !text-mist">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((apt) => {
              const patient = patientMap.get(apt.patient_id)
              const doctor = doctorMap.get(apt.doctor_id)
              const active = apt.status === "in_consultation"
              const showDeleteOnly = apt.status === "waiting"

              if (!patient) return null

              return (
                <tr
                  key={apt.id}
                  className={`border-b border-line last:border-b-0 ${active ? "bg-arc/10" : ""}`}
                >
                  <td className="px-4 py-3">
                    <span className="flex size-7 items-center justify-center rounded-lg border border-arc/60 font-mono text-xs font-bold text-arc">
                      {apt.queue_number}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {patient.full_name}
                      </p>
                      <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                        {deriveAge(patient.date_of_birth)} yrs
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-mist ltr-in-rtl">{patient.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {doctor && (
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-steel text-[10px] font-semibold text-silver">
                          {getDoctorInitials(doctor)}
                        </span>
                        <span className="text-sm text-foreground">{doctor.full_name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-foreground ltr-in-rtl">
                      {formatTime(apt.scheduled_start)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {apt.type === "new" ? t.receptionist.newPatient : t.receptionist.followUp}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={apt.status} t={t} />
                  </td>
                  <td className="px-4 py-3">
                    {showDeleteOnly && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCancel(apt.id)}
                          disabled={isPending}
                          className="flex size-7 items-center justify-center rounded-lg text-mist transition-colors duration-200 hover:bg-err/10 hover:text-err disabled:opacity-50"
                          aria-label={t.receptionist.cancelAppointment}
                          title={t.receptionist.cancelAppointment}
                        >
                          <Trash2 className="size-[18px]" strokeWidth={1.75} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
