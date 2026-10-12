"use server"

// ============================================================================
// Server Action: cancelAppointment — Phase 2D
// ============================================================================
// Context from middleware-injected headers.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { transitionAppointmentStatus } from "@/lib/db/repositories/appointments"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Appointment } from "@/lib/types"

export async function cancelAppointment(
  appointmentId: string,
  reason?: string,
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
      summary: `Cancelled appointment ${appointmentId} — ${reason ?? "No reason given"}`,
    }, async (client) => {
      const apt = await transitionAppointmentStatus(
        client,
        ctx.tenantId,
        appointmentId,
        "cancelled",
        { cancellation_reason: reason },
      )
      if (!apt) throw new Error("Appointment not found")
      return { rowId: apt.id, ...apt }
    })

    return { success: true, data: appointment }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to cancel appointment",
    }
  }
}