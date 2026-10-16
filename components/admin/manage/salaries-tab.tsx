"use client"

// ============================================================================
// Admin Panel: Salaries — full CRUD + payroll lifecycle
// ============================================================================

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Trash2, BadgeCheck, Banknote } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import {
  getSalariesData,
  createSalary,
  updateSalary,
  setSalaryStatus,
  deleteSalary,
  type SalariesTabData,
} from "@/lib/actions/admin/manage-salaries"
import type { SalaryRow } from "@/lib/db/repositories/salaries"
import {
  PanelHeader,
  PanelModal,
  FieldLabel,
  TextInput,
  SelectInput,
  ArcButton,
  GhostButton,
  DangerButton,
  StatusPill,
  FeedbackLine,
} from "./ui"

type Feedback = { message: string; tone: "ok" | "err" } | null

const EMPTY_FORM = {
  staff_member_id: "",
  period_month: "",
  base_amount: "0",
  bonuses: "0",
  deductions: "0",
  notes: "",
}

/** current month first-day, e.g. "2026-10-01" */
function currentMonthFirst(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
}

const STATUS_TONE: Record<string, "ok" | "warn" | "arc" | "muted"> = {
  draft: "warn",
  approved: "arc",
  paid: "ok",
}

export function SalariesTab() {
  const { t } = useT()
  const m = t.admin.manage

  const [data, setData] = useState<SalariesTabData | null>(null)
  const [periodFilter, setPeriodFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SalaryRow | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getSalariesData(periodFilter || undefined)
    setLoading(false)
    if (res.success) {
      setData(res.data)
      setFeedback(null)
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }, [periodFilter])

  useEffect(() => {
    void reload()
  }, [reload])

  function openCreate() {
    setEditing(null)
    setForm({
      ...EMPTY_FORM,
      staff_member_id: data?.staff[0]?.id ?? "",
      period_month: currentMonthFirst(),
    })
    setModalOpen(true)
  }

  function openEdit(row: SalaryRow) {
    setEditing(row)
    setForm({
      staff_member_id: row.staff_member_id,
      period_month: row.period_month,
      base_amount: String(row.base_amount),
      bonuses: String(row.bonuses),
      deductions: String(row.deductions),
      notes: row.notes ?? "",
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      staff_member_id: form.staff_member_id,
      period_month: form.period_month,
      base_amount: Number.parseFloat(form.base_amount) || 0,
      bonuses: Number.parseFloat(form.bonuses) || 0,
      deductions: Number.parseFloat(form.deductions) || 0,
      notes: form.notes || null,
    }
    const res = editing ? await updateSalary(editing.id, payload) : await createSalary(payload)
    setSaving(false)
    if (res.success) {
      setModalOpen(false)
      setFeedback({ message: m.savedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleStatus(row: SalaryRow, status: "approved" | "paid") {
    const res = await setSalaryStatus(row.id, status)
    if (res.success) {
      setFeedback({ message: m.savedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(m.confirmDelete)) return
    const res = await deleteSalary(id)
    if (res.success) {
      setFeedback({ message: m.deletedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  const salaries = data?.salaries ?? []
  const staff = data?.staff ?? []
  const totals = data?.totals
  const periods = Array.from(new Set(salaries.map((s) => s.period_month))).sort().reverse()

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Totals strip */}
      {totals && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="font-mono text-[11px] font-medium uppercase text-mist">{m.salaryTotalNet}</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground ltr-in-rtl">
              {totals.totalNet.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="font-mono text-[11px] font-medium uppercase text-mist">{m.salaryTotalPaid}</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-ok ltr-in-rtl">
              {totals.totalPaid.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="font-mono text-[11px] font-medium uppercase text-mist">{m.salaryTotalPending}</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-warn ltr-in-rtl">
              {totals.totalPending.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-line bg-card">
        <PanelHeader
          title={m.salariesTitle}
          subtitle={m.salariesSubtitle}
          action={
            <ArcButton onClick={openCreate} disabled={loading || staff.length === 0}>
              <Plus className="size-4" strokeWidth={1.75} />
              {m.addSalary}
            </ArcButton>
          }
        />
        {feedback && (
          <div className="pt-3">
            <FeedbackLine message={feedback.message} tone={feedback.tone} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {m.salaryCols.map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">{m.actions}</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length > 0 ? (
                salaries.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 text-[15px] font-semibold text-foreground">{row.staff_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{row.period_month}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground ltr-in-rtl">
                      {row.base_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ok ltr-in-rtl">
                      {row.bonuses.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-err ltr-in-rtl">
                      {row.deductions.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground ltr-in-rtl">
                      {row.net_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone={STATUS_TONE[row.status] ?? "muted"}>
                        {m.salaryStatuses[row.status as keyof typeof m.salaryStatuses] ?? row.status}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {row.status === "draft" && (
                          <GhostButton onClick={() => void handleStatus(row, "approved")}>
                            <BadgeCheck className="size-3.5" strokeWidth={1.75} />
                            {m.approve}
                          </GhostButton>
                        )}
                        {row.status !== "paid" && (
                          <GhostButton onClick={() => void handleStatus(row, "paid")}>
                            <Banknote className="size-3.5" strokeWidth={1.75} />
                            {m.markPaid}
                          </GhostButton>
                        )}
                        <GhostButton onClick={() => openEdit(row)} aria-label={m.edit}>
                          <Pencil className="size-3.5" strokeWidth={1.75} />
                        </GhostButton>
                        <DangerButton onClick={() => void handleDelete(row.id)} aria-label={m.remove}>
                          <Trash2 className="size-3.5" strokeWidth={1.75} />
                        </DangerButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {loading ? m.loading : m.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <PanelModal
        title={editing ? m.editSalary : m.addSalary}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>{m.salaryCols[0]}</FieldLabel>
            <SelectInput
              value={form.staff_member_id}
              onChange={(e) => setForm({ ...form, staff_member_id: e.target.value })}
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>{m.salaryPeriod}</FieldLabel>
            <TextInput
              type="month"
              value={form.period_month.slice(0, 7)}
              onChange={(e) => setForm({ ...form, period_month: `${e.target.value}-01` })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel>{m.salaryBase}</FieldLabel>
              <TextInput
                value={form.base_amount}
                onChange={(e) => setForm({ ...form, base_amount: e.target.value })}
                inputMode="decimal"
              />
            </div>
            <div>
              <FieldLabel>{m.salaryBonuses}</FieldLabel>
              <TextInput
                value={form.bonuses}
                onChange={(e) => setForm({ ...form, bonuses: e.target.value })}
                inputMode="decimal"
              />
            </div>
            <div>
              <FieldLabel>{m.salaryDeductions}</FieldLabel>
              <TextInput
                value={form.deductions}
                onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                inputMode="decimal"
              />
            </div>
          </div>
          <div>
            <FieldLabel>{m.staffNotes}</FieldLabel>
            <TextInput
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <GhostButton onClick={() => setModalOpen(false)}>{m.cancel}</GhostButton>
            <ArcButton onClick={() => void handleSave()} disabled={saving || !form.staff_member_id}>
              {m.save}
            </ArcButton>
          </div>
        </div>
      </PanelModal>
    </div>
  )
}
