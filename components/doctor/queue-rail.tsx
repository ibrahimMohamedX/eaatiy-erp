"use client"

import { useState, useEffect, useRef } from "react"
import { Stethoscope, Play, PhoneCall } from "lucide-react"
import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import type { Appointment, Patient, User } from "@/lib/types"
import { getDoctorInitials } from "@/lib/db/repositories/users"
import { useT, resolveLabel } from "@/lib/i18n/use-t"
import { statusBg } from "@/lib/color-utils"
import { formatTime } from "@/lib/format-time"

const CALL_AGAIN_COOLDOWN_MS = 2 * 60 * 1000 // 2 minutes

type Props = {
  appointments: Appointment[]
  patients: Patient[]
  doctors: User[]
  serverNow: string
  selectedId: string | null
  onSelect: (appointmentId: string) => void
  onCallNext: (appointmentId: string) => void
  onCallAgain: (appointmentId: string) => void
  onStartConsultation: (appointmentId: string) => void
}

function QueueCard({
  appointment,
  patient,
  doctor,
  isSelected,
  hasInConsultation,
  onSelect,
  onCallNext,
  onCallAgain,
  onStartConsultation,
  serverNow,
  t,
}: {
  appointment: Appointment
  patient: Patient
  doctor?: User
  isSelected: boolean
  hasInConsultation: boolean
  onSelect: () => void
  onCallNext: () => void
  onCallAgain: () => void
  onStartConsultation: () => void
  serverNow: string
  t: Record<string, any>
}) {
  const meta = APPOINTMENT_STATUS_META[appointment.status]
  const age = deriveAge(patient.date_of_birth, new Date(serverNow))
  const isWaiting = appointment.status === "waiting"
  const isCalled = appointment.status === "called"
  const isActive = appointment.status === "in_consultation"

  // Countdown timer for Call Again cooldown
  const [callAgainSecondsLeft, setCallAgainSecondsLeft] = useState(0)

  // Calculate and track the cooldown timer
  useEffect(() => {
    if (!isCalled || !appointment.last_called_at) {
      setCallAgainSecondsLeft(0)
      return
    }

    function recalc() {
      const lastCalled = new Date(appointment.last_called_at!).getTime()
      const elapsed = Date.now() - lastCalled
      const remaining = CALL_AGAIN_COOLDOWN_MS - elapsed
      setCallAgainSecondsLeft(remaining > 0 ? Math.ceil(remaining / 1000) : 0)
    }

    recalc()
    const interval = setInterval(recalc, 1000)
    return () => clearInterval(interval)
  }, [isCalled, appointment.last_called_at])

  const canCallAgain = callAgainSecondsLeft === 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect() } }}
      className={`w-full rounded-[12px] border p-4 text-left transition-colors cursor-pointer ${
        isSelected
          ? "border-[#0F766E] bg-[#F9FAFB] dark:border-[#0F766E] dark:bg-[#374151]"
          : "border-[#E5E7EB] bg-white hover:border-[#0F766E]/40 dark:border-[#374151] dark:bg-[#1F2937] dark:hover:border-[#0F766E]/60"
      }`}
    >
      {/* Top row: queue# + name + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
              isActive || isCalled
                ? "border-[#0F766E] bg-[#0F766E] text-white"
                : "border-[#E5E7EB] text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]"
            }`}
          >
            {appointment.queue_number}
          </span>
          <p className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
            {patient.full_name}
          </p>
        </div>

        {/* Status pill */}
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: statusBg(meta.color),
            color: meta.color,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
          {resolveLabel(meta.labelKey, t)}
        </span>
      </div>

      {/* Detail row */}
      <div className="mt-2 flex items-center gap-3 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
        <span>
          {age} yrs · {patient.gender}
        </span>
        <span className="h-3 w-px bg-[#E5E7EB] dark:bg-[#374151]" />
        <span>{appointment.type === "new" ? t.doctor.newPatientLabel : t.doctor.followUpLabel}</span>
        <span className="h-3 w-px bg-[#E5E7EB] dark:bg-[#374151]" />
        <span>
          {formatTime(appointment.scheduled_start)}
        </span>
      </div>

      {/* Bottom row: doctor + queue action */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {doctor ? (
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] text-[10px] font-semibold text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
              {getDoctorInitials(doctor)}
            </span>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{doctor.full_name}</span>
          </div>
        ) : (
          <div /> /* spacer so actions stay right-aligned */
        )}

        {isWaiting && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCallNext() }}
            disabled={hasInConsultation}
            className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-xs font-medium transition-colors ${
              hasInConsultation
                ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed dark:bg-[#374151] dark:text-[#6B7280]"
                : "bg-[#0F766E]/[0.08] text-[#0F766E] hover:bg-[#0F766E]/[0.16]"
            }`}
            title={hasInConsultation ? t.doctor.alreadyInConsultationHint : undefined}
          >
            <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t.receptionist.callNext}
          </button>
        )}
        {isCalled && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); if (canCallAgain) onCallAgain() }}
              disabled={!canCallAgain}
              className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-xs font-medium transition-colors ${
                canCallAgain
                  ? "bg-[#9333EA]/[0.08] text-[#9333EA] hover:bg-[#9333EA]/[0.16]"
                  : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed dark:bg-[#374151] dark:text-[#6B7280]"
              }`}
              title={!canCallAgain ? `${callAgainSecondsLeft}s` : undefined}
            >
              <PhoneCall className="h-3.5 w-3.5" strokeWidth={1.5} />
              {canCallAgain ? t.receptionist.callAgain : `${callAgainSecondsLeft}s`}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onStartConsultation() }}
              className="inline-flex items-center gap-1 rounded-[6px] bg-[#0F766E]/[0.08] px-2 py-1 text-xs font-medium text-[#0F766E] transition-colors hover:bg-[#0F766E]/[0.16]"
            >
              <Stethoscope className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t.receptionist.startConsultation}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function QueueRail({ appointments, patients, doctors, serverNow, selectedId, onSelect, onCallNext, onCallAgain, onStartConsultation }: Props) {
  const { t } = useT()
  const patientMap = new Map(patients.map((p) => [p.id, p]))
  const doctorMap = new Map(doctors.map((d) => [d.id, d]))

  const activeAppointments = appointments.filter(
    (a) => a.status === "waiting" || a.status === "called" || a.status === "in_consultation",
  )

  // Check if any patient is currently in consultation
  const hasInConsultation = activeAppointments.some((a) => a.status === "in_consultation")

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-4 dark:border-[#374151]">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] dark:text-[#9CA3AF]">
            {t.doctor.myQueue}
          </p>
          <span className="flex h-5 items-center justify-center rounded-full bg-[#0F766E]/[0.12] px-1.5 text-[11px] font-semibold text-[#0F766E]">
            {activeAppointments.length}
          </span>
        </div>
      </div>

      {/* Scrollable queue list */}
      <div className="flex-1 overflow-y-auto">
        {activeAppointments.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <Stethoscope className="mx-auto h-8 w-8 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                {t.doctor.queueEmpty}
              </p>
              <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {t.doctor.queueEmptyDesc}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {activeAppointments.map((apt) => {
              const patient = patientMap.get(apt.patient_id)
              const doctor = doctorMap.get(apt.doctor_id)
              if (!patient) return null

              return (
                <QueueCard
                  key={apt.id}
                  appointment={apt}
                  patient={patient}
                  doctor={doctor}
                  isSelected={selectedId === apt.id}
                  hasInConsultation={hasInConsultation}
                  onSelect={() => onSelect(apt.id)}
                  onCallNext={() => onCallNext(apt.id)}
                  onCallAgain={() => onCallAgain(apt.id)}
                  onStartConsultation={() => onStartConsultation(apt.id)}
                  serverNow={serverNow}
                  t={t}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}