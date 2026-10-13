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
        <FileText className="size-10 text-mist" strokeWidth={1.75} />
        <p className="mt-4 text-sm font-medium text-foreground">{t.doctor.noPastEncounters}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t.doctor.noPastEncountersDesc}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <h3 className="font-display text-base font-semibold text-foreground">{t.doctor.pastEncounters}</h3>

      {history.map((apt) => {
        const doctor = doctorMap.get(apt.doctor_id)
        const ageAtVisit = deriveAge(patient.date_of_birth, new Date(apt.completed_at!))

        return (
          <div
            key={apt.id}
            className="rounded-lg border border-line bg-card p-4 transition-colors duration-200 hover:border-mist"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ok/10">
                  <Stethoscope className="size-[18px] text-ok" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {apt.type === "new" ? t.doctor.initialVisit : t.doctor.followUpVisit}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" strokeWidth={1.75} />
                    <span className="ltr-in-rtl font-mono">
                      {apt.completed_at?.slice(0, 10)} · {apt.completed_at?.slice(11, 16)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Doctor */}
              {doctor && (
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-xl border border-line text-[10px] font-semibold text-silver">
                    {getDoctorInitials(doctor)}
                  </span>
                  <div className="text-end">
                    <p className="text-sm text-foreground">{doctor.full_name}</p>
                    <p className="text-xs text-muted-foreground">
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
