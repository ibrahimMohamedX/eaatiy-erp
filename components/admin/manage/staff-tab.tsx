"use client"

// ============================================================================
// Admin Panel: Staff — full CRUD over the staff registry + login accounts
// ============================================================================

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Trash2, UserRound, ShieldCheck, ShieldOff } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import {
  getStaffData,
  createStaff,
  updateStaff,
  deleteStaff,
  type StaffTabData,
} from "@/lib/actions/admin/manage-staff"
import {
  createAccount,
  setAccountActive,
  deleteAccount,
} from "@/lib/actions/admin/manage-accounts"
import type { StaffMemberRow } from "@/lib/db/repositories/staff-members"
import {
  PanelHeader,
  PanelModal,
  FieldLabel,
  TextInput,
  SelectInput,
  TextArea,
  ArcButton,
  GhostButton,
  DangerButton,
  StatusPill,
  FeedbackLine,
} from "./ui"

type Feedback = { message: string; tone: "ok" | "err" } | null

/** login-account rows as returned by getStaffData() */
type StaffAccountRow = StaffTabData["users"][number]

const STAFF_TYPE_KEYS = ["doctor", "receptionist", "supervisor", "cleaner", "security", "other"] as const
const ACCOUNT_ROLE_KEYS = ["doctor", "receptionist", "supervisor"] as const

export function StaffTab() {
  const { t } = useT()
  const m = t.admin.manage

  const [data, setData] = useState<StaffTabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Feedback>(null)

  // -- staff form state
  const [staffModalOpen, setStaffModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMemberRow | null>(null)
  const [form, setForm] = useState({
    full_name: "",
    staff_type: "other",
    job_title: "",
    phone: "",
    monthly_salary: "0",
    hired_at: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)

  // -- account form state
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [accountForm, setAccountForm] = useState({
    full_name: "",
    email: "",
    role: "doctor",
    password: "",
    create_staff_record: true,
    monthly_salary: "0",
  })

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getStaffData()
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

  function openCreateStaff() {
    setEditingStaff(null)
    setForm({
      full_name: "",
      staff_type: "other",
      job_title: "",
      phone: "",
      monthly_salary: "0",
      hired_at: "",
      notes: "",
    })
    setStaffModalOpen(true)
  }

  function openEditStaff(row: StaffMemberRow) {
    setEditingStaff(row)
    setForm({
      full_name: row.full_name,
      staff_type: row.staff_type,
      job_title: row.job_title ?? "",
      phone: row.phone ?? "",
      monthly_salary: String(row.monthly_salary),
      hired_at: row.hired_at ?? "",
      notes: row.notes ?? "",
    })
    setStaffModalOpen(true)
  }

  async function handleSaveStaff() {
    if (!form.full_name.trim()) {
      setFeedback({ message: m.staffName + " — " + m.save, tone: "err" })
      return
    }
    setSaving(true)
    const salary = Number.parseFloat(form.monthly_salary) || 0
    const res = editingStaff
      ? await updateStaff(editingStaff.id, {
          full_name: form.full_name,
          staff_type: form.staff_type as (typeof STAFF_TYPE_KEYS)[number],
          job_title: form.job_title || null,
          phone: form.phone || null,
          monthly_salary: salary,
          hired_at: form.hired_at || null,
          notes: form.notes || null,
        })
      : await createStaff({
          full_name: form.full_name,
          staff_type: form.staff_type as (typeof STAFF_TYPE_KEYS)[number],
          job_title: form.job_title || null,
          phone: form.phone || null,
          monthly_salary: salary,
          hired_at: form.hired_at || null,
          notes: form.notes || null,
        })
    setSaving(false)
    if (res.success) {
      setStaffModalOpen(false)
      setFeedback({ message: m.savedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleDeleteStaff(id: string) {
    if (!window.confirm(m.confirmDelete)) return
    const res = await deleteStaff(id)
    if (res.success) {
      setFeedback({ message: m.deletedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleCreateAccount() {
    setSaving(true)
    const res = await createAccount({
      email: accountForm.email,
      full_name: accountForm.full_name,
      role: accountForm.role as (typeof ACCOUNT_ROLE_KEYS)[number],
      password: accountForm.password,
      create_staff_record: accountForm.create_staff_record,
      monthly_salary: Number.parseFloat(accountForm.monthly_salary) || 0,
    })
    setSaving(false)
    if (res.success) {
      setAccountModalOpen(false)
      setFeedback({ message: m.savedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleToggleAccount(acc: StaffAccountRow) {
    const res = await setAccountActive(acc.id, !acc.is_active)
    if ("success" in res && res.success) {
      setFeedback({ message: m.savedOk, tone: "ok" })
      await reload()
    } else if (!res.success) {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  async function handleDeleteAccount(acc: StaffAccountRow) {
    if (!window.confirm(m.confirmDelete)) return
    const res = await deleteAccount(acc.id)
    if (res.success) {
      setFeedback({ message: m.deletedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  const staff = data?.staff ?? []
  const accounts = data?.users ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ================= Staff registry ================= */}
      <section className="rounded-2xl border border-line bg-card">
        <PanelHeader
          title={m.staffTitle}
          subtitle={m.staffSubtitle}
          action={
            <ArcButton onClick={openCreateStaff} disabled={loading}>
              <Plus className="size-4" strokeWidth={1.75} />
              {m.addStaff}
            </ArcButton>
          }
        />
        {feedback && (
          <div className="pt-3">
            <FeedbackLine message={feedback.message} tone={feedback.tone} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {m.staffCols.map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">{m.actions}</th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? (
                staff.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-steel text-[10px] font-semibold text-silver">
                          {row.full_name
                            .replace(/^Dr\.\s*/i, "")
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="text-[15px] font-semibold text-foreground">{row.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone={row.staff_type === "doctor" ? "arc" : "muted"}>
                        {m.staffTypes[row.staff_type as keyof typeof m.staffTypes] ?? row.staff_type}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{row.job_title ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{row.phone ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground ltr-in-rtl">
                      {row.monthly_salary.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{row.hired_at ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={row.is_active ? "ok" : "err"}>
                        {row.is_active ? m.active : m.inactive}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <GhostButton onClick={() => openEditStaff(row)} aria-label={m.edit}>
                          <Pencil className="size-3.5" strokeWidth={1.75} />
                        </GhostButton>
                        <DangerButton onClick={() => void handleDeleteStaff(row.id)} aria-label={m.remove}>
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

      {/* ================= Login accounts ================= */}
      <section className="rounded-2xl border border-line bg-card">
        <PanelHeader
          title={m.accountsTitle}
          subtitle={m.accountsSubtitle}
          action={
            <ArcButton onClick={() => setAccountModalOpen(true)} disabled={loading}>
              <Plus className="size-4" strokeWidth={1.75} />
              {m.addAccount}
            </ArcButton>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {m.accountCols.map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">{m.actions}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((acc) => (
                  <tr key={acc.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-steel text-[10px] font-semibold text-silver">
                          <UserRound className="size-3.5" strokeWidth={1.75} />
                        </span>
                        <span className="text-[15px] font-semibold text-foreground">{acc.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">{acc.email}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={acc.role === "admin" ? "warn" : "arc"}>
                        {m.accountRoles[acc.role as keyof typeof m.accountRoles] ?? acc.role}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone={acc.is_active ? "ok" : "err"}>
                        {acc.is_active ? m.active : m.inactive}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {acc.role !== "admin" && (
                          <>
                            <GhostButton onClick={() => void handleToggleAccount(acc)}>
                              {acc.is_active ? (
                                <ShieldOff className="size-3.5" strokeWidth={1.75} />
                              ) : (
                                <ShieldCheck className="size-3.5" strokeWidth={1.75} />
                              )}
                              {acc.is_active ? m.deactivate : m.activate}
                            </GhostButton>
                            <DangerButton onClick={() => void handleDeleteAccount(acc)} aria-label={m.remove}>
                              <Trash2 className="size-3.5" strokeWidth={1.75} />
                            </DangerButton>
                          </>
                        )}
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

      {/* ================= Staff create/edit modal ================= */}
      <PanelModal
        title={editingStaff ? m.editStaff : m.addStaff}
        open={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>{m.staffName}</FieldLabel>
            <TextInput
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Dr. / Mrs. …"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>{m.staffCols[1]}</FieldLabel>
              <SelectInput
                value={form.staff_type}
                onChange={(e) => setForm({ ...form, staff_type: e.target.value })}
              >
                {STAFF_TYPE_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {m.staffTypes[k]}
                  </option>
                ))}
              </SelectInput>
            </div>
            <div>
              <FieldLabel>{m.staffJobTitle}</FieldLabel>
              <TextInput
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>{m.staffPhone}</FieldLabel>
              <TextInput
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                inputMode="tel"
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
          </div>
          <div>
            <FieldLabel>{m.staffHiredAt}</FieldLabel>
            <TextInput
              type="date"
              value={form.hired_at}
              onChange={(e) => setForm({ ...form, hired_at: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>{m.staffNotes}</FieldLabel>
            <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <GhostButton onClick={() => setStaffModalOpen(false)}>{m.cancel}</GhostButton>
            <ArcButton onClick={() => void handleSaveStaff()} disabled={saving}>
              {m.save}
            </ArcButton>
          </div>
        </div>
      </PanelModal>

      {/* ================= Account create modal ================= */}
      <PanelModal title={m.addAccount} open={accountModalOpen} onClose={() => setAccountModalOpen(false)}>
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>{m.staffName}</FieldLabel>
            <TextInput
              value={accountForm.full_name}
              onChange={(e) => setAccountForm({ ...accountForm, full_name: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>{m.accountEmail}</FieldLabel>
            <TextInput
              type="email"
              value={accountForm.email}
              onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
              placeholder="name@clinic.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>{m.accountRole}</FieldLabel>
              <SelectInput
                value={accountForm.role}
                onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
              >
                {ACCOUNT_ROLE_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {m.accountRoles[k]}
                  </option>
                ))}
              </SelectInput>
            </div>
            <div>
              <FieldLabel>{m.staffSalary}</FieldLabel>
              <TextInput
                value={accountForm.monthly_salary}
                onChange={(e) => setAccountForm({ ...accountForm, monthly_salary: e.target.value })}
                inputMode="decimal"
              />
            </div>
          </div>
          <div>
            <FieldLabel>{m.accountPassword}</FieldLabel>
            <TextInput
              type="password"
              value={accountForm.password}
              onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={accountForm.create_staff_record}
              onChange={(e) => setAccountForm({ ...accountForm, create_staff_record: e.target.checked })}
              className="size-4 rounded border-line accent-[#2ED2FF]"
            />
            {m.createStaffRecord}
          </label>
          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <GhostButton onClick={() => setAccountModalOpen(false)}>{m.cancel}</GhostButton>
            <ArcButton onClick={() => void handleCreateAccount()} disabled={saving}>
              {m.save}
            </ArcButton>
          </div>
        </div>
      </PanelModal>
    </div>
  )
}
