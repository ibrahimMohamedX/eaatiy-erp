"use server"

// ============================================================================
// Doctor Action: createPrescription — Phase 2E
// ============================================================================
// Creates a prescription row for a medical record. Doctor must be the one who
// owns the medical record (enforced by ctx.userId matching doctor_id).
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { createPrescription as createPrescriptionRepo } from "@/lib/db/repositories/prescriptions"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Prescription, PrescriptionItem } from "@/lib/types"

export interface CreatePrescriptionInput {
  medical_record_id: string
  patient_id: string
  items: PrescriptionItem[]
}

export async function createPrescription(
  input: CreatePrescriptionInput,
): Promise<{ success: true; data: Prescription } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    if (!input.items || input.items.length === 0) {
      return { success: false, error: "At least one medicine must be prescribed." }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    const prescription = await withAudit(pool, ctx.tenantId, ctx.userId, {
      action: "insert",
      targetTable: "prescriptions",
      summary: `Created prescription for patient ${input.patient_id} (${input.items.length} items)`,
    }, async (client) => {
      const p = await createPrescriptionRepo(client, ctx.tenantId, {
        medical_record_id: input.medical_record_id,
        patient_id: input.patient_id,
        doctor_id: ctx.userId,
        items: input.items,
      })
      return { rowId: p.id, ...p }
    })

    return { success: true, data: prescription }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create prescription",
    }
  }
}