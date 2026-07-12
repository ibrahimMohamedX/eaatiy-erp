import { Calendar, Stethoscope, FileText } from "lucide-react"
import { getPatientHistory, getPatient, getUser, getMedicalRecordForAppointment } from "@/lib/mock-data"
import { deriveAge } from "@/lib/types"
import type { Patient } from "@/lib/types"

type Props = { patient: Patient }

export function HistoryTab({ patient }: Props) {
  const history = getPatientHistory(patient.id)

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-10 w-10 text-[#E5E7EB]" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-medium text-[#6B7280]">No past encounters</p>
        <p className="mt-1 text-xs text-[#6B7280]">This patient has no prior completed visits.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <h3 className="text-sm font-semibold text-[#111827]">Past Clinical Encounters</h3>

      {history.map((apt) => {
        const doctor = getUser(apt.doctor_id)
        const record = getMedicalRecordForAppointment(apt.id)
        const ageAtVisit = deriveAge(patient.date_of_birth, new Date(apt.completed_at!))

        return (
          <div
            key={apt.id}
            className="rounded-[12px] border border-[#E5E7EB] bg-white p-4"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#059669]/[0.12]">
                  <Stethoscope className="h-[18px] w-[18px] text-[#059669]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {apt.type === "new" ? "Initial Visit" : "Follow-up Visit"}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {apt.completed_at?.slice(0, 10)} · {apt.completed_at?.slice(11, 16)}
                  </p>
                </div>
              </div>

              {/* Doctor */}
              {doctor && (
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[10px] font-semibold text-[#6B7280]">
                    {doctor.full_name
                      .replace(/^Dr\.\s*/i, "")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-[#111827]">{doctor.full_name}</p>
                    <p className="text-xs text-[#6B7280]">
                      Patient was {ageAtVisit} yrs
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Clinical summary */}
            {record && (
              <div className="mt-3 space-y-2 border-t border-[#E5E7EB] pt-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280]">
                    Diagnosis
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#111827] line-clamp-2">
                    {record.diagnosis}
                  </p>
                </div>

                {/* Vitals snapshot */}
                {record.vitals && (
                  <div className="flex flex-wrap gap-3">
                    {record.vitals.systolic_bp != null && record.vitals.diastolic_bp != null && (
                      <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#6B7280]">
                        BP: {record.vitals.systolic_bp}/{record.vitals.diastolic_bp}
                      </span>
                    )}
                    {record.vitals.temperature != null && (
                      <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#6B7280]">
                        Temp: {record.vitals.temperature}°C
                      </span>
                    )}
                    {record.vitals.weight != null && (
                      <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#6B7280]">
                        Wt: {record.vitals.weight}kg
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}