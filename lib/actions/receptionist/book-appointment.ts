"use server"

// ============================================================================
// Server Action: bookAppointment — Phase 2D
// ============================================================================
// Called from AppointmentModal. Creates appointment + billing stub.
// Context from middleware-injected headers.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { createAppointment } from "@/lib/db/repositories/appointments"
import { createBilling } from "@/lib/db/repositories/billings"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { CreateAppointmentInput } from "@/lib/db/repositories/appointments"
import type { Appointment } from "@/lib/types"

const BILLING_RATE = 150.00 // default consultation fee

export async function bookAppointment(
  input: CreateAppointmentInput,
): Promise<{ success: true; data: Appointment } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    const appointment = await withAudit(pool, ctx.tenantId, ctx.userId, {
      action: "insert",
      targetTable: "appointments",
      summary: `Booked appointment for patient ${input.patient_id}`,
    }, async (client) => {
      const apt = await createAppointment(client, ctx.tenantId, input)

      // Create corresponding billing record
      await createBilling(client, ctx.tenantId, {
        appointment_id: apt.id,
        total_amount: BILLING_RATE,
      })

      return { rowId: apt.id, ...apt }
    })

    return { success: true, data: appointment }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to book appointment",
    }
  }
}