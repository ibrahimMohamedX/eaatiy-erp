"use client"

// ============================================================================
// Hook: useDoctorPolling — Round 2.4
// ============================================================================
// Polls the doctor's queue every 30s so newly-called patients appear
// without manual refresh.
// ============================================================================

import { useState, useEffect, useCallback, useRef } from "react"
import { getMyQueue } from "@/lib/actions/doctor/get-my-queue"
import type { DoctorQueueData } from "@/lib/actions/doctor/get-my-queue"

const POLL_INTERVAL_MS = 30_000 // 30 seconds

export function useDoctorPolling(initialData: DoctorQueueData | null) {
  const [data, setData] = useState<DoctorQueueData | null>(initialData)
  const mountedRef = useRef(true)

  const poll = useCallback(async () => {
    const result = await getMyQueue()
    if (result.success && mountedRef.current) {
      setData(result.data)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const timer = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      mountedRef.current = false
      clearInterval(timer)
    }
  }, [poll])

  /** Manual refresh immediately */
  const refresh = useCallback(async () => {
    const result = await getMyQueue()
    if (result.success) {
      setData(result.data)
    }
  }, [])

  return { data, refresh }
}