import { User, Calendar, ChevronRight } from "lucide-react"
import { deriveAge } from "@/lib/types"
import type { Patient, Appointment } from "@/lib/types"

/**
 * Sticky patient banner — name, computed age, gender, and status stepper
 * showing the appointment lifecycle progression.
 */

type Props = {
  patient: Patient
  appointment: Appointment
}

const STEPS: { label: string; key: "waiting" | "in_consultation" | "completed" }[] = [
  { label: "Waiting", key: "waiting" },
  { label: "In Consultation", key: "in_consultation" },
  { label: "Completed", key: "completed" },
]

export function PatientBanner({ patient, appointment }: Props) {
  const age = deriveAge(patient.date_of_birth)
  const genderLabel =
    patient.gender === "male"
      ? "Male"
      : patient.gender === "female"
        ? "Female"
        : "Other"
  const currentStepIdx = STEPS.findIndex((s) => s.key === appointment.status)
  const isCancelled = appointment.status === "cancelled"

  return (
    <div className="sticky top-0 z-10 bg-[#F9FAFB] px-6 pt-6 pb-3">
      <div className="flex items-center justify-between rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-4">
        {/* Left: patient identity */}
        <div className="flex items-center gap-4">
          {/* Avatar circle */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F766E]/[0.08]">
            <User className="h-6 w-6 text-[#0F766E]" strokeWidth={1.5} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#111827]">
              {patient.full_name}
            </h2>
            <div className="mt-0.5 flex items-center gap-3 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" strokeWidth={1.5} />
                {age} yrs
              </span>
              <span className="h-4 w-px bg-[#E5E7EB]" />
              <span>{genderLabel}</span>
              {patient.blood_group && (
                <>
                  <span className="h-4 w-px bg-[#E5E7EB]" />
                  <span>{patient.blood_group}</span>
                </>
              )}
              {patient.allergies && (
                <>
                  <span className="h-4 w-px bg-[#E5E7EB]" />
                  <span className="rounded-full bg-[#DC2626]/[0.12] px-2 py-0.5 text-xs font-medium text-[#DC2626]">
                    Allergic: {patient.allergies}
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
              Cancelled
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
                        completed ? "text-[#0F766E]" : "text-[#E5E7EB]"
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
                          : "bg-[#F9FAFB] text-[#6B7280]"
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