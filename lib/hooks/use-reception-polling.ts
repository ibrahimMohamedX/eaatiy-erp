"use client"

// ============================================================================
// Hook: useReceptionPolling — Round 2.2
// ============================================================================
// Polls the reception queue every 15s and detects newly-called patients.
// Returns: the latest TodayQueueData, a list of newly-called patients
// (since last poll), and a dismiss callback to acknowledge them.
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react"
import { getTodayQueueData } from "@/lib/actions/receptionist/get-today-queue"
import type { TodayQueueData } from "@/lib/actions/receptionist/get-today-queue"
import type { CalledPatient } from "@/components/receptionist/call-alert-modal"

const POLL_INTERVAL_MS = 15_000 // 15 seconds

export function useReceptionPolling(initialData: TodayQueueData | null) {
  const [data, setData] = useState<TodayQueueData | null>(initialData)
  const [alertQueue, setAlertQueue] = useState<CalledPatient[]>([])
  const calledIds = useRef<Set<string>>(new Set())
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Seed called-ids from initial data to avoid re-notifying on mount
    if (initialData && isInitialMount.current) {
      isInitialMount.current = false
      for (const apt of initialData.appointments) {
        if (apt.status === "called") {
          calledIds.current.add(apt.id)
        }
      }
    }
  }, [initialData])

  const poll = useCallback(async () => {
    const result = await getTodayQueueData()
    if (!result.success) return

    const newData = result.data
    setData(newData)

    // Detect newly-called patients (called since last poll)
    const freshCalled: CalledPatient[] = []
    const patientMap = new Map(newData.patients.map((p) => [p.id, p]))

    for (const apt of newData.appointments) {
      if (apt.status === "called" && !calledIds.current.has(apt.id)) {
        calledIds.current.add(apt.id)
        freshCalled.push({
          appointment: apt,
          patient: patientMap.get(apt.patient_id),
        })
      }
    }

    // Remove from tracking if appointment is no longer called
    // (transitioned to in_consultation or cancelled)
    const currentCalledIds = new Set(
      newData.appointments.filter((a) => a.status === "called").map((a) => a.id),
    )
    for (const id of calledIds.current) {
      if (!currentCalledIds.has(id)) {
        calledIds.current.delete(id)
      }
    }

    if (freshCalled.length > 0) {
      setAlertQueue((prev) => [...prev, ...freshCalled])
    }
  }, [])

  // Set up polling interval — initial data comes from SSR, so the first
  // poll fires after POLL_INTERVAL_MS, not immediately
  useEffect(() => {
    const timer = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [poll])

  /** Dismiss the alert modal — clears the alert queue */
  const dismissAlerts = useCallback(() => {
    setAlertQueue([])
  }, [])

  return { data, alertQueue, dismissAlerts, refresh: poll }
}