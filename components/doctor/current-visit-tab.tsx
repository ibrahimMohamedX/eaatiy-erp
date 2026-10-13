"use client"

import { useState } from "react"
import type { Patient, Appointment, MedicalRecord } from "@/lib/types"
import { useT, resolveLabel } from "@/lib/i18n/use-t"

type Props = {
  patient: Patient
  appointment: Appointment
  existingRecord?: MedicalRecord
  onSaveDraft: (chiefComplaint: string, diagnosis: string, notes?: string) => void
  onCompleteConsultation: (chiefComplaint: string, diagnosis: string, notes?: string) => void
  isPending: boolean
}

export function CurrentVisitTab({
  patient,
  appointment,
  existingRecord,
  onSaveDraft,
  onCompleteConsultation,
  isPending,
}: Props) {
  const { t } = useT()
  const isCompleted = appointment.status === "completed"

  const [chiefComplaint, setChiefComplaint] = useState(
    existingRecord?.chief_complaint ?? "",
  )
  const [diagnosis, setDiagnosis] = useState(
    existingRecord?.diagnosis ?? "",
  )
  const [notes, setNotes] = useState(
    existingRecord?.notes ?? "",
  )

  return (
    <div className="relative">
      {/* Patient context banner */}
      <div className="flex items-center gap-4 px-5 pt-5">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {appointment.type === "new" ? t.doctor.newPatientLabel : t.doctor.followUpLabel} ·{" "}
            <span className="ltr-in-rtl font-mono">Queue #{appointment.queue_number}</span>
          </p>
        </div>
        {isCompleted && (
          <span className="rounded-full bg-ok/10 px-2.5 py-0.5 text-xs font-medium text-ok">
            {resolveLabel("status.completed", t)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5 p-5 pb-24">
        {/* Chief complaint */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="field-chief_complaint"
            className="text-[15px] font-medium text-silver"
          >
            {t.doctor.chiefComplaint}
          </label>
          <textarea
            id="field-chief_complaint"
            rows={2}
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            readOnly={isCompleted}
            placeholder={isCompleted ? t.doctor.noNotes : t.doctor.chiefComplaintPlaceholder}
            className={`w-full resize-y rounded-lg border border-line px-3.5 py-3 text-sm leading-relaxed text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none ${
              isCompleted ? "bg-steel/40" : "bg-card dark:bg-ink"
            }`}
          />
        </div>

        {/* Diagnosis */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="field-diagnosis"
            className="text-[15px] font-medium text-silver"
          >
            {t.doctor.diagnosis}
          </label>
          <textarea
            id="field-diagnosis"
            rows={4}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            readOnly={isCompleted}
            placeholder={isCompleted ? t.doctor.noNotes : t.doctor.diagnosisPlaceholder}
            className={`w-full resize-y rounded-lg border border-line px-3.5 py-3 text-sm leading-relaxed text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none ${
              isCompleted ? "bg-steel/40" : "bg-card dark:bg-ink"
            }`}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="field-notes"
            className="text-[15px] font-medium text-silver"
          >
            {t.doctor.doctorsNotes}
          </label>
          <textarea
            id="field-notes"
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            readOnly={isCompleted}
            placeholder={isCompleted ? t.doctor.noNotes : t.doctor.notesPlaceholder}
            className={`w-full resize-y rounded-lg border border-line px-3.5 py-3 text-sm leading-relaxed text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none ${
              isCompleted ? "bg-steel/40" : "bg-card dark:bg-ink"
            }`}
          />
        </div>
      </div>

      {/* Sticky footer */}
      {!isCompleted && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-b-2xl border-t border-line bg-card px-5 py-3.5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSaveDraft(chiefComplaint, diagnosis, notes || undefined)}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground disabled:opacity-50"
          >
            {t.doctor.saveDraft}
          </button>
          <button
            type="button"
            disabled={isPending || !chiefComplaint.trim() || !diagnosis.trim()}
            onClick={() => onCompleteConsultation(chiefComplaint, diagnosis, notes || undefined)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/85 hover:shadow-[0_0_24px_-6px_var(--arc)] active:translate-y-px disabled:opacity-50"
          >
            {t.doctor.completeConsultation}
          </button>
        </div>
      )}
    </div>
  )
}
