"use server"

// ============================================================================
// Server Action: Get All Tenants — Super Admin
// ============================================================================
// Lists all tenants from the Identity DB. No tenant context required.
// ============================================================================

import { getIdentityPool } from "@/lib/db/connection"
import { getAllTenants } from "@/lib/db/repositories/identity/tenants"
import type { IdentityTenant } from "@/lib/db/repositories/identity/tenants"

export type GetAllTenantsResult =
  | { success: true; data: IdentityTenant[] }
  | { success: false; error: string }

export { type IdentityTenant }

export async function getAllTenantsAction(): Promise<GetAllTenantsResult> {
  try {
    const pool = getIdentityPool()
    const tenants = await getAllTenants(pool)
    return { success: true, data: tenants }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch tenants"
    console.error("getAllTenants error:", message)
    return { success: false, error: message }
  }
}