"use client"

import { Volume2, X, ArrowRightCircle } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import type { Appointment, Patient } from "@/lib/types"
import { formatTime } from "@/lib/format-time"

export interface CalledPatient {
  appointment: Appointment
  patient: Patient | undefined
}

type Props = {
  /** Called patients to display in the notification modal */
  calledPatients: CalledPatient[]
  /** Dismiss the entire modal */
  onDismiss: () => void
}

/**
 * Persistent Call-Alert Modal — shown to receptionist when patients are in CALLED state.
 * Remains visible until explicitly dismissed, ensuring the receptionist doesn't miss
 * that a patient has been called.
 */
export function CallAlertModal({ calledPatients, onDismiss }: Props) {
  const { t } = useT()

  if (calledPatients.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[15vh] backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[16px] border border-[#E5E7EB] bg-white shadow-xl dark:border-[#374151] dark:bg-[#1F2937]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 dark:border-[#374151]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9333EA]/[0.12]">
              <Volume2 className="h-4 w-4 text-[#9333EA]" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
                {t.common.notifications}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {calledPatients.length === 1
                  ? "Patient has been called to consultation"
                  : `${calledPatients.length} patients called`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] dark:hover:bg-[#374151] dark:hover:text-[#F9FAFB]"
            aria-label={t.common.cancel}
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Called patient list */}
        <div className="flex flex-col gap-2 px-5 py-4">
          {calledPatients.map(({ appointment, patient }) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 dark:border-[#374151] dark:bg-[#111827]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0F766E] text-xs font-bold text-[#0F766E]">
                  {appointment.queue_number}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
                    {patient?.full_name ?? appointment.patient_id}
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    {appointment.type === "new" ? t.receptionist.newPatient : t.receptionist.followUp}
                    {" · "}
                    {formatTime(appointment.scheduled_start)}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#9333EA]/[0.10] px-2.5 py-1 text-xs font-medium text-[#9333EA]">
                <ArrowRightCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                {t.status.called}
              </span>
            </div>
          ))}
        </div>

        {/* Footer — dismiss action */}
        <div className="border-t border-[#E5E7EB] px-5 py-3 dark:border-[#374151]">
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:bg-[#374151] dark:hover:text-[#F9FAFB]"
          >
            {t.common.done}
          </button>
        </div>
      </div>
    </div>
  )
}