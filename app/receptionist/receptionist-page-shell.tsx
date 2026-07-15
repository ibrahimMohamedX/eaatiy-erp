"use client"

import { useState } from "react"
import { Sidebar } from "@/components/receptionist/sidebar"
import type { ReceptionistView } from "@/components/receptionist/sidebar"
import { TopBar } from "@/components/receptionist/top-bar"
import { KpiRow } from "@/components/receptionist/kpi-row"
import { LiveQueuePanel } from "@/components/receptionist/live-queue-panel"
import { PatientSearchCard } from "@/components/receptionist/patient-search-card"
import { VitalsIntakeCard } from "@/components/receptionist/vitals-intake-card"
import { PatientRegistrationModal } from "@/components/receptionist/patient-registration-modal"
import { AppointmentModal } from "@/components/receptionist/appointment-modal"
import { getTodayAppointments } from "@/lib/mock-data"
import { FileText, ClipboardList, CreditCard, Settings, ShieldCheck } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"

export function ReceptionistPageShell() {
  const { t } = useT()
  const [showRegistration, setShowRegistration] = useState(false)
  const [showAppointment, setShowAppointment] = useState(false)
  const [activeView, setActiveView] = useState<ReceptionistView>("sidebar.receptionist.dashboard")

  const todayApps = getTodayAppointments()
  const waitingCount = todayApps.filter((a) => a.status === "waiting").length
  const inConsultCount = todayApps.filter(
    (a) => a.status === "in_consultation",
  ).length
  const unpaidCount = 3 // from mock billings

  function renderContent() {
    switch (activeView) {
      case "sidebar.receptionist.dashboard":
        return (
          <>
            {/* Greeting hero */}
            <section className="flex flex-col justify-center rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-5 dark:border-[#374151] dark:bg-[#1F2937]">
              <p className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">
                {t.receptionist.greeting}
              </p>
              <p className="mt-1 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                {t.receptionist.liveQueue}: {waitingCount} {t.receptionist.waiting}, {inConsultCount} {t.receptionist.inConsultation}. {unpaidCount} {t.receptionist.unpaidBills}.
              </p>
            </section>
            <KpiRow />
            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[65%_35%]">
              <LiveQueuePanel />
              <div className="flex min-w-0 flex-col gap-6">
                <PatientSearchCard />
                <VitalsIntakeCard />
              </div>
            </section>
          </>
        )
      case "sidebar.receptionist.liveActivity":
        return (
          <section className="flex flex-col gap-6">
            <LiveQueuePanel />
            <KpiRow />
          </section>
        )
      case "sidebar.receptionist.patients":
        return (
          <section className="flex flex-col gap-6">
            <PatientSearchCard />
          </section>
        )
      case "sidebar.receptionist.appointments":
        return (
          <section className="flex flex-col gap-6">
            <LiveQueuePanel />
          </section>
        )
      case "sidebar.receptionist.triageVitals":
        return (
          <section className="flex flex-col gap-6">
            <VitalsIntakeCard />
          </section>
        )
      case "sidebar.receptionist.billing":
        return (
          <section className="flex flex-col items-center justify-center py-20 text-center">
            <CreditCard className="h-12 w-12 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">{t.sidebar.receptionist.billing}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.common.loading}</p>
          </section>
        )
      case "sidebar.receptionist.preferences":
        return (
          <section className="flex flex-col items-center justify-center py-20 text-center">
            <Settings className="h-12 w-12 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">{t.sidebar.receptionist.preferences}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.common.loading}</p>
          </section>
        )
      case "sidebar.receptionist.accessSecurity":
        return (
          <section className="flex flex-col items-center justify-center py-20 text-center">
            <ShieldCheck className="h-12 w-12 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">{t.sidebar.receptionist.accessSecurity}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.common.loading}</p>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-[#111827]">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
            onNewAppointment={() => setShowAppointment(true)}
            onRegisterPatient={() => setShowRegistration(true)}
          />

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
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