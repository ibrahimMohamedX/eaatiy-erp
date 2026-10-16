// ============================================================================
// Repository: Supervisor Scopes — admin-defined access matrix
// ============================================================================
// One row per (supervisor user, section). The admin grants view/edit per
// section; the /supervisor UI renders only sections with can_view = true.
// Every query is tenant-scoped.
// ============================================================================

import type { DbPool } from "../db-client"
import type { SupervisorSection } from "@/lib/db/schema/tenant/supervisor-scopes"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SupervisorScopeRow {
  id: string
  user_id: string
  section: string
  can_view: boolean
  can_edit: boolean
  assigned_by: string | null
  created_at: string
  updated_at: string
}

export interface SupervisorScopeInput {
  user_id: string
  section: SupervisorSection
  can_view: boolean
  can_edit: boolean
}

interface RawScopeRow {
  id: string
  user_id: string
  section: string
  can_view: boolean
  can_edit: boolean
  assigned_by: string | null
  created_at: Date
  updated_at: Date
}

function normalize(row: RawScopeRow): SupervisorScopeRow {
  return {
    id: row.id,
    user_id: row.user_id,
    section: row.section,
    can_view: row.can_view,
    can_edit: row.can_edit,
    assigned_by: row.assigned_by,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function listSupervisorScopes(
  pool: DbPool,
  tenantId: string,
  opts?: { userId?: string },
): Promise<SupervisorScopeRow[]> {
  const params: unknown[] = [tenantId]
  let where = `tenant_id = $1`
  if (opts?.userId) {
    params.push(opts.userId)
    where += ` AND user_id = $${params.length}`
  }
  const result = await pool.query<RawScopeRow>(
    `SELECT id, user_id, section, can_view, can_edit, assigned_by, created_at, updated_at
     FROM supervisor_scopes WHERE ${where}
     ORDER BY user_id, section`,
    params,
  )
  return result.rows.map(normalize)
}

/** Sections a given supervisor can view — powers the /supervisor landing page. */
export async function getViewableSections(
  pool: DbPool,
  tenantId: string,
  userId: string,
): Promise<string[]> {
  const result = await pool.query<{ section: string }>(
    `SELECT section FROM supervisor_scopes
     WHERE tenant_id = $1 AND user_id = $2 AND can_view = true
     ORDER BY section`,
    [tenantId, userId],
  )
  return result.rows.map((r) => r.section)
}

/** Whether a supervisor may edit a given section. */
export async function canEditSection(
  pool: DbPool,
  tenantId: string,
  userId: string,
  section: string,
): Promise<boolean> {
  const result = await pool.query<{ can_edit: boolean }>(
    `SELECT can_edit FROM supervisor_scopes
     WHERE tenant_id = $1 AND user_id = $2 AND section = $3`,
    [tenantId, userId, section],
  )
  return result.rows[0]?.can_edit === true
}

// ---------------------------------------------------------------------------
// Upsert (admin sets one section grant for one supervisor)
// ---------------------------------------------------------------------------

export async function saveSupervisorScope(
  pool: DbPool,
  tenantId: string,
  input: SupervisorScopeInput,
  assignedBy: string,
): Promise<SupervisorScopeRow> {
  const result = await pool.query<RawScopeRow>(
    `INSERT INTO supervisor_scopes (tenant_id, user_id, section, can_view, can_edit, assigned_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (tenant_id, user_id, section) DO UPDATE SET
       can_view = EXCLUDED.can_view,
       can_edit = EXCLUDED.can_edit,
       assigned_by = EXCLUDED.assigned_by,
       updated_at = now()
     RETURNING id, user_id, section, can_view, can_edit, assigned_by, created_at, updated_at`,
    [
      tenantId,
      input.user_id,
      input.section,
      input.can_view,
      input.can_edit,
      assignedBy,
    ],
  )
  return normalize(result.rows[0])
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteSupervisorScope(
  pool: DbPool,
  tenantId: string,
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM supervisor_scopes WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  )
  return (result.rowCount ?? 0) > 0
}

/** Remove every grant for a supervisor (used when demoting/removing the user). */
export async function deleteAllScopesForUser(
  pool: DbPool,
  tenantId: string,
  userId: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM supervisor_scopes WHERE tenant_id = $1 AND user_id = $2`,
    [tenantId, userId],
  )
  return (result.rowCount ?? 0) > 0
}
