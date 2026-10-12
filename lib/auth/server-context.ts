// ============================================================================
// Server Context Helper — Phase 2D
// ============================================================================
// Extracts tenant/user context from middleware-injected headers for use by
// server actions and route handlers. No hardcoded actor IDs.
//
// Headers injected by middleware.ts after JWT verification:
//   x-user-id, x-tenant-id, x-tenant-slug, x-user-role
// ============================================================================

import { headers } from "next/headers"
import type { UserRole } from "@/lib/types"

/** Context extracted from middleware-injected request headers */
export interface TenantContext {
  userId: string
  tenantId: string
  tenantSlug: string
  role: UserRole
}

/**
 * Extract tenant context from request headers (set by middleware).
 *
 * Returns null when headers are missing — callers should return an
 * { error: "Unauthorized" } result rather than falling back to hardcoded IDs.
 *
 * Does NOT throw because this is called from server-action entry points
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

  return {
    userId,
    tenantId,
    tenantSlug,
    role: role ?? "receptionist", // fallback role — middleware always sets this
  }
}