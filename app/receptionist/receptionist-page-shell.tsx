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
import { CallAlertModal } from "@/components/receptionist/call-alert-modal"
import { useT } from "@/lib/i18n/use-t"
import { useReceptionPolling } from "@/lib/hooks/use-reception-polling"
import type { TodayQueueData } from "@/lib/actions/receptionist/get-today-queue"

type Props = {
  initialData: TodayQueueData | null
}

export function ReceptionistPageShell({ initialData }: Props) {
  const { t } = useT()
  const [showRegistration, setShowRegistration] = useState(false)
  const [showAppointment, setShowAppointment] = useState(false)
  const [activeView, setActiveView] = useState<ReceptionistView>("sidebar.receptionist.dashboard")

  // Polling hook — uses SSR initial data for instant render, then polls every 15s
  const { data, alertQueue, dismissAlerts, refresh } = useReceptionPolling(initialData)

  const counts = data?.counts

  function renderContent() {
    switch (activeView) {
      case "sidebar.receptionist.dashboard":
        return (
          <>
            {/* Greeting hero */}
            <section className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-line bg-card px-6 py-5">
              <div className="archai-node-grid pointer-events-none absolute inset-0 opacity-30" />
              <div className="relative">
                <p className="archai-eyebrow">RECEPTION / OVERVIEW</p>
                <p className="mt-2 font-display text-xl font-bold text-foreground">
                  {t.receptionist.greeting}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.receptionist.liveQueue}: {counts?.waiting ?? 0} {t.receptionist.waiting}, {counts?.inConsultation ?? 0} {t.receptionist.inConsultation}. {counts?.unpaidBills ?? 0} {t.receptionist.unpaidBills}.
                </p>
              </div>
            </section>
            <KpiRow counts={counts ?? null} />
            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[65%_35%]">
              <LiveQueuePanel
                appointments={data?.appointments ?? []}
                patients={data?.patients ?? []}
                doctors={data?.doctors ?? []}
                                onMutated={refresh}
              />
              <div className="flex min-w-0 flex-col gap-6">
                <PatientSearchCard />
                <VitalsIntakeCard />
              </div>
            </section>
          </>
        )
      case "sidebar.receptionist.patients":
        return (
          <section className="flex flex-col gap-6">
            <PatientSearchCard />
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar
          onNewAppointment={() => setShowAppointment(true)}
          onRegisterPatient={() => setShowRegistration(true)}
          recentCalls={alertQueue}
          notificationCount={alertQueue.length}
        />

        <main className="relative flex-1 overflow-y-auto p-6">
          {/* subtle node-grid depth */}
          <div className="archai-node-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative">{renderContent()}</div>
        </main>
      </div>

      {/* Modals */}
      <PatientRegistrationModal
        open={showRegistration}
        onClose={() => setShowRegistration(false)}
                onRegistered={refresh}
      />
      <AppointmentModal
        open={showAppointment}
        onClose={() => setShowAppointment(false)}
                onBooked={refresh}
        doctors={data?.doctors ?? []}
      />

      {/* Call-alert notification modal */}
      <CallAlertModal
        calledPatients={alertQueue}
        onDismiss={dismissAlerts}
      />
    </div>
  )
}