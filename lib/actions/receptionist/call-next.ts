"use server"

// ============================================================================
// Server Action: callNext — Phase 2D
// ============================================================================
// Transitions a "waiting" appointment to "called".
// The doctor must then click "Start Consultation" to move to "in_consultation".
// Context from middleware-injected headers.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { transitionAppointmentStatus } from "@/lib/db/repositories/appointments"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Appointment } from "@/lib/types"

export async function callNext(
  appointmentId: string,
): Promise<{ success: true; data: Appointment } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    const appointment = await withAudit(pool, ctx.tenantId, ctx.userId, {
      action: "update",
      targetTable: "appointments",
      summary: `Called next patient: appointment ${appointmentId} → called`,
    }, async (client) => {
      const apt = await transitionAppointmentStatus(
        client,
        ctx.tenantId,
        appointmentId,
        "called",
      )
      if (!apt) throw new Error("Appointment not found")
      return { rowId: apt.id, ...apt }
    })

    return { success: true, data: appointment }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to call next patient",
    }
  }
}