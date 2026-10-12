// ============================================================================
// Repository: Tenants
// ============================================================================
// Operates on the Identity DB's tenants table. Used by super admin flows (Phase 2C)
// and middleware (Phase 2D) for slug → id resolution.
// ============================================================================

import type { DbPool } from "../db-client"
import type { Tenant } from "@/lib/types"

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getTenantBySlug(
  pool: DbPool,
  slug: string,
): Promise<Tenant | null> {
  const result = await pool.query<Tenant>(
    `SELECT * FROM tenants WHERE slug = $1`,
    [slug],
  )
  return result.rows[0] ?? null
}

export async function getTenantById(
  pool: DbPool,
  tenantId: string,
): Promise<Tenant | null> {
  const result = await pool.query<Tenant>(
    `SELECT * FROM tenants WHERE id = $1`,
    [tenantId],
  )
  return result.rows[0] ?? null
}

export async function listActiveTenants(pool: DbPool): Promise<Tenant[]> {
  const result = await pool.query<Tenant>(
    `SELECT * FROM tenants WHERE status = 'active' ORDER BY name`,
  )
  return result.rows
}