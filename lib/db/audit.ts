// ============================================================================
// Transactional Audit Wrapper — Phase 2B
// ============================================================================
// Wraps a data mutation inside a PostgreSQL transaction and writes an immutable
// audit log row. The callback receives a PoolClient (single connection) so every
// query inside the mutation runs on the same transaction.
//
// Usage:
//   const patient = await withAudit(pool, tenantId, actorId, {
//     action: "insert",
//     targetTable: "patients",
//     summary: "Registered new patient",
//   }, async (client) => {
//     const result = await client.query(...)
//     return { rowId: result.rows[0].id, newData: result.rows[0] }
//   })
//
// Returns: { result } where result is whatever the callback returns.
//
// If the callback throws, the transaction rolls back and no audit log is written.
// ============================================================================

import type { Pool } from "pg"
import type { DbPool } from "./db-client"
import type { AuditAction, AuditChange } from "@/lib/types"

// ---------------------------------------------------------------------------
// Input shape
// ---------------------------------------------------------------------------

export interface AuditContext {
  action: AuditAction
  targetTable: string
  summary: string
  changes?: AuditChange[]
}

// ---------------------------------------------------------------------------
// withAudit
// ---------------------------------------------------------------------------

export async function withAudit<T>(
  pool: Pool,
  tenantId: string,
  actorId: string,
  ctx: AuditContext,
  fn: (client: DbPool) => Promise<T & { rowId?: string }>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // Execute the mutation
    const result = await fn(client)

    // Write audit log on the same transaction
    const targetRowId = result.rowId ?? "unknown"
    await client.query(
      `INSERT INTO audit_logs (
         tenant_id, actor_id, action, target_table, target_row_id, summary, changes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        tenantId,
        actorId,
        ctx.action,
        ctx.targetTable,
        targetRowId,
        ctx.summary,
        ctx.changes ? JSON.stringify(ctx.changes) : null,
      ],
    )

    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

// ---------------------------------------------------------------------------
// diffChanges — helper to build AuditChange[] from before/after diffs
// ---------------------------------------------------------------------------

export function diffChanges<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>,
): AuditChange[] {
  const changes: AuditChange[] = []
  for (const key of Object.keys(after)) {
    const beforeVal = before[key]
    const afterVal = after[key]
    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      changes.push({
        field: key,
        before: String(beforeVal ?? ""),
        after: String(afterVal ?? ""),
      })
    }
  }
  return changes
}