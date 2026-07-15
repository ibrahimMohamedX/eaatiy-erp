"use client"

import { useState } from "react"
import { RefreshCw, ChevronDown, ArrowRightCircle, Stethoscope, Trash2 } from "lucide-react"
import {
  getTodayAppointments,
  getPatient,
  getUser,
  getDoctorInitials,
} from "@/lib/mock-data"
import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import type { Appointment, AppointmentStatus } from "@/lib/types"
import { statusBg } from "@/lib/color-utils"
import { useT, resolveLabel } from "@/lib/i18n/use-t"

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

function resolveFilterLabel(f: StatusFilter, t: Record<string, any>): string {
  if (f === "All") return f // "All" is a universal word that works in both languages; leave untranslated for now
  return resolveLabel(STATUS_FILTER_KEY_MAP[f], t)
}

function statusToFilter(s: AppointmentStatus): StatusFilter {
  switch (s) {
    case "waiting":
      return "Waiting"
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
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: statusBg(meta.color),
        color: meta.color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {label}
    </span>
  )
}

/**
 * Live Queue Panel — data table managing today's patient triage.
 * Pulls from centralized mock data and supports status transitions.
 */
export function LiveQueuePanel() {
  const { t } = useT()
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    getTodayAppointments(),
  )
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

  /** Transition appointment status */
  function transition(appointment: Appointment, to: AppointmentStatus) {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointment.id
          ? {
              ...a,
              status: to,
              actual_start:
                to === "in_consultation" ? new Date().toISOString() : a.actual_start,
              completed_at:
                to === "completed" ? new Date().toISOString() : a.completed_at,
              cancelled_at:
                to === "cancelled" ? new Date().toISOString() : a.cancelled_at,
              updated_at: new Date().toISOString(),
            }
          : a,
      ),
    )
  }

  /** Refresh — re-pull from mock data */
  function refresh() {
    setAppointments(getTodayAppointments())
    setStatusFilter("All")
    setTypeFilter("All")
  }

  return (
    <div className="flex flex-col rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.receptionist.liveQueue}</h2>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0F766E] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0F766E]" />
          </span>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E5E7EB] text-[#6B7280] transition-colors hover:text-[#111827] dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
          aria-label={t.receptionist.refreshQueue}
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] dark:border-[#374151] px-5 py-3">
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-3 text-sm text-[#111827] dark:border-[#374151] dark:text-[#F9FAFB]"
        >
          {t.common.allDoctors}
          <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={
                f === statusFilter
                  ? "flex h-8 items-center rounded-full bg-[#0F766E] px-3 text-xs font-medium text-white"
                  : "flex h-8 items-center rounded-full border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#6B7280] transition-colors hover:text-[#111827] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
              }
            >
              {f === "All" ? f : resolveLabel(STATUS_FILTER_KEY_MAP[f], t)}
            </button>
          ))}
        </div>

        <div className="ml-auto flex h-9 items-center rounded-[8px] border border-[#E5E7EB] p-0.5 dark:border-[#374151]">
          <button
            type="button"
            onClick={() => setTypeFilter("New")}
            className={
              typeFilter === "New"
                ? "h-8 rounded-[6px] bg-[#0F766E] px-3 text-xs font-medium text-white"
                : "h-8 rounded-[6px] px-3 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]"
            }
          >
            {t.receptionist.newPatient}
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("Follow-up")}
            className={
              typeFilter === "Follow-up"
                ? "h-8 rounded-[6px] bg-[#0F766E] px-3 text-xs font-medium text-white"
                : "h-8 rounded-[6px] px-3 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]"
            }
          >
            {t.receptionist.followUp}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E5E7EB] dark:border-[#374151]">
              {t.receptionist.queueCols.map((h: string) => (
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
            {filtered.map((apt) => {
              const patient = getPatient(apt.patient_id)
              const doctor = getUser(apt.doctor_id)
              const active = apt.status === "in_consultation"
              const showActions = apt.status === "waiting" || apt.status === "in_consultation"

              if (!patient) return null

              return (
                <tr
                  key={apt.id}
                  className="border-b border-[#E5E7EB] dark:border-[#374151] last:border-b-0"
                  style={
                    active
                      ? {
                          boxShadow:
                            "inset 3px 0 0 0 #0F766E, 0 2px 8px rgba(17,24,39,0.06)",
                        }
                      : undefined
                  }
                >
                  <td className="px-4 py-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0F766E] text-xs font-bold text-[#0F766E]">
                      {apt.queue_number}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
                        {patient.full_name}
                      </p>
                      <span className="inline-flex items-center rounded-full border border-[#E5E7EB] px-2 py-0.5 text-[11px] font-medium text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
                        {deriveAge(patient.date_of_birth)} yrs
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{patient.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {doctor && (
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[10px] font-semibold text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
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
                    <span className="inline-flex items-center rounded-full border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
                      {apt.type === "new" ? t.receptionist.newPatient : t.receptionist.followUp}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={apt.status} t={t} />
                  </td>
                  <td className="px-4 py-3">
                    {showActions && (
                      <div className="flex items-center gap-1">
                        {apt.status === "waiting" && (
                          <button
                            type="button"
                            onClick={() => transition(apt, "in_consultation")}
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#6B7280] transition-colors hover:text-[#0F766E] dark:text-[#9CA3AF] dark:hover:text-[#0F766E]"
                            aria-label={t.receptionist.startConsultation}
                            title={t.receptionist.callNext}
                          >
                            <Stethoscope className="h-[18px] w-[18px]" strokeWidth={1.5} />
                          </button>
                        )}
                        {apt.status === "in_consultation" && (
                          <button
                            type="button"
                            onClick={() => transition(apt, "completed")}
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#6B7280] transition-colors hover:text-[#059669] dark:text-[#9CA3AF] dark:hover:text-[#059669]"
                            aria-label={t.receptionist.completeConsultation}
                            title={t.receptionist.markCompleted}
                          >
                            <ArrowRightCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => transition(apt, "cancelled")}
                          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#6B7280] transition-colors hover:text-[#DC2626] dark:text-[#9CA3AF] dark:hover:text-[#DC2626]"
                          aria-label={t.receptionist.cancelAppointment}
                          title={t.receptionist.cancelAppointment}
                        >
                          <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
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