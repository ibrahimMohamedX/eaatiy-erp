"use server"

// ============================================================================
// Admin Actions: Supervisor scope matrix (مشرف)
// ============================================================================
// Admin decides which clinic sections each supervisor can view/edit.
// Creating supervisor accounts is done via manage-accounts.ts (role =
// supervisor); this file manages their per-section grants.
// ============================================================================

import { getTenantPool, getIdentityPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import {
  listSupervisorScopes,
  saveSupervisorScope as repoSaveScope,
  deleteSupervisorScope as repoDeleteScope,
  type SupervisorScopeRow,
} from "@/lib/db/repositories/supervisor-scopes"
import { SUPERVISOR_SECTIONS, type SupervisorSection } from "@/lib/db/schema/tenant/supervisor-scopes"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type ScopeActionResult =
  | { success: true; data: SupervisorScopeRow }
  | { success: false; error: string }

export interface SupervisorInfo {
  id: string
  full_name: string
  email: string
  is_active: boolean
}

export interface SupervisorsTabData {
  supervisors: SupervisorInfo[]
  scopes: SupervisorScopeRow[]
  sections: readonly string[]
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getSupervisorsData(): Promise<
  { success: true; data: SupervisorsTabData } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const identityPool = getIdentityPool()
    const pool = getTenantPool(ctx.tenantSlug)

    const [supervisorsResult, scopes] = await Promise.all([
      identityPool.query<SupervisorInfo>(
        `SELECT id, full_name, email, is_active
         FROM users
         WHERE tenant_id = $1 AND role = 'supervisor'
         ORDER BY full_name`,
        [ctx.tenantId],
      ),
      listSupervisorScopes(pool, ctx.tenantId),
    ])

    return {
      success: true,
      data: {
        supervisors: supervisorsResult.rows,
        scopes,
        sections: SUPERVISOR_SECTIONS,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch supervisors data",
    }
  }
}

// ---------------------------------------------------------------------------
// Save one section grant for one supervisor
// ---------------------------------------------------------------------------

export interface SaveScopeInput {
  user_id: string
  section: string
  can_view: boolean
  can_edit: boolean
}

export async function saveSupervisorScope(
  input: SaveScopeInput,
): Promise<ScopeActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    if (!SUPERVISOR_SECTIONS.find((s) => s === input.section)) {
      return { success: false, error: `Section must be one of: ${SUPERVISOR_SECTIONS.join(", ")}` }
    }
    if (input.can_edit && !input.can_view) {
      return { success: false, error: "Cannot grant edit without view" }
    }

    // The user must be a supervisor of this tenant
    const identityPool = getIdentityPool()
    const user = await identityPool.query(
      `SELECT id FROM users WHERE id = $1 AND tenant_id = $2 AND role = 'supervisor'`,
      [input.user_id, ctx.tenantId],
    )
    if (user.rows.length === 0) {
      return { success: false, error: "Supervisor not found for this clinic" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const row = await repoSaveScope(
      pool,
      ctx.tenantId,
      {
        user_id: input.user_id,
        section: input.section as SupervisorSection,
        can_view: input.can_view,
        can_edit: input.can_edit,
      },
      ctx.userId,
    )
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save supervisor scope",
    }
  }
}

// ---------------------------------------------------------------------------
// Delete one grant
// ---------------------------------------------------------------------------

export async function deleteSupervisorScope(
  id: string,
): Promise<{ success: true; deleted: true } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const pool = getTenantPool(ctx.tenantSlug)
    const ok = await repoDeleteScope(pool, ctx.tenantId, id)
    if (!ok) return { success: false, error: "Scope not found" }
    return { success: true, deleted: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete supervisor scope",
    }
  }
}
