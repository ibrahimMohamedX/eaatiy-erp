"use server"

// ============================================================================
// Server Action: getTodayQueue — Phase 2D
// ============================================================================
// Fetches today's appointments + KPI counts + doctors + unpaid count.
// Context from middleware-injected headers. No hardcoded tenant slug.
// ============================================================================

import { getTenantPool, getIdentityPool } from "@/lib/db/connection"
import { getTodayQueue, getTodayCounts } from "@/lib/db/repositories/appointments"
import { countUnpaidBillings } from "@/lib/db/repositories/billings"
import { getDoctorsByTenant } from "@/lib/db/repositories/users"
import { listPatients } from "@/lib/db/repositories/patients"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Appointment, Patient, User } from "@/lib/types"

export interface TodayQueueData {
  appointments: Appointment[]
  counts: {
    waiting: number
    called: number
    inConsultation: number
    completedToday: number
    cancelledToday: number
    unpaidBills: number
  }
  doctors: User[]
  patients: Patient[]
}

export async function getTodayQueueData(): Promise<
  { success: true; data: TodayQueueData } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    const tenantPool = getTenantPool(ctx.tenantSlug)

    // Run all queries in parallel
    const [appointments, counts, unpaidBills, patients, doctors] = await Promise.all([
      getTodayQueue(tenantPool, ctx.tenantId),
      getTodayCounts(tenantPool, ctx.tenantId),
      countUnpaidBillings(tenantPool, ctx.tenantId),
      listPatients(tenantPool, ctx.tenantId),
      getDoctorsByTenant(getIdentityPool(), ctx.tenantId),
    ])

    return {
      success: true,
      data: {
        appointments,
        counts: {
          waiting: counts.waiting,
          called: counts.called,
          inConsultation: counts.inConsultation,
          completedToday: counts.completedToday,
          cancelledToday: counts.cancelledToday,
          unpaidBills,
        },
        doctors,
        patients,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch queue data",
    }
  }
}