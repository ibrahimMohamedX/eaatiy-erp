"use server"

// ============================================================================
// Doctor Action: completeConsultation — Phase 2E
// ============================================================================
// Finalizes a consultation in a single transactional step:
//   1. Finalize medical record (set is_draft: false)
//   2. Transition appointment status to "completed"
//   3. Create billing row (if not already exists)
// All wrapped in withAudit for audit trail integrity.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { upsertMedicalRecord } from "@/lib/db/repositories/medical-records"
import { transitionAppointmentStatus } from "@/lib/db/repositories/appointments"
import { createBilling, getBillingByAppointment } from "@/lib/db/repositories/billings"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { MedicalRecord } from "@/lib/types"

const BILLING_RATE = 150.00

export interface CompleteConsultationInput {
  appointment_id: string
  patient_id: string
  chief_complaint: string
  diagnosis: string
  notes?: string
}

export interface CompleteConsultationResult {
  medicalRecord: MedicalRecord
}

export async function completeConsultation(
  input: CompleteConsultationInput,
): Promise<
  { success: true; data: CompleteConsultationResult } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate
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
      summary: `Completed consultation for appointment ${input.appointment_id}`,
    }, async (client) => {
      // 1. Finalize medical record (upsert as non-draft)
      const mr = await upsertMedicalRecord(client, ctx.tenantId, {
        appointment_id: input.appointment_id,
        patient_id: input.patient_id,
        doctor_id: ctx.userId,
        chief_complaint: input.chief_complaint,
        diagnosis: input.diagnosis,
        notes: input.notes,
        is_draft: false,
      })

      // 2. Transition appointment to completed
      await transitionAppointmentStatus(
        client,
        ctx.tenantId,
        input.appointment_id,
        "completed",
      )

      // 3. Create billing row if none exists
      const existingBilling = await getBillingByAppointment(
        client,
        ctx.tenantId,
        input.appointment_id,
      )
      if (!existingBilling) {
        await createBilling(client, ctx.tenantId, {
          appointment_id: input.appointment_id,
          total_amount: BILLING_RATE,
        })
      }

      return { rowId: mr.id, medicalRecord: mr }
    })

    return { success: true, data: { medicalRecord: record.medicalRecord } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to complete consultation",
    }
  }
}