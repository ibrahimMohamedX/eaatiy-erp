// ============================================================================
// Repository: Audit Logs
// ============================================================================
// Immutable; only INSERT is supported (no UPDATE, no DELETE).
// Used by withAudit() wrapper for every data mutation.
// ============================================================================

import type { DbPool } from "../db-client"
import type { AuditLog, AuditAction, AuditChange } from "@/lib/types"

// ---------------------------------------------------------------------------
// Create (insert-only — immutable)
// ---------------------------------------------------------------------------

export interface CreateAuditLogInput {
  actor_id: string
  action: AuditAction
  target_table: string
  target_row_id: string
  summary: string
  changes?: AuditChange[]
}

export async function createAuditLog(
  pool: DbPool,
  tenantId: string,
  input: CreateAuditLogInput,
): Promise<AuditLog> {
  const result = await pool.query<AuditLog>(
    `INSERT INTO audit_logs (
       tenant_id, actor_id, action, target_table, target_row_id, summary, changes
     ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     RETURNING *`,
    [
      tenantId,
      input.actor_id,
      input.action,
      input.target_table,
      input.target_row_id,
      input.summary,
      input.changes ? JSON.stringify(input.changes) : null,
    ],
  )
  return result.rows[0]
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getAuditLogsForRecord(
  pool: DbPool,
  tenantId: string,
  targetTable: string,
  targetRowId: string,
): Promise<AuditLog[]> {
  const result = await pool.query<AuditLog>(
    `SELECT * FROM audit_logs
     WHERE tenant_id = $1 AND target_table = $2 AND target_row_id = $3
     ORDER BY created_at DESC
     LIMIT 100`,
    [tenantId, targetTable, targetRowId],
  )
  return result.rows
}

export async function getRecentAuditLogs(
  pool: DbPool,
  tenantId: string,
  limit?: number,
): Promise<AuditLog[]> {
  const result = await pool.query<AuditLog>(
    `SELECT * FROM audit_logs
     WHERE tenant_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [tenantId, limit ?? 50],
  )
  return result.rows
}

export async function getAuditLogsByActor(
  pool: DbPool,
  tenantId: string,
  actorId: string,
  limit?: number,
): Promise<AuditLog[]> {
  const result = await pool.query<AuditLog>(
    `SELECT * FROM audit_logs
     WHERE tenant_id = $1 AND actor_id = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [tenantId, actorId, limit ?? 50],
  )
  return result.rows
}

// ---------------------------------------------------------------------------
// Filtered audit logs (admin filter bar)
// ---------------------------------------------------------------------------

export interface AuditLogFilters {
  targetTable?: string
  action?: string
  actorId?: string
  since?: string
  until?: string
  searchRowId?: string
}

export async function getFilteredAuditLogs(
  pool: DbPool,
  tenantId: string,
  filters: AuditLogFilters,
  limit?: number,
): Promise<AuditLog[]> {
  const conditions: string[] = ["tenant_id = $1"]
  const params: unknown[] = [tenantId]

  if (filters.targetTable) {
    params.push(filters.targetTable)
    conditions.push(`target_table = $${params.length}`)
  }
  if (filters.action) {
    params.push(filters.action)
    conditions.push(`action = $${params.length}`)
  }
  if (filters.actorId) {
    params.push(filters.actorId)
    conditions.push(`actor_id = $${params.length}`)
  }
  if (filters.since) {
    params.push(filters.since)
    conditions.push(`created_at >= $${params.length}`)
  }
  if (filters.until) {
    params.push(filters.until)
    conditions.push(`created_at < $${params.length}`)
  }
  if (filters.searchRowId) {
    params.push(`%${filters.searchRowId}%`)
    conditions.push(`target_row_id::text LIKE $${params.length}`)
  }

  const query = `SELECT * FROM audit_logs
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1}`
  params.push(limit ?? 200)

  const result = await pool.query<AuditLog>(query, params)
  return result.rows
}