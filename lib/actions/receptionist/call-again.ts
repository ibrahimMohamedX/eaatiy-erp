"use server"

// ============================================================================
// Server Action: callAgain — Round 2.3
// ============================================================================
// Re-calls a patient already in "called" state. Enforces a 2-minute cooldown
// from the last_called_at timestamp to prevent spamming.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { transitionAppointmentStatus, getAppointmentById } from "@/lib/db/repositories/appointments"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Appointment } from "@/lib/types"

const CALL_AGAIN_COOLDOWN_MS = 2 * 60 * 1000 // 2 minutes

export async function callAgain(
  appointmentId: string,
): Promise<{ success: true; data: Appointment } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    // Read current appointment to check cooldown
    const current = await getAppointmentById(pool, ctx.tenantId, appointmentId)
    if (!current) {
      return { success: false, error: "Appointment not found" }
    }

    if (current.status !== "called") {
      return { success: false, error: "Patient is not in called state. Call them first." }
    }

    // Enforce 2-minute cooldown from last_called_at
    if (current.last_called_at) {
      const lastCalled = new Date(current.last_called_at).getTime()
      const elapsed = Date.now() - lastCalled
      if (elapsed < CALL_AGAIN_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((CALL_AGAIN_COOLDOWN_MS - elapsed) / 1000)
        return {
          success: false,
          error: `Please wait ${waitSeconds}s before calling again.`,
        }
      }
    }

    // Re-transition to "called" (updates last_called_at timestamp)
    const appointment = await withAudit(pool, ctx.tenantId, ctx.userId, {
      action: "update",
      targetTable: "appointments",
      summary: `Called again: appointment ${appointmentId}`,
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
      error: err instanceof Error ? err.message : "Failed to call again",
    }
  }
}