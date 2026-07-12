"use client"

import { useState } from "react"
import { Sidebar } from "@/components/receptionist/sidebar"
import { TopBar } from "@/components/receptionist/top-bar"
import { KpiRow } from "@/components/receptionist/kpi-row"
import { LiveQueuePanel } from "@/components/receptionist/live-queue-panel"
import { PatientSearchCard } from "@/components/receptionist/patient-search-card"
import { VitalsIntakeCard } from "@/components/receptionist/vitals-intake-card"
import { PatientRegistrationModal } from "@/components/receptionist/patient-registration-modal"
import { AppointmentModal } from "@/components/receptionist/appointment-modal"
import { getTodayAppointments } from "@/lib/mock-data"

export function ReceptionistPageShell() {
  const [showRegistration, setShowRegistration] = useState(false)
  const [showAppointment, setShowAppointment] = useState(false)

  const todayApps = getTodayAppointments()
  const waitingCount = todayApps.filter((a) => a.status === "waiting").length
  const inConsultCount = todayApps.filter(
    (a) => a.status === "in_consultation",
  ).length
  const unpaidCount = 3 // from mock billings

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
            onNewAppointment={() => setShowAppointment(true)}
            onRegisterPatient={() => setShowRegistration(true)}
          />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Greeting hero region — live counts from mock data */}
          <section className="flex flex-col justify-center rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-5">
            <p className="text-lg font-semibold text-[#111827]">
              Good morning, Helena
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              You have {waitingCount} patients waiting and {inConsultCount} in
              consultation. {unpaidCount} bills remain unpaid today.
            </p>
          </section>

          {/* 5-column KPI card row — live data */}
          <KpiRow />

          {/* Two-column split */}
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[65%_35%]">
            <LiveQueuePanel />

            <div className="flex min-w-0 flex-col gap-6">
              <PatientSearchCard />
              <VitalsIntakeCard />
            </div>
          </section>
        </main>
      </div>

      {/* Modals */}
      <PatientRegistrationModal
        open={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
      <AppointmentModal
        open={showAppointment}
        onClose={() => setShowAppointment(false)}
      />
    </div>
  )
}