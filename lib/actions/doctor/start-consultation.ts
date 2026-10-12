"use server"

// ============================================================================
// Doctor Action: startConsultation — Phase 2E / Round 1.6
// ============================================================================
// Transitions a "called" appointment to "in_consultation".
// The doctor clicks this when the called patient arrives at their room.
// Only the assigned doctor (or any doctor) may start — enforced by tenant context.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { transitionAppointmentStatus } from "@/lib/db/repositories/appointments"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Appointment } from "@/lib/types"

export async function startConsultation(
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
      summary: `Started consultation: appointment ${appointmentId} → in_consultation`,
    }, async (client) => {
      const apt = await transitionAppointmentStatus(
        client,
        ctx.tenantId,
        appointmentId,
        "in_consultation",
      )
      if (!apt) throw new Error("Appointment not found")
      return { rowId: apt.id, ...apt }
    })

    return { success: true, data: appointment }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to start consultation",
    }
  }
}