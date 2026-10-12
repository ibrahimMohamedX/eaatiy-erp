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
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {appointment.type === "new" ? t.doctor.newPatientLabel : t.doctor.followUpLabel} · Queue #
            {appointment.queue_number}
          </p>
        </div>
        {isCompleted && (
          <span className="rounded-full bg-[#059669]/[0.12] px-2.5 py-0.5 text-xs font-medium text-[#059669]">
            {resolveLabel("status.completed", t)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5 p-5 pb-24">
        {/* Chief complaint */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="field-chief_complaint"
            className="text-[13px] font-medium text-[#111827] dark:text-[#F9FAFB]"
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
            className={`w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm leading-relaxed text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:placeholder:text-[#9CA3AF] ${
              isCompleted ? "bg-[#F9FAFB] dark:bg-[#111827]" : ""
            }`}
          />
        </div>

        {/* Diagnosis */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="field-diagnosis"
            className="text-[13px] font-medium text-[#111827] dark:text-[#F9FAFB]"
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
            className={`w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm leading-relaxed text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:placeholder:text-[#9CA3AF] ${
              isCompleted ? "bg-[#F9FAFB] dark:bg-[#111827]" : ""
            }`}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="field-notes"
            className="text-[13px] font-medium text-[#111827] dark:text-[#F9FAFB]"
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
            className={`w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm leading-relaxed text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:placeholder:text-[#9CA3AF] ${
              isCompleted ? "bg-[#F9FAFB] dark:bg-[#111827]" : ""
            }`}
          />
        </div>
      </div>

      {/* Sticky footer */}
      {!isCompleted && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#E5E7EB] bg-white px-5 py-3.5 rounded-b-[12px] dark:border-[#374151] dark:bg-[#1F2937]">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSaveDraft(chiefComplaint, diagnosis, notes || undefined)}
            className="rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:opacity-50 dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
          >
            {t.doctor.saveDraft}
          </button>
          <button
            type="button"
            disabled={isPending || !chiefComplaint.trim() || !diagnosis.trim()}
            onClick={() => onCompleteConsultation(chiefComplaint, diagnosis, notes || undefined)}
            className="rounded-[8px] bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t.doctor.completeConsultation}
          </button>
        </div>
      )}
    </div>
  )
}