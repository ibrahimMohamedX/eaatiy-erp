"use client"

// ============================================================================
// Admin Panel: Supervisors — accounts + per-section access matrix
// ============================================================================
// The admin creates supervisor accounts (via manage-accounts) and grants
// each one view/edit rights per clinic section. The /supervisor portal
// renders ONLY the sections granted here.
// ============================================================================

import { useCallback, useEffect, useState } from "react"
import { Plus, Trash2, Eye, Pencil } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import {
  getSupervisorsData,
  saveSupervisorScope,
  deleteSupervisorScope,
  type SupervisorsTabData,
} from "@/lib/actions/admin/manage-supervisors"
import {
  createAccount,
  deleteAccount,
} from "@/lib/actions/admin/manage-accounts"
import type { SupervisorScopeRow } from "@/lib/db/repositories/supervisor-scopes"
import {
  PanelHeader,
  PanelModal,
  FieldLabel,
  TextInput,
  ArcButton,
  GhostButton,
  DangerButton,
  StatusPill,
  FeedbackLine,
} from "./ui"

type Feedback = { message: string; tone: "ok" | "err" } | null

const SECTION_KEYS = [
  "queue",
  "patients",
  "appointments",
  "expenses",
  "salaries",
  "staff",
  "shifts",
] as const

export function SupervisorsTab() {
  const { t } = useT()
  const m = t.admin.manage

  const [data, setData] = useState<SupervisorsTabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Feedback>(null)

  // -- create supervisor modal
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ full_name: "", email: "", password: "", monthly_salary: "0" })
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getSupervisorsData()
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

  async function handleCreateSupervisor() {
    setSaving(true)
    const res = await createAccount({
      email: form.email,
      full_name: form.full_name,
      role: "supervisor",
      password: form.password,
      create_staff_record: true,
      monthly_salary: Number.parseFloat(form.monthly_salary) || 0,
    })
    setSaving(false)
    if (res.success) {
      setModalOpen(false)
      setForm({ full_name: "", email: "", password: "", monthly_salary: "0" })
      setFeedback({ message: m.savedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleDeleteSupervisor(userId: string) {
    if (!window.confirm(m.confirmDelete)) return
    const res = await deleteAccount(userId)
    if (res.success) {
      setFeedback({ message: m.deletedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleToggleScope(
    supervisorId: string,
    section: string,
    field: "can_view" | "can_edit",
    next: boolean,
  ) {
    // read current grants for this supervisor+section
    const existing = (data?.scopes ?? []).find(
      (s) => s.user_id === supervisorId && s.section === section,
    )
    let can_view = existing?.can_view ?? false
    let can_edit = existing?.can_edit ?? false
    if (field === "can_view") {
      can_view = next
      if (!next) can_edit = false // edit implies view
    } else {
      can_edit = next
      if (next) can_view = true
    }

    const res = await saveSupervisorScope({
      user_id: supervisorId,
      section,
      can_view,
      can_edit,
    })
    if (res.success) {
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleRemoveGrant(row: SupervisorScopeRow) {
    const res = await deleteSupervisorScope(row.id)
    if (res.success) {
      setFeedback({ message: m.deletedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  const supervisors = data?.supervisors ?? []
  const scopes = data?.scopes ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="rounded-2xl border border-line bg-card">
        <PanelHeader
          title={m.supervisorsTitle}
          subtitle={m.supervisorsSubtitle}
          action={
            <ArcButton onClick={() => setModalOpen(true)} disabled={loading}>
              <Plus className="size-4" strokeWidth={1.75} />
              {m.addSupervisor}
            </ArcButton>
          }
        />
        {feedback && (
          <div className="pt-3">
            <FeedbackLine message={feedback.message} tone={feedback.tone} />
          </div>
        )}

        {supervisors.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {loading ? m.loading : m.noSupervisors}
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-5">
            {supervisors.map((sup) => {
              const grants = scopes.filter((s) => s.user_id === sup.id)
              return (
                <div key={sup.id} className="rounded-xl border border-line bg-steel/30 p-5 dark:bg-ink/40">
                  {/* supervisor header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-arc text-xs font-semibold text-carbon">
                        {sup.full_name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                      <div className="leading-tight">
                        <p className="text-sm font-semibold text-foreground">{sup.full_name}</p>
                        <p className="font-mono text-xs text-mist ltr-in-rtl">{sup.email}</p>
                      </div>
                      <StatusPill tone={sup.is_active ? "ok" : "err"}>
                        {sup.is_active ? m.active : m.inactive}
                      </StatusPill>
                    </div>
                    <DangerButton onClick={() => void handleDeleteSupervisor(sup.id)}>
                      <Trash2 className="size-3.5" strokeWidth={1.75} />
                      {m.remove}
                    </DangerButton>
                  </div>

                  {/* access matrix */}
                  <div className="mt-4">
                    <p className="archai-eyebrow !text-mist">{m.grantMatrix}</p>
                    <div className="mt-2.5 overflow-x-auto">
                      <table className="w-full min-w-[520px] border-collapse text-start">
                        <thead>
                          <tr className="border-b border-line">
                            <th className="px-3 py-2 font-mono text-[11px] font-medium uppercase text-mist">
                              {m.sectionCol}
                            </th>
                            <th className="w-24 px-3 py-2 font-mono text-[11px] font-medium uppercase text-mist">
                              {m.canView}
                            </th>
                            <th className="w-24 px-3 py-2 font-mono text-[11px] font-medium uppercase text-mist">
                              {m.canEdit}
                            </th>
                            <th className="w-20 px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {SECTION_KEYS.map((section) => {
                            const grant = grants.find((g) => g.section === section)
                            return (
                              <tr key={section} className="border-b border-line last:border-b-0">
                                <td className="px-3 py-2.5 text-sm text-foreground">
                                  {m.sectionLabels[section]}
                                </td>
                                <td className="px-3 py-2.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleToggleScope(sup.id, section, "can_view", !grant?.can_view)
                                    }
                                    aria-label={m.canView}
                                    className={`flex size-7 items-center justify-center rounded-lg transition-colors duration-200 ${
                                      grant?.can_view
                                        ? "bg-arc/15 text-arc"
                                        : "bg-steel/50 text-mist hover:bg-accent dark:bg-ink/50"
                                    }`}
                                  >
                                    {grant?.can_view ? (
                                      <Eye className="size-4" strokeWidth={1.75} />
                                    ) : (
                                      <span className="size-2 rounded-full bg-current opacity-40" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-3 py-2.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleToggleScope(sup.id, section, "can_edit", !grant?.can_edit)
                                    }
                                    aria-label={m.canEdit}
                                    disabled={!grant?.can_view && !grant?.can_edit}
                                    className={`flex size-7 items-center justify-center rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
                                      grant?.can_edit
                                        ? "bg-arc/15 text-arc"
                                        : "bg-steel/50 text-mist hover:bg-accent dark:bg-ink/50"
                                    }`}
                                  >
                                    {grant?.can_edit ? (
                                      <Pencil className="size-4" strokeWidth={1.75} />
                                    ) : (
                                      <span className="size-2 rounded-full bg-current opacity-40" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-3 py-2.5">
                                  {grant && (
                                    <GhostButton onClick={() => void handleRemoveGrant(grant)}>
                                      {m.remove}
                                    </GhostButton>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Create supervisor modal */}
      <PanelModal title={m.addSupervisor} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>{m.staffName}</FieldLabel>
            <TextInput
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>{m.accountEmail}</FieldLabel>
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@clinic.com"
            />
          </div>
          <div>
            <FieldLabel>{m.accountPassword}</FieldLabel>
            <TextInput
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>{m.staffSalary}</FieldLabel>
            <TextInput
              value={form.monthly_salary}
              onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
              inputMode="decimal"
            />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <GhostButton onClick={() => setModalOpen(false)}>{m.cancel}</GhostButton>
            <ArcButton
              onClick={() => void handleCreateSupervisor()}
              disabled={saving || !form.full_name || !form.email || !form.password}
            >
              {m.save}
            </ArcButton>
          </div>
        </div>
      </PanelModal>
    </div>
  )
}
