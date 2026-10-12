"use server"

// ============================================================================
// Doctor Action: saveDraft — Phase 2E
// ============================================================================
// Upserts a medical record with is_draft: true. Does NOT change appointment
// status. Doctor can save progress incrementally before finalizing.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { upsertMedicalRecord } from "@/lib/db/repositories/medical-records"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { MedicalRecord } from "@/lib/types"

export interface SaveDraftInput {
  appointment_id: string
  patient_id: string
  chief_complaint: string
  diagnosis: string
  notes?: string
}

export async function saveDraft(
  input: SaveDraftInput,
): Promise<{ success: true; data: MedicalRecord } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate required fields
    if (!input.chief_complaint.trim()) {
      return { success: false, error: "Chief complaint is required." }
    }
    if (!input.diagnosis.trim()) {
      return { success: false, error: "Diagnosis is required." }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    const record = await withAudit(pool, ctx.tenantId, ctx.userId, {
      action: "update",
      targetTable: "medical_records",
      summary: `Saved draft for appointment ${input.appointment_id}`,
    }, async (client) => {
      const r = await upsertMedicalRecord(client, ctx.tenantId, {
        appointment_id: input.appointment_id,
        patient_id: input.patient_id,
        doctor_id: ctx.userId,
        chief_complaint: input.chief_complaint,
        diagnosis: input.diagnosis,
        notes: input.notes,
        is_draft: true,
      })
      return { rowId: r.id, ...r }
    })

    return { success: true, data: record }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save draft",
    }
  }
}