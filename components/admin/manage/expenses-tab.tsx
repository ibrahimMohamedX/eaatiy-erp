"use client"

// ============================================================================
// Admin Panel: Expenses — full CRUD over clinic operating expenses
// ============================================================================

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import {
  getExpensesData,
  createExpense,
  updateExpense,
  deleteExpense,
  type ExpensesTabData,
} from "@/lib/actions/admin/manage-expenses"
import type { ExpenseRow } from "@/lib/db/repositories/expenses"
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

const CATEGORY_KEYS = [
  "rent",
  "supplies",
  "maintenance",
  "salaries",
  "utilities",
  "marketing",
  "equipment",
  "other",
] as const

const CATEGORY_TONE: Record<string, "ok" | "warn" | "err" | "arc" | "muted"> = {
  rent: "arc",
  supplies: "warn",
  maintenance: "muted",
  salaries: "err",
  utilities: "arc",
  marketing: "warn",
  equipment: "muted",
  other: "muted",
}

const EMPTY_FORM = {
  category: "other",
  description: "",
  amount: "0",
  expense_date: "",
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ExpensesTab() {
  const { t } = useT()
  const m = t.admin.manage

  const [data, setData] = useState<ExpensesTabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ExpenseRow | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getExpensesData()
    setLoading(false)
    if (res.success) {
      setData(res.data)
      setFeedback(null)
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, expense_date: today() })
    setModalOpen(true)
  }

  function openEdit(row: ExpenseRow) {
    setEditing(row)
    setForm({
      category: row.category,
      description: row.description,
      amount: String(row.amount),
      expense_date: row.expense_date,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      category: form.category as (typeof CATEGORY_KEYS)[number],
      description: form.description,
      amount: Number.parseFloat(form.amount) || 0,
      expense_date: form.expense_date,
    }
    const res = editing ? await updateExpense(editing.id, payload) : await createExpense(payload)
    setSaving(false)
    if (res.success) {
      setModalOpen(false)
      setFeedback({ message: m.savedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(m.confirmDelete)) return
    const res = await deleteExpense(id)
    if (res.success) {
      setFeedback({ message: m.deletedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  const expenses = data?.expenses ?? []
  const totals = data?.totals

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Totals + category breakdown */}
      {totals && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="font-mono text-[11px] font-medium uppercase text-mist">{m.expenseTotal}</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-err ltr-in-rtl">
              {totals.totalAmount.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {m.expenseCount.replace("{count}", String(totals.count))}
            </p>
          </div>
          {totals.byCategory.slice(0, 3).map((c) => (
            <div key={c.category} className="rounded-2xl border border-line bg-card p-5">
              <p className="font-mono text-[11px] font-medium uppercase text-mist">
                {m.expenseCategories[c.category as keyof typeof m.expenseCategories] ?? c.category}
              </p>
              <p className="mt-1.5 font-mono text-xl font-semibold text-foreground ltr-in-rtl">
                {c.total.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {m.expenseCount.replace("{count}", String(c.count))}
              </p>
            </div>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-line bg-card">
        <PanelHeader
          title={m.expensesTitle}
          subtitle={m.expensesSubtitle}
          action={
            <ArcButton onClick={openCreate} disabled={loading}>
              <Plus className="size-4" strokeWidth={1.75} />
              {m.addExpense}
            </ArcButton>
          }
        />
        {feedback && (
          <div className="pt-3">
            <FeedbackLine message={feedback.message} tone={feedback.tone} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {m.expenseCols.map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">{m.actions}</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{row.expense_date}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={CATEGORY_TONE[row.category] ?? "muted"}>
                        {m.expenseCategories[row.category as keyof typeof m.expenseCategories] ?? row.category}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{row.description}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-err ltr-in-rtl">
                      {row.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
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
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {loading ? m.loading : m.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <PanelModal
        title={editing ? m.editExpense : m.addExpense}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>{m.expenseCols[1]}</FieldLabel>
            <SelectInput
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORY_KEYS.map((k) => (
                <option key={k} value={k}>
                  {m.expenseCategories[k]}
                </option>
              ))}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>{m.expenseCols[2]}</FieldLabel>
            <TextInput
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>{m.expenseAmount}</FieldLabel>
              <TextInput
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                inputMode="decimal"
              />
            </div>
            <div>
              <FieldLabel>{m.expenseDate}</FieldLabel>
              <TextInput
                type="date"
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <GhostButton onClick={() => setModalOpen(false)}>{m.cancel}</GhostButton>
            <ArcButton onClick={() => void handleSave()} disabled={saving}>
              {m.save}
            </ArcButton>
          </div>
        </div>
      </PanelModal>
    </div>
  )
}
