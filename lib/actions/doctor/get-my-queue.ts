"use server"

// ============================================================================
// Doctor Action: getMyQueue — Phase 2E
// ============================================================================
// Returns today's appointments + associated patients + doctors for the
// authenticated doctor. Context from middleware-injected JWT headers.
// ============================================================================

import { getTenantPool, getIdentityPool } from "@/lib/db/connection"
import { getTodayQueue } from "@/lib/db/repositories/appointments"
import { getPatientById } from "@/lib/db/repositories/patients"
import { getDoctorsByTenant } from "@/lib/db/repositories/users"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Appointment, Patient, User } from "@/lib/types"

export interface DoctorQueueData {
  appointments: Appointment[]
  patients: Patient[]
  doctors: User[]
  /** Server timestamp used as the reference for `deriveAge` to prevent SSR hydration mismatches */
  serverNow: string
}

export async function getMyQueue(): Promise<
  { success: true; data: DoctorQueueData } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    const tenantPool = getTenantPool(ctx.tenantSlug)
    const identityPool = getIdentityPool()

    // Fetch appointments for this doctor today
    const appointments = await getTodayQueue(tenantPool, ctx.tenantId, ctx.userId)

    // Resolve unique patient IDs and fetch their records
    const patientIds = [...new Set(appointments.map((a) => a.patient_id))]
    const patients = (
      await Promise.all(
        patientIds.map((pid) => getPatientById(tenantPool, ctx.tenantId, pid)),
      )
    ).filter((p): p is Patient => p !== null)

    // Fetch doctors from Identity DB for the tenant
    const doctors = await getDoctorsByTenant(identityPool, ctx.tenantId)

    return { success: true, data: { appointments, patients, doctors, serverNow: new Date().toISOString() } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch queue",
    }
  }
}