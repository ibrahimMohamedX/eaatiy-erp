"use client"

import { Calendar, Stethoscope, FileText } from "lucide-react"
import { getPatientHistory, getPatient, getUser, getMedicalRecordForAppointment } from "@/lib/mock-data"
import { deriveAge } from "@/lib/types"
import type { Patient } from "@/lib/types"
import { useT } from "@/lib/i18n/use-t"

type Props = { patient: Patient }

export function HistoryTab({ patient }: Props) {
  const { t } = useT()
  const history = getPatientHistory(patient.id)

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
        const doctor = getUser(apt.doctor_id)
        const record = getMedicalRecordForAppointment(apt.id)
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
                    {doctor.full_name
                      .replace(/^Dr\.\s*/i, "")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
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

            {/* Clinical summary */}
            {record && (
              <div className="mt-3 space-y-2 border-t border-[#E5E7EB] pt-3 dark:border-[#374151]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]">
                    {t.doctor.diagnosis}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#111827] line-clamp-2 dark:text-[#F9FAFB]">{record.diagnosis}</p>
                </div>

                {/* Vitals snapshot */}
                {record.vitals && (
                  <div className="flex flex-wrap gap-3">
                    {record.vitals.systolic_bp != null && record.vitals.diastolic_bp != null && (
                      <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#6B7280] dark:border-[#374151] dark:bg-[#374151] dark:text-[#9CA3AF]">
                        {t.vitals.systolicBP}: {record.vitals.systolic_bp}/{record.vitals.diastolic_bp}
                      </span>
                    )}
                    {record.vitals.temperature != null && (
                      <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#6B7280] dark:border-[#374151] dark:bg-[#374151] dark:text-[#9CA3AF]">
                        {t.vitals.temperature}: {record.vitals.temperature}°C
                      </span>
                    )}
                    {record.vitals.weight != null && (
                      <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#6B7280] dark:border-[#374151] dark:bg-[#374151] dark:text-[#9CA3AF]">
                        {t.vitals.weight}: {record.vitals.weight}kg
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