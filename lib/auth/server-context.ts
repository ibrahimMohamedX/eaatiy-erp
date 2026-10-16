// ============================================================================
// Server Context Helper — Phase 2D
// ============================================================================
// Extracts tenant/user context from middleware-injected headers for use by
// server actions and route handlers. No hardcoded actor IDs.
//
// Headers injected by proxy.ts after JWT verification:
//   x-user-id, x-tenant-id, x-tenant-slug, x-user-role
//
// PLATFORM GATE (super-admin controlled, enforced here):
//   1. Global system_state singleton (operational | maintenance | locked)
//   2. The caller's tenant status (must be 'active')
// Any failure → null, so EVERY server action and data path denies access
// automatically and instantly when the super admin freezes the system or
// locks a specific clinic. Statuses are cached in-process for 15s.
// ============================================================================

import { headers } from "next/headers"
import { getIdentityPool } from "@/lib/db/connection"
import type { UserRole } from "@/lib/types"

/** Context extracted from middleware-injected request headers */
export interface TenantContext {
  userId: string
  tenantId: string
  tenantSlug: string
  role: UserRole
}

// ---------------------------------------------------------------------------
// Platform gate cache (in-process, short TTL)
// ---------------------------------------------------------------------------

interface PlatformGate {
  at: number
  systemState: string // operational | maintenance | locked
  tenantStatuses: Map<string, string> // tenantId → status
}

let gateCache: PlatformGate | null = null
const GATE_TTL_MS = 15 * 1000

interface GateRow {
  system_state: string | null
}

/**
 * Loads the platform gate (global system state + all tenant statuses) from
 * the Identity DB, using the in-process cache when fresh.
 */
async function loadPlatformGate(): Promise<PlatformGate | null> {
  if (gateCache && Date.now() - gateCache.at < GATE_TTL_MS) {
    return gateCache
  }
  try {
    const pool = getIdentityPool()
    const [stateResult, tenantsResult] = await Promise.all([
      pool.query<GateRow>(`SELECT state AS system_state FROM system_state WHERE id = 1`),
      pool.query<{ id: string; status: string }>(`SELECT id, status FROM tenants`),
    ])
    const gate: PlatformGate = {
      at: Date.now(),
      systemState: stateResult.rows[0]?.system_state ?? "operational",
      tenantStatuses: new Map(tenantsResult.rows.map((r) => [r.id, r.status])),
    }
    gateCache = gate
    return gate
  } catch {
    // Identity DB unreachable — fail closed (deny everything)
    return null
  }
}

/**
 * Extract tenant context from request headers (set by middleware).
 *
 * Returns null when headers are missing OR the platform gate denies the
 * caller (system locked / in maintenance, or their tenant is not active).
 * Callers should return an { error: "Unauthorized" } result rather than
 * falling back to hardcoded IDs.
 *
 * Does not throw because this is called from server-action entry points
 * and we want explicit error handling, not 500s.
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  const h = await headers()
  const userId = h.get("x-user-id")
  const tenantId = h.get("x-tenant-id")
  const tenantSlug = h.get("x-tenant-slug")
  const role = h.get("x-user-role") as UserRole | null

  // Need userId and tenantId at minimum
  if (!userId || !tenantId || !tenantSlug) {
    return null
  }

  // Platform gate: global state + tenant status (super-admin controlled)
  const gate = await loadPlatformGate()
  if (!gate) {
    return null // fail closed
  }
  if (gate.systemState !== "operational") {
    return null // system-wide maintenance / lock
  }
  const tenantStatus = gate.tenantStatuses.get(tenantId)
  if (tenantStatus !== "active") {
    return null // clinic suspended/revoked/provisioning — auto-locked
  }

  return {
    userId,
    tenantId,
    tenantSlug,
    role: role ?? "receptionist", // fallback role — middleware always sets this
  }
}
