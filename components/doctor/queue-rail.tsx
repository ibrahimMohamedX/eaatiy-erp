"use client"

import { useState } from "react"
import { Stethoscope, PhoneCall } from "lucide-react"
import {
  getTodayAppointments,
  getPatient,
  getUser,
  getDoctorInitials,
} from "@/lib/mock-data"
import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import type { Appointment } from "@/lib/types"

/**
 * Doctor's "My Queue" left rail — independently scrollable list of today's
 * waiting/in-consultation patients assigned to this doctor.
 */

// For now, show Dr. Sara Reyes' patients (u_doctor_01).
const DOCTOR_ID = "u_doctor_01"

function QueueCard({
  appointment,
  isSelected,
  onSelect,
}: {
  appointment: Appointment
  isSelected: boolean
  onSelect: () => void
}) {
  const patient = getPatient(appointment.patient_id)
  const doctor = getUser(appointment.doctor_id)
  const meta = APPOINTMENT_STATUS_META[appointment.status]
  if (!patient) return null

  const age = deriveAge(patient.date_of_birth)
  const isWaiting = appointment.status === "waiting"
  const isActive = appointment.status === "in_consultation"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[12px] border p-4 text-left transition-colors ${
        isSelected
          ? "border-[#0F766E] bg-[#F9FAFB]"
          : "border-[#E5E7EB] bg-white hover:border-[#0F766E]/40"
      }`}
    >
      {/* Top row: queue# + name + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Queue number circle */}
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
              isActive
                ? "border-[#0F766E] bg-[#0F766E] text-white"
                : "border-[#E5E7EB] text-[#6B7280]"
            }`}
          >
            {appointment.queue_number}
          </span>
          <p className="text-sm font-semibold text-[#111827]">
            {patient.full_name}
          </p>
        </div>

        {/* Status pill */}
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: `rgba(${
              meta.color === "#D97706"
                ? "217,119,6"
                : meta.color === "#2563EB"
                  ? "37,99,235"
                  : meta.color === "#059669"
                    ? "5,150,105"
                    : "220,38,38"
            },0.12)`,
            color: meta.color,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
          {meta.label}
        </span>
      </div>

      {/* Detail row */}
      <div className="mt-2 flex items-center gap-3 text-xs text-[#6B7280]">
        <span>
          {age} yrs · {patient.gender}
        </span>
        <span className="h-3 w-px bg-[#E5E7EB]" />
        <span>{appointment.type === "new" ? "New Patient" : "Follow-up"}</span>
        <span className="h-3 w-px bg-[#E5E7EB]" />
        <span>
          {appointment.scheduled_start.slice(11, 16)}
        </span>
      </div>

      {/* Bottom row: doctor + queue action */}
      {doctor && (
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] text-[10px] font-semibold text-[#6B7280]">
              {getDoctorInitials(doctor)}
            </span>
            <span className="text-xs text-[#6B7280]">{doctor.full_name}</span>
          </div>

          {isWaiting && (
            <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#0F766E]/[0.08] px-2 py-1 text-xs font-medium text-[#0F766E]">
              <Stethoscope className="h-3.5 w-3.5" strokeWidth={1.5} />
              Call next
            </span>
          )}
        </div>
      )}
    </button>
  )
}

export function QueueRail() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const appointments = getTodayAppointments(DOCTOR_ID)
  const activeAppointments = appointments.filter(
    (a) => a.status === "waiting" || a.status === "in_consultation",
  )

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-4">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
            My Queue
          </p>
          <span className="flex h-5 items-center justify-center rounded-full bg-[#0F766E]/[0.12] px-1.5 text-[11px] font-semibold text-[#0F766E]">
            {activeAppointments.length}
          </span>
        </div>

        {/* Quick call icon */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E5E7EB] text-[#6B7280] transition-colors hover:text-[#0F766E]"
          aria-label="Call next patient"
        >
          <PhoneCall className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </div>

      {/* Scrollable queue list */}
      <div className="flex-1 overflow-y-auto">
        {activeAppointments.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <Stethoscope className="mx-auto h-8 w-8 text-[#E5E7EB]" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-[#6B7280]">
                No patients in queue
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Your queue is clear for today
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {activeAppointments.map((apt) => (
              <QueueCard
                key={apt.id}
                appointment={apt}
                isSelected={selectedId === apt.id}
                onSelect={() => setSelectedId(apt.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}