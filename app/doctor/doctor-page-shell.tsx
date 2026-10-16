"use client"

import { useState, useTransition } from "react"
import { DoctorSidebar } from "@/components/doctor/sidebar"
import type { DoctorView } from "@/components/doctor/sidebar"
import { QueueRail } from "@/components/doctor/queue-rail"
import { Workspace } from "@/components/doctor/workspace"
import { getPatientData } from "@/lib/actions/doctor/get-patient-data"
import type { PatientData } from "@/lib/actions/doctor/get-patient-data"
import type { Appointment, Patient, User } from "@/lib/types"
import { useT } from "@/lib/i18n/use-t"
import { useDoctorPolling } from "@/lib/hooks/use-doctor-polling"
import type { DoctorQueueData } from "@/lib/actions/doctor/get-my-queue"
import { callNext } from "@/lib/actions/receptionist/call-next"
import { callAgain } from "@/lib/actions/receptionist/call-again"
import { startConsultation } from "@/lib/actions/doctor/start-consultation"

type Props = {
  /** Initial queue data fetched by the server component */
  initialData: DoctorQueueData
}

export function DoctorPageShell({ initialData }: Props) {
  const { t } = useT()
  const [activeView, setActiveView] = useState<DoctorView>("sidebar.doctor.myQueue")

  // Auto-polling every 30s to detect newly-called patients
  const { data: queueData, refresh: refreshQueue } = useDoctorPolling(initialData)

  const appointments = queueData?.appointments ?? initialData.appointments
  const patients = queueData?.patients ?? initialData.patients
  const doctors = queueData?.doctors ?? initialData.doctors
  const serverNow = queueData?.serverNow ?? initialData.serverNow

  // Queue + patient selection state
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isLoadingPatient, startLoadingPatient] = useTransition()

  function handleSelectPatient(appointmentId: string) {
    setSelectedAppointmentId(appointmentId)
    setDataError(null)
    startLoadingPatient(async () => {
      const result = await getPatientData(appointmentId)
      if (result.success) {
        setPatientData(result.data)
      } else {
        setPatientData(null)
        setDataError(result.error)
      }
    })
  }

  function handleCallNext(appointmentId: string) {
    setDataError(null)
    startLoadingPatient(async () => {
      try {
        const result = await callNext(appointmentId)
        if (result.success) {
          refreshQueue()
        } else {
          setDataError(result.error)
        }
      } catch (err) {
        setDataError(err instanceof Error ? err.message : "Failed to call next patient")
      }
    })
  }

  function handleCallAgain(appointmentId: string) {
    setDataError(null)
    startLoadingPatient(async () => {
      try {
        const result = await callAgain(appointmentId)
        if (result.success) {
          refreshQueue()
        } else {
          setDataError(result.error)
        }
      } catch (err) {
        setDataError(err instanceof Error ? err.message : "Failed to call again")
      }
    })
  }

  function handleStartConsultation(appointmentId: string) {
    setSelectedAppointmentId(appointmentId)
    startLoadingPatient(async () => {
      const result = await startConsultation(appointmentId)
      if (result.success) {
        refreshQueue()
        // Also load the patient data into the workspace
        const patientResult = await getPatientData(appointmentId)
        if (patientResult.success) {
          setPatientData(patientResult.data)
        } else {
          setPatientData(null)
          setDataError(patientResult.error)
        }
      }
    })
  }

  function handleMutated() {
    // Re-fetch patient data to reflect changes (draft saved, consultation completed, etc.)
    if (!selectedAppointmentId) return
    setDataError(null)
    startLoadingPatient(async () => {
      const result = await getPatientData(selectedAppointmentId)
      if (result.success) {
        setPatientData(result.data)
      } else {
        setDataError(result.error)
      }
    })
  }

  function renderContent() {
    switch (activeView) {
      case "sidebar.doctor.myQueue":
        return (
          <>
            {/* Left rail — 28%, independently scrollable */}
            <section className="h-full w-[28%] shrink-0 overflow-hidden bg-card">
              <QueueRail
                appointments={appointments}
                patients={patients}
                doctors={doctors}
                serverNow={serverNow}
                selectedId={selectedAppointmentId}
                onSelect={handleSelectPatient}
                onCallNext={handleCallNext}
                onCallAgain={handleCallAgain}
                onStartConsultation={handleStartConsultation}
              />
            </section>

            {/* Thin vertical divider */}
            <div className="h-full w-px shrink-0 bg-line" aria-hidden="true" />

            {/* Right workspace — 72% */}
            <section className="h-full min-w-0 flex-1">
              {/* Data error banner */}
              {dataError && (
                <div className="mx-4 mt-4 flex items-center gap-2.5 rounded-lg bg-err/10 px-4 py-3 text-sm font-medium text-err">
                  <span className="size-2 shrink-0 rounded-full bg-err" />
                  {dataError}
                </div>
              )}
              <Workspace
                patientData={patientData}
                doctors={doctors}
                onMutated={handleMutated}
              />
            </section>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DoctorSidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Split-screen: left rail + right workspace */}
      <main className="flex flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  )
}
