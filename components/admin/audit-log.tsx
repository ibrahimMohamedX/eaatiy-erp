"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { useT, resolveLabel } from "@/lib/i18n/use-t"
import { AUDIT_ACTION_META } from "@/lib/types"
import type { AuditLogEntry } from "@/lib/actions/admin/get-audit-data"

/* ---------------------------------------------------------------------------
 * Sub-components (dropdown, diff, timeline entry)
 * --------------------------------------------------------------------------- */

function Dropdown({
  label,
  dotColors,
  onSelect,
  options,
}: {
  label: string
  dotColors?: string[]
  onSelect: (value: string) => void
  options: { label: string; value: string }[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] transition-colors hover:border-[#0F766E] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB]"
      >
        {dotColors && (
          <span className="flex items-center gap-0.5">
            {dotColors.map((c) => (
              <span key={c} className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </span>
        )}
        {label}
        <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-[0_4px_24px_rgba(0,0,0,0.12)] dark:border-[#374151] dark:bg-[#1F2937]">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#F9FAFB] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
                onClick={() => {
                  onSelect(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="relative flex justify-center py-2">
      <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#6B7280] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#9CA3AF]">
        {label}
      </span>
    </div>
  )
}

function ChangeDiff({
  changes,
  t,
}: {
  changes: NonNullable<AuditLogEntry["changes"]>
  t: Record<string, any>
}) {
  return (
    <div className="mt-3 flex gap-px overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#E5E7EB] text-sm dark:border-[#374151] dark:bg-[#374151]">
      {/* Before column */}
      <div className="flex-1">
        <div className="bg-[#F9FAFB] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[#6B7280] dark:bg-[#374151] dark:text-[#9CA3AF]">
          {t.admin.auditBefore}
        </div>
        {changes.map((c) => (
          <FieldRow key={`${c.field}-before`} field={c.field} value={c.before} muted />
        ))}
      </div>
      {/* After column */}
      <div className="flex-1">
        <div className="bg-[#F9FAFB] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[#6B7280] dark:bg-[#374151] dark:text-[#9CA3AF]">
          {t.admin.auditAfter}
        </div>
        {changes.map((c) => (
          <FieldRow key={`${c.field}-after`} field={c.field} value={c.after} highlight />
        ))}
      </div>
    </div>
  )
}

function FieldRow({
  field,
  value,
  muted,
  highlight,
}: {
  field: string
  value: string
  muted?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={`border-t border-[#E5E7EB] px-3 py-2 dark:border-[#374151] ${
        highlight ? "bg-[#D97706]/[0.12]" : "bg-white dark:bg-[#1F2937]"
      }`}
    >
      <div className="font-mono text-xs text-[#6B7280] dark:text-[#9CA3AF]">{field}</div>
      <div
        className={`mt-0.5 ${
          muted
            ? "text-[#6B7280] line-through dark:text-[#9CA3AF]"
            : highlight
              ? "font-medium text-[#111827] dark:text-[#F9FAFB]"
              : "text-[#111827] dark:text-[#F9FAFB]"
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function TimelineEntry({
  entry,
  defaultExpanded,
  t,
}: {
  entry: AuditLogEntry
  defaultExpanded?: boolean
  t: Record<string, any>
}) {
  const [expanded, setExpanded] = useState(!!defaultExpanded)
  const meta = AUDIT_ACTION_META[entry.action]
  const Icon = entry.action === "insert" ? Plus : entry.action === "update" ? Pencil : Trash2

  return (
    <div className="relative pl-12">
      {/* marker */}
      <span
        className="absolute left-[9px] top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-[#F9FAFB]"
        style={{ backgroundColor: meta.color }}
      >
        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2} />
      </span>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_8px_rgba(17,24,39,0.06)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_4px_24px_rgba(0,0,0,0.32)]">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E]/[0.12] text-xs font-medium text-[#0F766E]">
              {entry.actorInitials}
            </span>
            <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{entry.actorName}</span>
            <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-xs text-[#6B7280] dark:bg-[#374151] dark:text-[#9CA3AF]">
              {entry.actorRole}
            </span>
          </div>
          <span className="shrink-0 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{entry.when}</span>
        </div>

        {/* Second row */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{entry.summary}</span>
          <span className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-1.5 py-0.5 font-mono text-xs text-[#6B7280] dark:border-[#374151] dark:bg-[#374151] dark:text-[#9CA3AF]">
            #{entry.targetRowId}
          </span>
        </div>

        {/* Third row: expandable */}
        {entry.changes && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#0F766E] hover:underline"
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
              {t.admin.auditViewChanges}
            </button>
            {expanded && <ChangeDiff changes={entry.changes} t={t} />}
          </>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Main component
 * --------------------------------------------------------------------------- */

type Props = {
  entries: AuditLogEntry[] | null
  onFilterChange?: (filters: { targetTable?: string; action?: string; actorId?: string; since?: string; searchRowId?: string }) => void
}

export function AuditLog({ entries, onFilterChange }: Props) {
  const { t } = useT()

  return (
    <div className="flex flex-col">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] bg-[#F9FAFB]/95 px-6 py-3 backdrop-blur dark:border-[#374151] dark:bg-[#111827]/95">
        <Dropdown
          label={t.admin.auditFilterBar.allTables}
          options={[
            { label: t.admin.auditFilterBar.allTables, value: "" },
            { label: t.admin.auditFilterBar.tableAppointments, value: "appointments" },
            { label: t.admin.auditFilterBar.tablePatients, value: "patients" },
            { label: t.admin.auditFilterBar.tableBilling, value: "billings" },
            { label: t.admin.auditFilterBar.tablePrescriptions, value: "prescriptions" },
            { label: t.admin.auditFilterBar.tableMedicalRecords, value: "medical_records" },
          ]}
          onSelect={(value) => onFilterChange?.({ targetTable: value || undefined })}
        />
        <Dropdown
          label={t.admin.auditFilterBar.allActions}
          dotColors={["#059669", "#2563EB", "#DC2626"]}
          options={[
            { label: t.admin.auditFilterBar.allActions, value: "" },
            { label: t.admin.auditFilterBar.actionInsert, value: "insert" },
            { label: t.admin.auditFilterBar.actionUpdate, value: "update" },
            { label: t.admin.auditFilterBar.actionDelete, value: "delete" },
          ]}
          onSelect={(value) => onFilterChange?.({ action: value || undefined })}
        />
        <Dropdown
          label={t.admin.auditFilterBar.allDates}
          options={[
            { label: t.admin.auditFilterBar.allDates, value: "" },
            { label: t.admin.auditFilterBar.last24h, value: "24h" },
            { label: t.admin.auditFilterBar.last7Days, value: "7d" },
            { label: t.admin.auditFilterBar.last30Days, value: "30d" },
          ]}
          onSelect={(value) => {
            if (!value) { onFilterChange?.({ since: undefined }); return }
            const now = Date.now()
            const offsets: Record<string, number> = { "24h": 86_400_000, "7d": 604_800_000, "30d": 2_592_000_000 }
            const since = new Date(now - offsets[value]).toISOString()
            onFilterChange?.({ since })
          }}
        />
        <div className="relative ml-auto min-w-[220px] flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder={t.admin.auditFilterBar.searchId}
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:placeholder:text-[#9CA3AF]"
            onChange={(e) => {
              const value = e.target.value.trim()
              onFilterChange?.({ searchRowId: value || undefined })
            }}
          />
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="p-6">
        <div className="relative mx-auto max-w-3xl">
          {/* connector line */}
          <span className="absolute bottom-2 left-[21px] top-2 w-px bg-[#E5E7EB] dark:bg-[#374151]" aria-hidden />

          <div className="flex flex-col gap-4">
            {entries && entries.length > 0 ? (
              entries.map((entry, idx) => (
                <TimelineEntry key={entry.id} entry={entry} defaultExpanded={idx === 0} t={t} />
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  No audit entries found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}