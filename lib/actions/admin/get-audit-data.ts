"use server"

// ============================================================================
// Admin Action: getAuditData — Phase 2F
// ============================================================================
// Fetches filtered audit logs for the admin audit log tab. Supports filtering
// by target table, action, actor, date range, and row ID search.
// ============================================================================

import { getTenantPool, getIdentityPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import { getFilteredAuditLogs, type AuditLogFilters } from "@/lib/db/repositories/audit-logs"

export interface AuditLogEntry {
  id: string
  action: "insert" | "update" | "delete"
  actorId: string
  actorName: string
  actorInitials: string
  actorRole: string
  summary: string
  targetRowId: string
  targetTable: string
  when: string
  changes?: { field: string; before: string; after: string }[]
}

export async function getAuditData(
  filters?: AuditLogFilters,
): Promise<{ success: true; data: AuditLogEntry[] } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    const logs = await getFilteredAuditLogs(pool, ctx.tenantId, filters ?? {}, 200)

    // Collect actor IDs to resolve names
    const actorIds = [...new Set(logs.map((l) => l.actor_id))]
    const actorMap = new Map<string, { full_name: string; role: string }>()

    if (actorIds.length > 0) {
      // Actor accounts live in the Identity DB — tenant DBs have no users table
      const identityPool = getIdentityPool()
      const result = await identityPool.query<{ id: string; full_name: string; role: string }>(
        `SELECT id, full_name, role FROM users WHERE id = ANY($1::uuid[])`,
        [actorIds],
      )
      for (const row of result.rows) {
        actorMap.set(row.id, { full_name: row.full_name, role: row.role })
      }
    }

    function initials(name: string): string {
      return name
        .replace(/^Dr\.\s*/i, "")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    }

    const now = Date.now()

    function relativeTime(iso: string): string {
      const diff = now - new Date(iso).getTime()
      const mins = Math.floor(diff / 60_000)
      if (mins < 1) return "just now"
      if (mins < 60) return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs}h ago`
      const days = Math.floor(hrs / 24)
      if (days === 1) return "1d ago"
      return `${days}d ago`
    }

    const data: AuditLogEntry[] = logs.map((l) => {
      const actor = actorMap.get(l.actor_id)
      return {
        id: l.id,
        action: l.action,
        actorId: l.actor_id,
        actorName: actor?.full_name ?? "Unknown",
        actorInitials: actor ? initials(actor.full_name) : "??",
        actorRole: actor?.role ?? "unknown",
        summary: l.summary,
        targetRowId: l.target_row_id.slice(0, 8) + "…",
        targetTable: l.target_table,
        when: relativeTime(l.created_at),
        changes: Array.isArray(l.changes) ? l.changes : undefined,
      }
    })

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch audit data",
    }
  }
}