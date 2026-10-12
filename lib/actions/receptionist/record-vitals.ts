"use server"

// ============================================================================
// Server Action: recordVitals — Phase 2D
// ============================================================================
// Context from middleware-injected headers.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import {
  upsertMedicalRecord,
  getMedicalRecordByAppointment,
} from "@/lib/db/repositories/medical-records"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Vitals } from "@/lib/types"

export async function recordVitals(
  appointmentId: string,
  patientId: string,
  doctorId: string,
  vitals: Vitals,
): Promise<{ success: true; data: { recorded: boolean } } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    await withAudit(pool, ctx.tenantId, ctx.userId, {
      action: "update",
      targetTable: "medical_records",
      summary: `Recorded vitals for appointment ${appointmentId}`,
    }, async (client) => {
      const existing = await getMedicalRecordByAppointment(client, ctx.tenantId, appointmentId)
      const record = await upsertMedicalRecord(client, ctx.tenantId, {
        appointment_id: appointmentId,
        patient_id: patientId,
        doctor_id: doctorId,
        chief_complaint: existing?.chief_complaint ?? "(pending)",
        diagnosis: existing?.diagnosis ?? "(pending)",
        notes: existing?.notes ?? undefined,
        vitals,
        is_draft: true,
      })
      return { rowId: record.id, recorded: true }
    })

    return { success: true, data: { recorded: true } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record vitals",
    }
  }
}