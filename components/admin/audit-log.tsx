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

type Action = "insert" | "update" | "delete"

const actionMeta: Record<
  Action,
  { color: string; label: string; Icon: typeof Plus }
> = {
  insert: { color: "#059669", label: "Insert", Icon: Plus },
  update: { color: "#2563EB", label: "Update", Icon: Pencil },
  delete: { color: "#DC2626", label: "Delete", Icon: Trash2 },
}

type Entry = {
  id: string
  action: Action
  actor: string
  initials: string
  role: string
  summary: string
  rowId: string
  when: string
  changes?: { field: string; before: string; after: string }[]
}

const todayEntries: Entry[] = [
  {
    id: "1",
    action: "update",
    actor: "Dr. Alana Reyes",
    initials: "AR",
    role: "Doctor",
    summary: "Updated a Billing record",
    rowId: "#a1b2…9f3c",
    when: "2m ago",
    changes: [
      { field: "payment_status", before: "unpaid", after: "paid" },
      { field: "amount_paid", before: "0.00", after: "150.00" },
    ],
  },
  {
    id: "2",
    action: "insert",
    actor: "Maria Cruz",
    initials: "MC",
    role: "Receptionist",
    summary: "Inserted a Patient record",
    rowId: "#7d4e…1a08",
    when: "18m ago",
  },
]

const yesterdayEntries: Entry[] = [
  {
    id: "3",
    action: "delete",
    actor: "James Okafor",
    initials: "JO",
    role: "Admin",
    summary: "Deleted an Appointment record",
    rowId: "#c9f0…52bd",
    when: "1d ago",
  },
  {
    id: "4",
    action: "update",
    actor: "Dr. Neil Kapoor",
    initials: "NK",
    role: "Doctor",
    summary: "Updated a Prescription record",
    rowId: "#e3a7…88c1",
    when: "1d ago",
  },
]

function Dropdown({ label, dotColors }: { label: string; dotColors?: string[] }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] transition-colors hover:border-[#0F766E]"
    >
      {dotColors && (
        <span className="flex items-center gap-0.5">
          {dotColors.map((c) => (
            <span key={c} className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </span>
      )}
      {label}
      <ChevronDown className="h-4 w-4 text-[#6B7280]" strokeWidth={1.5} />
    </button>
  )
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="relative flex justify-center py-2">
      <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#6B7280]">
        {label}
      </span>
    </div>
  )
}

function ChangeDiff({ changes }: { changes: NonNullable<Entry["changes"]> }) {
  return (
    <div className="mt-3 flex gap-px overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#E5E7EB] text-sm">
      {/* Before column */}
      <div className="flex-1">
        <div className="bg-[#F9FAFB] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
          Before
        </div>
        {changes.map((c) => (
          <FieldRow key={`${c.field}-before`} field={c.field} value={c.before} muted />
        ))}
      </div>
      {/* After column */}
      <div className="flex-1">
        <div className="bg-[#F9FAFB] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
          After
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
    <div className={`border-t border-[#E5E7EB] px-3 py-2 ${highlight ? "bg-[#D97706]/[0.12]" : "bg-white"}`}>
      <div className="font-mono text-xs text-[#6B7280]">{field}</div>
      <div
        className={`mt-0.5 ${
          muted
            ? "text-[#6B7280] line-through"
            : highlight
              ? "font-medium text-[#111827]"
              : "text-[#111827]"
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function TimelineEntry({ entry, defaultExpanded }: { entry: Entry; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(!!defaultExpanded)
  const meta = actionMeta[entry.action]
  const { Icon } = meta

  return (
    <div className="relative pl-12">
      {/* marker */}
      <span
        className="absolute left-[9px] top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-[#F9FAFB]"
        style={{ backgroundColor: meta.color }}
      >
        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2} />
      </span>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_8px_rgba(17,24,39,0.06)]">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F766E]/[0.12] text-xs font-medium text-[#0F766E]">
              {entry.initials}
            </span>
            <span className="text-sm font-medium text-[#111827]">{entry.actor}</span>
            <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-xs text-[#6B7280]">
              {entry.role}
            </span>
          </div>
          <span className="shrink-0 text-xs text-[#6B7280]">{entry.when}</span>
        </div>

        {/* Second row */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-[#111827]">{entry.summary}</span>
          <span className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-1.5 py-0.5 font-mono text-xs text-[#6B7280]">
            {entry.rowId}
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
              View changes
            </button>
            {expanded && <ChangeDiff changes={entry.changes} />}
          </>
        )}
      </div>
    </div>
  )
}

export function AuditLog() {
  return (
    <div className="flex flex-col">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] bg-[#F9FAFB]/95 px-6 py-3 backdrop-blur">
        <Dropdown label="All Tables" />
        <Dropdown label="All Actions" dotColors={["#059669", "#2563EB", "#DC2626"]} />
        <Dropdown label="All Staff" />
        <Dropdown label="Last 30 days" />
        <div className="relative ml-auto min-w-[220px] flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by record ID…"
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
          />
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="p-6">
        <div className="relative mx-auto max-w-3xl">
          {/* connector line */}
          <span className="absolute bottom-2 left-[21px] top-2 w-px bg-[#E5E7EB]" aria-hidden />

          <div className="flex flex-col gap-4">
            <DateDivider label="Today" />
            <TimelineEntry entry={todayEntries[0]} defaultExpanded />
            <TimelineEntry entry={todayEntries[1]} />

            <DateDivider label="Yesterday" />
            <TimelineEntry entry={yesterdayEntries[0]} />
            <TimelineEntry entry={yesterdayEntries[1]} />
          </div>
        </div>
      </div>
    </div>
  )
}
