"use client"

import { useState, useTransition } from "react"
import { CurrentVisitTab } from "./current-visit-tab"
import { HistoryTab } from "./history-tab"
import { PrescriptionsTab } from "./prescriptions-tab"
import { BillingTab } from "./billing-tab"
import { PatientBanner } from "./patient-banner"
import { VitalsStrip } from "./vitals-strip"
import { saveDraft } from "@/lib/actions/doctor/save-draft"
import { completeConsultation } from "@/lib/actions/doctor/complete-consultation"
import type { Appointment, Patient, MedicalRecord, Billing, Prescription, User } from "@/lib/types"
import type { PatientData } from "@/lib/actions/doctor/get-patient-data"
import { useT } from "@/lib/i18n/use-t"

type TabKey = "current" | "history" | "prescriptions" | "billing"

type Props = {
  /** Full patient data from getPatientData server action, or null if no patient selected */
  patientData: PatientData | null
  /** Doctors list for resolving doctor names in history tab */
  doctors: User[]
  onMutated: () => void
}

export function Workspace({ patientData, doctors, onMutated }: Props) {
  const { t } = useT()
  const [activeTab, setActiveTab] = useState<TabKey>("current")
  const [isPending, startTransition] = useTransition()

  const TABS: { key: TabKey; label: string }[] = [
    { key: "current", label: t.doctor.tabs[0] },
    { key: "history", label: t.doctor.tabs[1] },
    { key: "prescriptions", label: t.doctor.tabs[2] },
    { key: "billing", label: t.doctor.tabs[3] },
  ]

  if (!patientData) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#F9FAFB] dark:bg-[#111827]">
        <div className="text-center">
          <p className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
            {t.doctor.noActivePatient}
          </p>
          <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            {t.doctor.noActivePatientDesc}
          </p>
        </div>
      </div>
    )
  }

  const { patient, appointment, medicalRecord, billing, prescription, history } = patientData

  function handleSaveDraft(chiefComplaint: string, diagnosis: string, notes?: string) {
    startTransition(async () => {
      const result = await saveDraft({
        appointment_id: appointment.id,
        patient_id: patient.id,
        chief_complaint: chiefComplaint,
        diagnosis,
        notes,
      })
      if (result.success) {
        onMutated()
      }
    })
  }

  function handleCompleteConsultation(chiefComplaint: string, diagnosis: string, notes?: string) {
    startTransition(async () => {
      const result = await completeConsultation({
        appointment_id: appointment.id,
        patient_id: patient.id,
        chief_complaint: chiefComplaint,
        diagnosis,
        notes,
      })
      if (result.success) {
        onMutated()
      }
    })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      {/* Sticky patient banner */}
      <PatientBanner patient={patient} appointment={appointment} />

      {/* Vitals summary strip */}
      <VitalsStrip vitals={medicalRecord?.vitals} />

      {/* Tabbed content region */}
      <div className="flex flex-1 flex-col px-6 pb-6">
        <div className="flex flex-1 flex-col rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
          {/* Tab bar */}
          <div className="shrink-0 border-b border-[#E5E7EB] px-3 dark:border-[#374151]">
            <div className="flex items-center gap-1">
              {TABS.map((tab) => {
                const active = tab.key === activeTab
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative px-4 py-3 text-sm transition-colors ${
                      active
                        ? "font-medium text-[#111827] dark:text-[#F9FAFB]"
                        : "font-normal text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
                    }`}
                  >
                    {tab.label}
                    {active && (
                      <span className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-[#0F766E]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active tab panel */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "current" && (
              <CurrentVisitTab
                patient={patient}
                appointment={appointment}
                existingRecord={medicalRecord ?? undefined}
                onSaveDraft={handleSaveDraft}
                onCompleteConsultation={handleCompleteConsultation}
                isPending={isPending}
              />
            )}
            {activeTab === "history" && (
              <HistoryTab
                patient={patient}
                history={history}
                doctors={doctors}
              />
            )}
            {activeTab === "prescriptions" && (
              <PrescriptionsTab
                patient={patient}
                medicalRecord={medicalRecord ?? undefined}
                onMutated={onMutated}
              />
            )}
            {activeTab === "billing" && (
              <BillingTab
                billing={billing ?? undefined}
                appointment={appointment}
                onMutated={onMutated}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}