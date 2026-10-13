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
    <div className="sticky top-0 z-10 bg-background px-6 pt-6 pb-3">
      <div className="flex items-center justify-between rounded-2xl border border-line bg-card px-6 py-4">
        {/* Start: patient identity */}
        <div className="flex items-center gap-4">
          {/* Avatar tile */}
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-arc/10">
            <User className="size-6 text-arc" strokeWidth={1.75} />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {patient.full_name}
            </h2>
            <div className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-4" strokeWidth={1.75} />
                <span className="ltr-in-rtl font-mono">{age} yrs</span>
              </span>
              <span className="h-4 w-px bg-line" />
              <span>{genderLabel}</span>
              {patient.blood_group && (
                <>
                  <span className="h-4 w-px bg-line" />
                  <span className="ltr-in-rtl font-mono">{patient.blood_group}</span>
                </>
              )}
              {patient.allergies && (
                <>
                  <span className="h-4 w-px bg-line" />
                  <span className="rounded-full bg-err/10 px-2 py-0.5 text-xs font-medium text-err">
                    {t.doctor.allergiesLabel}: {patient.allergies}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* End: status stepper */}
        <div className="flex items-center gap-1">
          {isCancelled ? (
            <span className="rounded-full bg-err/10 px-3 py-1 text-xs font-medium text-err">
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
                      className={`size-4 ${
                        completed ? "text-arc" : "text-line"
                      }`}
                      strokeWidth={1.75}
                    />
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      completed
                        ? "bg-ok/10 text-ok"
                        : active
                          ? "bg-arc/10 text-arc"
                          : "bg-steel text-muted-foreground"
                    }`}
                  >
                    {completed && (
                      <span className="me-1 inline-block size-1.5 rounded-full bg-ok" />
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
