"use client"

import { Calendar, Stethoscope, FileText } from "lucide-react"
import { deriveAge } from "@/lib/types"
import type { Appointment, Patient, User } from "@/lib/types"
import { getDoctorInitials } from "@/lib/db/repositories/users"
import { useT } from "@/lib/i18n/use-t"

type Props = {
  patient: Patient
  /** Past completed appointments (from getPatientData action) */
  history: Appointment[]
  /** Doctors lookup (from getMyQueue action or separate fetch) */
  doctors: User[]
}

export function HistoryTab({ patient, history, doctors }: Props) {
  const { t } = useT()
  const doctorMap = new Map(doctors.map((d) => [d.id, d]))

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-10 w-10 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.noPastEncounters}</p>
        <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.noPastEncountersDesc}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.doctor.pastEncounters}</h3>

      {history.map((apt) => {
        const doctor = doctorMap.get(apt.doctor_id)
        const ageAtVisit = deriveAge(patient.date_of_birth, new Date(apt.completed_at!))

        return (
          <div
            key={apt.id}
            className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 dark:border-[#374151] dark:bg-[#1F2937]"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#059669]/[0.12]">
                  <Stethoscope className="h-[18px] w-[18px] text-[#059669]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
                    {apt.type === "new" ? t.doctor.initialVisit : t.doctor.followUpVisit}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {apt.completed_at?.slice(0, 10)} · {apt.completed_at?.slice(11, 16)}
                  </p>
                </div>
              </div>

              {/* Doctor */}
              {doctor && (
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[10px] font-semibold text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
                    {getDoctorInitials(doctor)}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-[#111827] dark:text-[#F9FAFB]">{doctor.full_name}</p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {t.doctor.patientWas.replace("{age}", String(ageAtVisit))}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Note: Clinical summary (diagnosis, vitals) from medical record not shown
                in v1 wiring. Future enhancement: fetch medical records for historical
                appointments via getPatientMedicalRecords and join by appointment_id. */}
          </div>
        )
      })}
    </div>
  )
}