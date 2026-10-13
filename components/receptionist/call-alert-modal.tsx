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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/60 pt-[15vh] backdrop-blur-sm">
      <div className="w-full max-w-md animate-archai-fade-up rounded-2xl border border-line bg-card shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-arc/10">
              <Volume2 className="size-4 text-arc" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t.common.notifications}
              </p>
              <p className="text-xs text-muted-foreground">
                {calledPatients.length === 1
                  ? "Patient has been called to consultation"
                  : `${calledPatients.length} patients called`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="flex size-8 items-center justify-center rounded-lg text-mist transition-colors duration-200 hover:bg-accent hover:text-foreground"
            aria-label={t.common.cancel}
          >
            <X className="size-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        {/* Called patient list */}
        <div className="flex flex-col gap-2 px-5 py-4">
          {calledPatients.map(({ appointment, patient }) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between rounded-xl border border-line bg-steel/40 px-4 py-3 dark:bg-ink/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-arc/60 font-mono text-xs font-bold text-arc">
                  {appointment.queue_number}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {patient?.full_name ?? appointment.patient_id}
                  </p>
                  <p className="text-xs text-mist">
                    {appointment.type === "new" ? t.receptionist.newPatient : t.receptionist.followUp}
                    {" · "}
                    <span className="font-mono ltr-in-rtl">
                      {formatTime(appointment.scheduled_start)}
                    </span>
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-arc/10 px-2.5 py-1 text-xs font-medium text-arc">
                <ArrowRightCircle className="size-3.5" strokeWidth={1.75} />
                {t.status.called}
              </span>
            </div>
          ))}
        </div>

        {/* Footer — dismiss action */}
        <div className="border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
          >
            {t.common.done}
          </button>
        </div>
      </div>
    </div>
  )
}
