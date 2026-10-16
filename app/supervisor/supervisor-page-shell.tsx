"use client"

// ============================================================================
// Supervisor Portal Shell — renders ONLY admin-granted sections
// ============================================================================
// The section list comes from supervisor_scopes (admin-controlled). Each
// section's data is fetched through scope-gated server actions, so a
// supervisor physically cannot read a section the admin didn't grant.
// ============================================================================

import { useCallback, useEffect, useState } from "react"
import {
  Activity,
  ListChecks,
  Users,
  CalendarDays,
  Receipt,
  Wallet,
  UserCog,
  Clock,
  LogOut,
  RefreshCw,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT, resolveLabel } from "@/lib/i18n/use-t"
import { useAuth } from "@/lib/auth/auth-context"
import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import {
  getSupervisorSections,
  getSupervisorSectionData,
  supervisorCreateExpense,
  type SupervisorSectionsData,
  type SupervisorSectionPayload,
} from "@/lib/actions/supervisor/scoped-data"
import type { ExpenseRow } from "@/lib/db/repositories/expenses"
import type { ExpenseCategory } from "@/lib/db/schema/tenant/expenses"
import { StatusPill, FeedbackLine, ArcButton } from "@/components/admin/manage/ui"

const SECTION_ICONS: Record<string, LucideIcon> = {
  queue: ListChecks,
  patients: Users,
  appointments: CalendarDays,
  expenses: Receipt,
  salaries: Wallet,
  staff: UserCog,
  shifts: Clock,
}

const APPT_STATUS_PILL: Record<string, string> = {
  waiting: "bg-warn/10 text-warn",
  called: "bg-copper/10 text-copper",
  in_consultation: "bg-arc/10 text-arc",
  completed: "bg-ok/10 text-ok",
  cancelled: "bg-err/10 text-err",
}

type Feedback = { message: string; tone: "ok" | "err" } | null

export function SupervisorPageShell() {
  const { t } = useT()
  const auth = useAuth()

  const [scopeData, setScopeData] = useState<SupervisorSectionsData | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [payload, setPayload] = useState<SupervisorSectionPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [sectionLoading, setSectionLoading] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const loadScopes = useCallback(async () => {
    setLoading(true)
    const res = await getSupervisorSections()
    setLoading(false)
    if (res.success) {
      setScopeData(res.data)
      const first = res.data.sections[0] ?? null
      setActiveSection((prev) => (prev && res.data.sections.includes(prev) ? prev : first))
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }, [])

  useEffect(() => {
    void loadScopes()
  }, [loadScopes])

  const loadSection = useCallback(async (section: string) => {
    setSectionLoading(true)
    const res = await getSupervisorSectionData(section)
    setSectionLoading(false)
    if (res.success) {
      setPayload(res.data)
      setFeedback(null)
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }, [])

  useEffect(() => {
    if (activeSection) void loadSection(activeSection)
  }, [activeSection, loadSection])

  const sections = scopeData?.sections ?? []
  const scopes = scopeData?.scopes ?? []
  const canEditExpenses =
    scopes.find((s) => s.section === "expenses" && s.can_edit) !== undefined

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex h-screen w-[260px] shrink-0 flex-col border-e border-line bg-sidebar">
        <div className="flex items-center gap-2.5 border-b border-line p-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Activity className="size-[18px] text-primary-foreground" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-foreground">Meridian</span>
            <span className="block truncate text-xs text-mist">{t.supervisor.portalTitle}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="archai-eyebrow px-2 !text-mist">{t.supervisor.yourScope}</p>
          <ul className="mt-2.5 flex flex-col gap-1">
            {sections.length > 0 ? (
              sections.map((section) => {
                const Icon = SECTION_ICONS[section] ?? ListChecks
                const isActive = section === activeSection
                const label =
                  t.admin.manage.sectionLabels[
                    section as keyof typeof t.admin.manage.sectionLabels
                  ] ?? section
                return (
                  <li key={section}>
                    <button
                      type="button"
                      onClick={() => setActiveSection(section)}
                      className={
                        isActive
                          ? "relative flex h-10 w-full items-center gap-3 rounded-lg bg-accent px-3 text-sm font-medium text-foreground"
                          : "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                      }
                    >
                      {isActive && (
                        <span className="absolute start-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-arc" />
                      )}
                      <Icon
                        className={`size-[18px] ${isActive ? "text-arc" : ""}`}
                        strokeWidth={1.75}
                      />
                      {label}
                    </button>
                  </li>
                )
              })
            ) : (
              <li className="px-3 py-4 text-xs text-mist">{t.supervisor.noSections}</li>
            )}
          </ul>
        </nav>

        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-steel/40 p-3 dark:bg-ink/40">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-steel text-xs font-semibold text-silver">
              {auth.session?.fullName
                ? auth.session.fullName
                    .replace(/^Dr\.\s*/i, "")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()
                : "S"}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-medium text-foreground">
                {auth.session?.fullName ?? "—"}
              </span>
              <span className="block truncate text-xs text-mist">{t.supervisor.supervisorRole}</span>
            </div>
            <button
              type="button"
              onClick={() => auth.logout()}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-mist transition-colors duration-200 hover:bg-err/10 hover:text-err"
              aria-label={t.common.logOut}
              title={t.common.logOut}
            >
              <LogOut className="size-[18px]" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">
              {t.supervisor.portalTitle}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.supervisor.portalSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadScopes()}
            className="flex size-9 items-center justify-center rounded-lg border border-line text-mist transition-colors duration-200 hover:bg-accent hover:text-foreground"
            aria-label={t.supervisor.refresh}
            title={t.supervisor.refresh}
          >
            <RefreshCw className="size-4" strokeWidth={1.75} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {feedback && <FeedbackLine message={feedback.message} tone={feedback.tone} />}
          {loading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {t.admin.manage.loading}
            </p>
          ) : !activeSection ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {t.supervisor.noSections}
            </p>
          ) : sectionLoading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {t.admin.manage.loading}
            </p>
          ) : (
            payload && <SectionView payload={payload} canEditExpenses={canEditExpenses} onReload={() => activeSection && void loadSection(activeSection)} />
          )}
        </main>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section view — renders the payload's table
// ---------------------------------------------------------------------------

function SectionView({
  payload,
  canEditExpenses,
  onReload,
}: {
  payload: SupervisorSectionPayload
  canEditExpenses: boolean
  onReload: () => void
}) {
  const { t } = useT()
  const m = t.admin.manage

  if (payload.section === "queue" || payload.section === "appointments") {
    // Custom headers: #, Patient, Doctor, Time, Type, Status
    const headers = [
      t.admin.appointmentCols[0],
      t.receptionist.fullName,
      m.staffTypes.doctor,
      t.admin.appointmentCols[4],
      t.admin.appointmentCols[5],
      t.admin.appointmentCols[6],
    ]
    return (
      <section className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">
            {payload.section === "queue" ? t.admin.todaysAppointments : t.admin.tabs[2]}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t.admin.allDoctorsScheduled.replace("{count}", String(payload.appointments.length))}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {headers.map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.appointments.length > 0 ? (
                payload.appointments.map((a) => {
                  const meta =
                    APPOINTMENT_STATUS_META[a.status as keyof typeof APPOINTMENT_STATUS_META]
                  return (
                    <tr key={a.id} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{a.queueNumber}</td>
                      <td className="px-4 py-3 text-[15px] font-semibold text-foreground">{a.patientName}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{a.doctorName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">
                        {a.scheduledStart.slice(11, 16)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {a.type === "new" ? t.admin.typeNew : t.admin.typeFollowUp}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            APPT_STATUS_PILL[a.status] ?? "bg-steel text-silver"
                          }`}
                        >
                          {meta ? resolveLabel(meta.labelKey, t) : a.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {m.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (payload.section === "patients") {
    const headers = [
      t.receptionist.fullName,
      t.admin.appointmentCols[2], // Age
      t.receptionist.phone,
      t.receptionist.dateOfBirth,
    ]
    return (
      <section className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">
            {m.sectionLabels.patients}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {headers.map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.patients.length > 0 ? (
                payload.patients.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 text-[15px] font-semibold text-foreground">{p.full_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">
                      {deriveAge(p.date_of_birth)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{p.phone}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{p.date_of_birth}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {m.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (payload.section === "expenses") {
    return (
      <ExpensesScopeView
        expenses={payload.expenses}
        total={payload.totals.totalAmount}
        count={payload.totals.count}
        canEdit={canEditExpenses}
        onReload={onReload}
      />
    )
  }

  if (payload.section === "salaries") {
    return (
      <section className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">{m.salariesTitle}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {m.salaryCols.slice(0, 7).map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.salaries.length > 0 ? (
                payload.salaries.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 text-[15px] font-semibold text-foreground">{s.staff_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{s.period_month}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground ltr-in-rtl">{s.base_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ok ltr-in-rtl">{s.bonuses.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-err ltr-in-rtl">{s.deductions.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground ltr-in-rtl">{s.net_amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={s.status === "paid" ? "ok" : s.status === "approved" ? "arc" : "warn"}>
                        {m.salaryStatuses[s.status as keyof typeof m.salaryStatuses] ?? s.status}
                      </StatusPill>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {m.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (payload.section === "staff") {
    return (
      <section className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">{m.staffTitle}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {m.staffCols.slice(0, 6).map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.staff.length > 0 ? (
                payload.staff.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 text-[15px] font-semibold text-foreground">{s.full_name}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={s.staff_type === "doctor" ? "arc" : "muted"}>
                        {m.staffTypes[s.staff_type as keyof typeof m.staffTypes] ?? s.staff_type}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.job_title ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{s.phone ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground ltr-in-rtl">{s.monthly_salary.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{s.hired_at ?? "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {m.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (payload.section === "shifts") {
    return (
      <section className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">{m.shiftsTitle}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {m.shiftCols.slice(0, 4).map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.shifts.length > 0 ? (
                payload.shifts.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 text-[15px] font-semibold text-foreground">{s.staff_name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {m.dayNames[s.day_of_week] ?? String(s.day_of_week)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground ltr-in-rtl">{s.start_time.slice(0, 5)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground ltr-in-rtl">{s.end_time.slice(0, 5)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {m.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return null
}

// ---------------------------------------------------------------------------
// Expenses view — read-only + scoped "add" when the admin granted edit
// ---------------------------------------------------------------------------

function ExpensesScopeView({
  expenses,
  total,
  count,
  canEdit,
  onReload,
}: {
  expenses: ExpenseRow[]
  total: number
  count: number
  canEdit: boolean
  onReload: () => void
}) {
  const { t } = useT()
  const m = t.admin.manage
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<{
    category: ExpenseCategory
    description: string
    amount: string
    expense_date: string
  }>({ category: "other", description: "", amount: "0", expense_date: new Date().toISOString().slice(0, 10) })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Feedback>(null)

  const CATEGORY_KEYS = ["rent", "supplies", "maintenance", "salaries", "utilities", "marketing", "equipment", "other"] as const

  async function handleAdd() {
    setBusy(true)
    const res = await supervisorCreateExpense({
      category: form.category,
      description: form.description,
      amount: Number.parseFloat(form.amount) || 0,
      expense_date: form.expense_date,
    })
    setBusy(false)
    if (res.success) {
      setAdding(false)
      setMsg({ message: m.savedOk, tone: "ok" })
      onReload()
    } else {
      setMsg({ message: res.error, tone: "err" })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {msg && <FeedbackLine message={msg.message} tone={msg.tone} />}
      <div className="rounded-2xl border border-line bg-card p-5">
        <p className="font-mono text-[11px] font-medium uppercase text-mist">{m.expenseTotal}</p>
        <p className="mt-1.5 font-mono text-2xl font-semibold text-err ltr-in-rtl">{total.toFixed(2)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{m.expenseCount.replace("{count}", String(count))}</p>
      </div>

      <section className="rounded-2xl border border-line bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">{m.expensesTitle}</h3>
          {canEdit && !adding && (
            <ArcButton onClick={() => setAdding(true)}>
              {m.addExpense}
            </ArcButton>
          )}
        </div>

        {adding && (
          <div className="grid gap-4 border-b border-line p-5 sm:grid-cols-4">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase text-mist">
                {m.expenseCols[1]}
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as (typeof CATEGORY_KEYS)[number] })
                }
                className="w-full rounded-lg border border-line bg-steel/30 px-3 py-2 text-sm text-foreground dark:bg-ink/40"
              >
                {CATEGORY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {m.expenseCategories[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase text-mist">
                {m.expenseCols[2]}
              </label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-line bg-steel/30 px-3 py-2 text-sm text-foreground dark:bg-ink/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase text-mist">
                {m.expenseAmount}
              </label>
              <input
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                inputMode="decimal"
                className="w-full rounded-lg border border-line bg-steel/30 px-3 py-2 text-sm text-foreground dark:bg-ink/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase text-mist">
                {m.expenseDate}
              </label>
              <input
                type="date"
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                className="w-full rounded-lg border border-line bg-steel/30 px-3 py-2 text-sm text-foreground dark:bg-ink/40"
              />
            </div>
            <div className="flex items-end gap-2 sm:col-span-4">
              <button
                type="button"
                onClick={() => void handleAdd()}
                disabled={busy || !form.description}
                className="rounded-lg bg-arc px-4 py-2 text-sm font-semibold text-carbon transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
              >
                {m.save}
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                {m.cancel}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {m.expenseCols.map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{row.expense_date}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone="muted">
                        {m.expenseCategories[row.category as keyof typeof m.expenseCategories] ?? row.category}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{row.description}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-err ltr-in-rtl">
                      {row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {m.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
