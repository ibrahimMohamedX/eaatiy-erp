"use server"

// ============================================================================
// Doctor Action: markBillingPaid — Phase 2E
// ============================================================================
// Marks a billing record as paid with the specified payment method.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { markBillingPaid as markBillingPaidRepo } from "@/lib/db/repositories/billings"
import { withAudit } from "@/lib/db/audit"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Billing, PaymentMethod } from "@/lib/types"

export async function markBillingPaid(
  billingId: string,
  method: PaymentMethod,
): Promise<{ success: true; data: Billing } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    if (method !== "cash" && method !== "card") {
      return { success: false, error: "Payment method must be 'cash' or 'card'." }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    const billing = await withAudit(pool, ctx.tenantId, ctx.userId, {
      action: "update",
      targetTable: "billings",
      summary: `Marked billing ${billingId} as paid via ${method}`,
    }, async (client) => {
      const b = await markBillingPaidRepo(client, ctx.tenantId, billingId, method)
      if (!b) throw new Error("Billing record not found")
      return { rowId: b.id, ...b }
    })

    return { success: true, data: billing }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark billing as paid",
    }
  }
}