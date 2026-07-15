"use client"

import { User, Calendar, ChevronRight } from "lucide-react"
import { deriveAge } from "@/lib/types"
import type { Patient, Appointment } from "@/lib/types"
import { useT, resolveLabel } from "@/lib/i18n/use-t"

/**
 * Sticky patient banner — name, computed age, gender, and status stepper
 * showing the appointment lifecycle progression.
 */

type Props = {
  patient: Patient
  appointment: Appointment
}

export function PatientBanner({ patient, appointment }: Props) {
  const { t } = useT()
  const age = deriveAge(patient.date_of_birth)
  const genderLabel =
    patient.gender === "male"
      ? t.common.male
      : patient.gender === "female"
        ? t.common.female
        : t.common.other

  const STEPS: { label: string; key: "waiting" | "in_consultation" | "completed" }[] = [
    { label: resolveLabel("status.waiting", t), key: "waiting" },
    { label: resolveLabel("status.inConsultation", t), key: "in_consultation" },
    { label: resolveLabel("status.completed", t), key: "completed" },
  ]

  const currentStepIdx = STEPS.findIndex((s) => s.key === appointment.status)
  const isCancelled = appointment.status === "cancelled"

  return (
    <div className="sticky top-0 z-10 bg-[#F9FAFB] px-6 pt-6 pb-3 dark:bg-[#111827]">
      <div className="flex items-center justify-between rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-4 dark:border-[#374151] dark:bg-[#1F2937]">
        {/* Left: patient identity */}
        <div className="flex items-center gap-4">
          {/* Avatar circle */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F766E]/[0.08]">
            <User className="h-6 w-6 text-[#0F766E]" strokeWidth={1.5} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">
              {patient.full_name}
            </h2>
            <div className="mt-0.5 flex items-center gap-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" strokeWidth={1.5} />
                {age} yrs
              </span>
              <span className="h-4 w-px bg-[#E5E7EB] dark:bg-[#374151]" />
              <span>{genderLabel}</span>
              {patient.blood_group && (
                <>
                  <span className="h-4 w-px bg-[#E5E7EB] dark:bg-[#374151]" />
                  <span>{patient.blood_group}</span>
                </>
              )}
              {patient.allergies && (
                <>
                  <span className="h-4 w-px bg-[#E5E7EB] dark:bg-[#374151]" />
                  <span className="rounded-full bg-[#DC2626]/[0.12] px-2 py-0.5 text-xs font-medium text-[#DC2626]">
                    {t.doctor.allergiesLabel}: {patient.allergies}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: status stepper */}
        <div className="flex items-center gap-1">
          {isCancelled ? (
            <span className="rounded-full bg-[#DC2626]/[0.12] px-3 py-1 text-xs font-medium text-[#DC2626]">
              {resolveLabel("status.cancelled", t)}
            </span>
          ) : (
            STEPS.map((step, i) => {
              const completed = i < currentStepIdx
              const active = i === currentStepIdx
              const pending = i > currentStepIdx

              return (
                <div key={step.key} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight
                      className={`h-4 w-4 ${
                        completed ? "text-[#0F766E]" : "text-[#E5E7EB] dark:text-[#374151]"
                      }`}
                      strokeWidth={1.5}
                    />
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      completed
                        ? "bg-[#059669]/[0.12] text-[#059669]"
                        : active
                          ? "bg-[#2563EB]/[0.12] text-[#2563EB]"
                          : "bg-[#F9FAFB] text-[#6B7280] dark:bg-[#374151] dark:text-[#9CA3AF]"
                    }`}
                  >
                    {completed && (
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#059669]" />
                    )}
                    {step.label}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}