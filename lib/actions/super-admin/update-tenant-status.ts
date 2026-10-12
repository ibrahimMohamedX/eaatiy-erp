"use server"

// ============================================================================
// Server Action: Update Tenant Status — Super Admin
// ============================================================================
// Transitions a tenant between active / suspended / revoked.
// Used by the tenant list UI action buttons.
// ============================================================================

import { getIdentityPool } from "@/lib/db/connection"
import {
  updateTenantStatus,
  type TenantStatusTransition,
  type IdentityTenant,
} from "@/lib/db/repositories/identity/tenants"

export type UpdateTenantStatusResult =
  | { success: true; data: IdentityTenant }
  | { success: false; error: string }

export async function updateTenantStatusAction(
  tenantId: string,
  transition: TenantStatusTransition,
): Promise<UpdateTenantStatusResult> {
  try {
    const pool = getIdentityPool()
    const updated = await updateTenantStatus(pool, tenantId, transition)
    if (!updated) {
      return { success: false, error: "Tenant not found" }
    }
    return { success: true, data: updated }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update tenant status"
    console.error("updateTenantStatusAction error:", message)
    return { success: false, error: message }
  }
}