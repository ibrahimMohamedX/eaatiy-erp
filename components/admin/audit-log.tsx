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

/** Archai solid tile per audit action (insert → ok, update → arc, delete → err) */
const ACTION_TILE: Record<string, string> = {
  insert: "bg-ok",
  update: "bg-arc",
  delete: "bg-err",
}

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
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-sm text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
      >
        {dotColors && (
          <span className="flex items-center gap-0.5">
            {dotColors.map((c) => (
              <span key={c} className="size-2 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </span>
        )}
        {label}
        <ChevronDown className="h-4 w-4 text-mist" strokeWidth={1.75} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute start-0 top-full z-20 mt-1 min-w-[160px] animate-archai-fade-in rounded-lg border border-line bg-popover py-1 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="w-full px-3 py-2 text-start text-sm text-foreground transition-colors duration-200 hover:bg-accent"
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
      <span className="rounded-full border border-line bg-card px-3 py-1 font-mono text-xs font-medium text-mist ltr-in-rtl">
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
    <div className="mt-3 flex gap-px overflow-hidden rounded-lg border border-line bg-line text-sm">
      {/* Before column */}
      <div className="flex-1">
        <div className="bg-steel px-3 py-2 font-mono text-xs font-medium uppercase text-mist">
          {t.admin.auditBefore}
        </div>
        {changes.map((c) => (
          <FieldRow key={`${c.field}-before`} field={c.field} value={c.before} muted />
        ))}
      </div>
      {/* After column */}
      <div className="flex-1">
        <div className="bg-steel px-3 py-2 font-mono text-xs font-medium uppercase text-mist">
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
      className={`border-t border-line px-3 py-2 ${
        highlight ? "bg-warn/10" : "bg-card"
      }`}
    >
      <div className="font-mono text-xs text-mist">{field}</div>
      <div
        className={`mt-0.5 ${
          muted
            ? "text-mist line-through"
            : highlight
              ? "font-medium text-foreground"
              : "text-foreground"
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
    <div className="relative ps-12">
      {/* marker */}
      <span
        className={`absolute start-[9px] top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${
          ACTION_TILE[entry.action] ?? "bg-steel"
        }`}
      >
        <Icon className="h-3.5 w-3.5 text-ink" strokeWidth={1.75} />
      </span>

      <div className="rounded-2xl border border-line bg-card p-4">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-arc/10 text-xs font-medium text-arc">
              {entry.actorInitials}
            </span>
            <span className="text-sm font-medium text-foreground">{entry.actorName}</span>
            <span className="rounded-full bg-steel px-2 py-0.5 text-xs text-mist">
              {entry.actorRole}
            </span>
          </div>
          <span className="shrink-0 font-mono text-xs text-mist ltr-in-rtl">{entry.when}</span>
        </div>

        {/* Second row */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{entry.summary}</span>
          <span className="rounded-full border border-line bg-steel px-1.5 py-0.5 font-mono text-xs text-mist ltr-in-rtl">
            #{entry.targetRowId}
          </span>
        </div>

        {/* Third row: expandable */}
        {entry.changes && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-arc transition-colors hover:underline"
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
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
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-line bg-background/95 px-6 py-3 backdrop-blur">
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
          dotColors={["var(--ok)", "var(--arc)", "var(--err)"]}
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
        <div className="relative ms-auto min-w-[220px] flex-1 sm:flex-none">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" strokeWidth={1.75} />
          <input
            type="text"
            placeholder={t.admin.auditFilterBar.searchId}
            className="w-full rounded-lg border border-line bg-card py-2 ps-9 pe-3 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none ltr-in-rtl dark:bg-ink"
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
          <span className="absolute bottom-2 start-[21px] top-2 w-px bg-line" aria-hidden />

          <div className="flex flex-col gap-4">
            {entries && entries.length > 0 ? (
              entries.map((entry, idx) => (
                <TimelineEntry key={entry.id} entry={entry} defaultExpanded={idx === 0} t={t} />
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-muted-foreground">
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
