"use server"

// ============================================================================
// Server Action: registerPatient — Phase 2D
// ============================================================================
// Called from PatientRegistrationModal. Inserts a new patient row + audit log
// using user/tenant context from middleware-injected headers.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { createPatient } from "@/lib/db/repositories/patients"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { CreatePatientInput } from "@/lib/db/repositories/patients"
import type { Patient } from "@/lib/types"

export async function registerPatient(
  input: CreatePatientInput,
): Promise<{ success: true; data: Patient } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    const patient = await withAudit(pool, ctx.tenantId, ctx.userId, {
      action: "insert",
      targetTable: "patients",
      summary: `Registered new patient: ${input.full_name}`,
    }, async (client) => {
      const p = await createPatient(client, ctx.tenantId, input)
      return { rowId: p.id, ...p }
    })

    return { success: true, data: patient }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to register patient",
    }
  }
}