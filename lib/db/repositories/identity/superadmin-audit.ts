// ============================================================================
// Repository: Super Admin Audit (Identity DB)
// ============================================================================
// Platform-level audit trail for every control-room action:
// provisioning, tenant status transitions, license generation/revocation.
// Mirrors the tenant audit_logs contract so the portal UI (AuditLog type)
// renders it without adapters.
// ============================================================================

import type { Pool } from "pg"
import type { DbPool } from "../../db-client"
import type { AuditAction, AuditChange, AuditLog } from "@/lib/types"

/** Sentinel actor for portal actions — the portal authenticates via a shared key */
export const SUPER_ADMIN_ACTOR_ID = "00000000-0000-0000-9000-000000000090"

export interface InsertSuperAdminAuditInput {
  action: AuditAction
  tenantId: string // the tenant the action affected
  targetTable: string
  targetRowId: string
  summary: string
  changes?: AuditChange[]
}

interface SuperAdminAuditRow {
  id: string
  actor_id: string
  tenant_id: string
  action: string
  target_table: string
  target_row_id: string
  summary: string
  changes: AuditChange[] | null
  created_at: Date | string
}

function normalizeAuditLog(row: SuperAdminAuditRow): AuditLog {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    actor_id: row.actor_id,
    action: row.action as AuditAction,
    target_table: row.target_table,
    target_row_id: row.target_row_id,
    summary: row.summary,
    changes: row.changes ?? undefined,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }
}

export async function insertSuperAdminAudit(
  pool: DbPool | Pool,
  input: InsertSuperAdminAuditInput,
): Promise<void> {
  await pool.query(
    `INSERT INTO super_admin_audit
       (actor_id, tenant_id, action, target_table, target_row_id, summary, changes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      SUPER_ADMIN_ACTOR_ID,
      input.tenantId,
      input.action,
      input.targetTable,
      input.targetRowId,
      input.summary,
      input.changes ? JSON.stringify(input.changes) : null,
    ],
  )
}

export async function listSuperAdminAudit(
  pool: DbPool | Pool,
  limit = 200,
): Promise<AuditLog[]> {
  const result = await pool.query<SuperAdminAuditRow>(
    `SELECT id, actor_id, tenant_id, action, target_table, target_row_id,
            summary, changes, created_at
     FROM super_admin_audit
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  )
  return result.rows.map(normalizeAuditLog)
}
