"use client"

import { useState, useEffect, useRef } from "react"
import { Stethoscope, Play, PhoneCall } from "lucide-react"
import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import type { Appointment, Patient, User } from "@/lib/types"
import { getDoctorInitials } from "@/lib/db/repositories/users"
import { useT, resolveLabel } from "@/lib/i18n/use-t"
import { formatTime } from "@/lib/format-time"

const CALL_AGAIN_COOLDOWN_MS = 2 * 60 * 1000 // 2 minutes

/** Archai semantic tone classes per appointment status (10% tint + foreground) */
const STATUS_PILL_TONES: Record<string, string> = {
  waiting: "bg-warn/10 text-warn",
  called: "bg-arc/10 text-arc",
  in_consultation: "bg-arc/10 text-arc",
  completed: "bg-ok/10 text-ok",
  cancelled: "bg-err/10 text-err",
}

const STATUS_DOT_TONES: Record<string, string> = {
  waiting: "bg-warn",
  called: "bg-arc",
  in_consultation: "bg-arc",
  completed: "bg-ok",
  cancelled: "bg-err",
}

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
      className={`w-full cursor-pointer rounded-lg border p-4 text-start transition-colors duration-200 ${
        isSelected
          ? "border-arc/60 bg-steel/50"
          : "border-line bg-card hover:border-mist"
      }`}
    >
      {/* Top row: queue# + name + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
              isActive || isCalled
                ? "border-arc/60 text-arc"
                : "border-line text-mist"
            }`}
          >
            {appointment.queue_number}
          </span>
          <p className="text-sm font-semibold text-foreground">
            {patient.full_name}
          </p>
        </div>

        {/* Status pill */}
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_PILL_TONES[appointment.status]}`}
        >
          <span className={`size-1.5 rounded-full ${STATUS_DOT_TONES[appointment.status]}`} />
          {resolveLabel(meta.labelKey, t)}
        </span>
      </div>

      {/* Detail row */}
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="ltr-in-rtl font-mono">
          {age} yrs · {patient.gender}
        </span>
        <span className="h-3 w-px bg-line" />
        <span>{appointment.type === "new" ? t.doctor.newPatientLabel : t.doctor.followUpLabel}</span>
        <span className="h-3 w-px bg-line" />
        <span className="ltr-in-rtl font-mono">
          {formatTime(appointment.scheduled_start)}
        </span>
      </div>

      {/* Bottom row: doctor + queue action */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {doctor ? (
          <div className="flex items-center gap-1.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-xl border border-line text-[10px] font-semibold text-silver">
              {getDoctorInitials(doctor)}
            </span>
            <span className="text-xs text-muted-foreground">{doctor.full_name}</span>
          </div>
        ) : (
          <div /> /* spacer so actions stay right-aligned */
        )}

        {isWaiting && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCallNext() }}
            disabled={hasInConsultation}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors duration-200 ${
              hasInConsultation
                ? "cursor-not-allowed bg-steel text-mist"
                : "bg-arc/10 text-arc hover:bg-arc/20"
            }`}
            title={hasInConsultation ? t.doctor.alreadyInConsultationHint : undefined}
          >
            <Play className="size-3.5" strokeWidth={1.75} />
            {t.receptionist.callNext}
          </button>
        )}
        {isCalled && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); if (canCallAgain) onCallAgain() }}
              disabled={!canCallAgain}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors duration-200 ${
                canCallAgain
                  ? "bg-copper/10 text-copper hover:bg-copper/20"
                  : "cursor-not-allowed bg-steel text-mist"
              }`}
              title={!canCallAgain ? `${callAgainSecondsLeft}s` : undefined}
            >
              <PhoneCall className="size-3.5" strokeWidth={1.75} />
              {canCallAgain ? t.receptionist.callAgain : `${callAgainSecondsLeft}s`}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onStartConsultation() }}
              className="inline-flex items-center gap-1 rounded-lg bg-arc/10 px-2 py-1 text-xs font-medium text-arc transition-colors duration-200 hover:bg-arc/20"
            >
              <Stethoscope className="size-3.5" strokeWidth={1.75} />
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
      <div className="flex items-center justify-between border-b border-line px-4 py-4">
        <div className="flex items-center gap-2">
          <p className="archai-eyebrow">{t.doctor.myQueue}</p>
          <span className="flex h-5 items-center justify-center rounded-full bg-arc/10 px-1.5 font-mono text-[11px] font-semibold text-arc ltr-in-rtl">
            {activeAppointments.length}
          </span>
        </div>
      </div>

      {/* Scrollable queue list */}
      <div className="flex-1 overflow-y-auto">
        {activeAppointments.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <Stethoscope className="mx-auto size-8 text-mist" strokeWidth={1.75} />
              <p className="mt-3 text-sm font-medium text-foreground">
                {t.doctor.queueEmpty}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
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
