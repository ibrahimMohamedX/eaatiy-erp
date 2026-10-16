"use server"

// ============================================================================
// Super Admin Action: Change Subscription Tier
// ============================================================================
// Upgrades/downgrades a clinic's subscription (trial → basic → premium)
// after provisioning. Audited in super_admin_audit.
// ============================================================================

import { getIdentityPool } from "@/lib/db/connection"
import { insertSuperAdminAudit } from "@/lib/db/repositories/identity/superadmin-audit"
import { isSuperAdminAuthed } from "@/lib/auth/super-admin"
import { SUBSCRIPTION_TIERS } from "@/lib/db/schema/identity/tenants"
import type { IdentityTenant } from "@/lib/db/repositories/identity/tenants"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// NOTE: a "use server" file may only export async functions — no runtime
// values. The SUBSCRIPTION_TIERS const (and its SubscriptionTier type) live
// in lib/db/schema/identity/tenants; import them from there directly.

export type ChangeTierResult =
  | { success: true; data: IdentityTenant }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function changeSubscriptionTierAction(
  tenantId: string,
  tier: string,
): Promise<ChangeTierResult> {
  if (!(await isSuperAdminAuthed())) {
    return { success: false, error: "Unauthorized" }
  }
  if (!(SUBSCRIPTION_TIERS as readonly string[]).includes(tier)) {
    return {
      success: false,
      error: `Tier must be one of: ${SUBSCRIPTION_TIERS.join(", ")}`,
    }
  }

  const pool = getIdentityPool()
  try {
    const result = await pool.query<IdentityTenant>(
      `UPDATE tenants SET subscription_tier = $2 WHERE id = $1 RETURNING *`,
      [tenantId, tier],
    )
    const updated = result.rows[0]
    if (!updated) {
      return { success: false, error: "Tenant not found" }
    }

    // Platform audit trail (never blocks the change)
    try {
      await insertSuperAdminAudit(pool, {
        action: "update",
        tenantId,
        targetTable: "tenants",
        targetRowId: tenantId,
        summary: `Subscription tier → ${tier}`,
      })
    } catch (auditErr) {
      console.error("super-admin audit write failed:", auditErr)
    }

    return { success: true, data: updated }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to change subscription tier"
    console.error("changeSubscriptionTierAction error:", message)
    return { success: false, error: message }
  }
}
