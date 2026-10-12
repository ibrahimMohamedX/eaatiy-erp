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
        <ScrollText className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">
          {sa.superAdminAuditTitle}
        </h2>
        <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#6B7280] dark:bg-[#374151] dark:text-[#9CA3AF]">
          {filtered.length}
        </span>
      </div>

      {/* Filters */}
      {logs.length > 0 && (
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-[#9CA3AF]" strokeWidth={1.5} />
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="h-8 rounded-[6px] border border-[#E5E7EB] bg-white px-2 text-xs text-[#6B7280] dark:border-[#374151] dark:bg-[#111827] dark:text-[#9CA3AF]"
          >
            <option value="">{t.common.allTables}</option>
            {filterOptions.tables.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="h-8 rounded-[6px] border border-[#E5E7EB] bg-white px-2 text-xs text-[#6B7280] dark:border-[#374151] dark:bg-[#111827] dark:text-[#9CA3AF]"
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
      <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ScrollText className="h-10 w-10 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
              {sa.noAuditEntries}
            </p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {sa.noAuditEntriesDesc}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
              No matching entries
            </p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Adjust the filters to see more results.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] dark:border-[#374151] dark:bg-[#111827]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  {t.admin.auditFilterBar.searchId ?? "Record ID"}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  Table
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  Summary
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
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
                    className="border-b border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB] dark:border-[#374151] dark:hover:bg-[#111827]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {log.target_row_id.slice(0, 12)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          color: actionMeta?.color ?? "#6B7280",
                          backgroundColor: `${actionMeta?.color ?? "#6B7280"}15`,
                        }}
                      >
                        {actionMeta?.label ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {log.target_table}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB] max-w-[300px] truncate">
                      {log.summary}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {log.changes && log.changes.length > 0 ? (
                        <span className="text-xs text-[#2563EB] dark:text-[#60A5FA]">
                          {log.changes.length} change{log.changes.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">—</span>
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