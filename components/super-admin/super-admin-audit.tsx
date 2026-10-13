"use client"

import { useState, useMemo } from "react"
import { ScrollText, Filter } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import type { AuditLog, AuditAction } from "@/lib/types"
import type { IdentityTenant } from "@/lib/db/repositories/identity/tenants"
import { AUDIT_ACTION_META } from "@/lib/types"

interface SuperAdminAuditProps {
  logs: AuditLog[]
  tenants: IdentityTenant[]
}

// Archai semantic tones — insert=ok · update=arc · delete=err
const ACTION_TONES: Record<AuditAction, string> = {
  insert: "bg-ok/10 text-ok",
  update: "bg-arc/10 text-arc",
  delete: "bg-err/10 text-err",
}

export function SuperAdminAudit({ logs, tenants }: SuperAdminAuditProps) {
  const { t } = useT()
  const sa = t["super-admin"]

  const [filterTable, setFilterTable] = useState("")
  const [filterAction, setFilterAction] = useState("")

  // Compute unique tables and actions from the logs for filter dropdowns
  const filterOptions = useMemo(() => {
    const tables = new Set<string>()
    const actions = new Set<string>()
    for (const log of logs) {
      tables.add(log.target_table)
      actions.add(log.action)
    }
    return {
      tables: Array.from(tables).sort(),
      actions: Array.from(actions).sort(),
    }
  }, [logs])

  const filtered = logs.filter((log) => {
    if (filterTable && log.target_table !== filterTable) return false
    if (filterAction && log.action !== filterAction) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-arc/10">
          <ScrollText className="size-[18px] text-arc" strokeWidth={1.75} />
        </span>
        <h2 className="font-display text-xl font-semibold text-foreground">
          {sa.superAdminAuditTitle}
        </h2>
        <span className="rounded-full border border-line px-2 py-0.5 font-mono text-xs text-mist ltr-in-rtl">
          {filtered.length}
        </span>
      </div>

      {/* Filters */}
      {logs.length > 0 && (
        <div className="flex items-center gap-3">
          <Filter className="size-4 text-mist" strokeWidth={1.75} />
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="h-8 rounded-lg border border-line bg-card px-2 text-xs text-muted-foreground transition-all duration-200 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none dark:bg-ink"
          >
            <option value="">{t.common.allTables}</option>
            {filterOptions.tables.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="h-8 rounded-lg border border-line bg-card px-2 text-xs text-muted-foreground transition-all duration-200 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none dark:bg-ink"
          >
            <option value="">{sa.filterByAction ?? "All Actions"}</option>
            {filterOptions.actions.map((a) => {
              const actionKey = a as AuditAction
              const meta = AUDIT_ACTION_META[actionKey]
              return (
                <option key={a} value={a}>
                  {meta?.label ?? a}
                </option>
              )
            })}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ScrollText className="size-10 text-mist" strokeWidth={1.75} />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {sa.noAuditEntries}
            </p>
            <p className="mt-1 text-xs text-mist">
              {sa.noAuditEntriesDesc}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No matching entries
            </p>
            <p className="mt-1 text-xs text-mist">
              Adjust the filters to see more results.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-steel/40">
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  {t.admin.auditFilterBar.searchId ?? "Record ID"}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  Action
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  Table
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  Summary
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-end text-xs font-semibold uppercase text-mist">
                  Changes
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const actionMeta = AUDIT_ACTION_META[log.action as AuditAction]
                return (
                  <tr
                    key={log.id}
                    className="border-b border-line transition-colors duration-200 last:border-b-0 hover:bg-accent"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">
                      {log.target_row_id.slice(0, 12)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${ACTION_TONES[log.action as AuditAction]}`}
                      >
                        {actionMeta?.label ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">
                      {log.target_table}
                    </td>
                    <td className="max-w-[300px] truncate px-4 py-3 text-[15px] text-foreground">
                      {log.summary}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground ltr-in-rtl">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                      {log.changes && log.changes.length > 0 ? (
                        <span className="font-latin text-xs text-arc">
                          {log.changes.length} change{log.changes.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-mist">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
