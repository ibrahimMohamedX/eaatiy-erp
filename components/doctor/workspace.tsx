"use client"

import { useState } from "react"
import { CurrentVisitTab } from "./current-visit-tab"
import { HistoryTab } from "./history-tab"
import { PrescriptionsTab } from "./prescriptions-tab"
import { BillingTab } from "./billing-tab"
import { PatientBanner } from "./patient-banner"
import { VitalsStrip } from "./vitals-strip"
import {
  getPatient,
  getTodayAppointments,
  getMedicalRecordForAppointment,
} from "@/lib/mock-data"
import type { Appointment, Patient, MedicalRecord } from "@/lib/types"

type TabKey = "current" | "history" | "prescriptions" | "billing"

const TABS: { key: TabKey; label: string }[] = [
  { key: "current", label: "Current Visit" },
  { key: "history", label: "History" },
  { key: "prescriptions", label: "Prescriptions" },
  { key: "billing", label: "Billing" },
]

const DOCTOR_ID = "u_doctor_01"

/**
 * Doctor Workspace — right split-screen with patient banner, vitals strip,
 * and tabbed clinical interface. The selected patient drives all tab content.
 */
export function Workspace() {
  const [activeTab, setActiveTab] = useState<TabKey>("current")

  // Pick the first in-consultation or waiting patient for Dr. Reyes
  const appointments = getTodayAppointments(DOCTOR_ID)
  const activeAppointment = appointments.find(
    (a) => a.status === "in_consultation" || a.status === "waiting",
  )

  const patient: Patient | undefined = activeAppointment
    ? getPatient(activeAppointment.patient_id)
    : undefined

  const medicalRecord: MedicalRecord | undefined =
    activeAppointment && activeAppointment.status === "completed"
      ? getMedicalRecordForAppointment(activeAppointment.id)
      : undefined

  if (!patient || !activeAppointment) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <p className="text-sm font-semibold text-[#6B7280]">
            No active patient selected
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Select a patient from the queue to begin
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      {/* Sticky patient banner */}
      <PatientBanner patient={patient} appointment={activeAppointment} />

      {/* Vitals summary strip */}
      <VitalsStrip vitals={medicalRecord?.vitals} />

      {/* Tabbed content region */}
      <div className="flex flex-1 flex-col px-6 pb-6">
        <div className="flex flex-1 flex-col rounded-[12px] border border-[#E5E7EB] bg-white">
          {/* Tab bar */}
          <div className="shrink-0 border-b border-[#E5E7EB] px-3">
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
                        ? "font-medium text-[#111827]"
                        : "font-normal text-[#6B7280] hover:text-[#111827]"
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
                appointment={activeAppointment}
                existingRecord={medicalRecord}
              />
            )}
            {activeTab === "history" && <HistoryTab patient={patient} />}
            {activeTab === "prescriptions" && <PrescriptionsTab />}
            {activeTab === "billing" && <BillingTab appointment={activeAppointment} />}
          </div>
        </div>
      </div>
    </div>
  )
}