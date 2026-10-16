"use client"

// ============================================================================
// Admin Panel: Shifts — full CRUD over weekly shift templates
// ============================================================================

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import {
  getShiftsData,
  createShift,
  updateShift,
  deleteShift,
  type ShiftsTabData,
} from "@/lib/actions/admin/manage-shifts"
import type { ShiftRow } from "@/lib/db/repositories/shifts"
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
  day_of_week: "0",
  start_time: "09:00",
  end_time: "17:00",
}

export function ShiftsTab() {
  const { t } = useT()
  const m = t.admin.manage

  const [data, setData] = useState<ShiftsTabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ShiftRow | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getShiftsData()
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
    setForm({
      ...EMPTY_FORM,
      staff_member_id: data?.staff[0]?.id ?? "",
    })
    setModalOpen(true)
  }

  function openEdit(row: ShiftRow) {
    setEditing(row)
    setForm({
      staff_member_id: row.staff_member_id,
      day_of_week: String(row.day_of_week),
      start_time: row.start_time.slice(0, 5),
      end_time: row.end_time.slice(0, 5),
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      staff_member_id: form.staff_member_id,
      day_of_week: Number.parseInt(form.day_of_week, 10),
      start_time: form.start_time,
      end_time: form.end_time,
    }
    const res = editing
      ? await updateShift(editing.id, payload)
      : await createShift(payload)
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
    const res = await deleteShift(id)
    if (res.success) {
      setFeedback({ message: m.deletedOk, tone: "ok" })
      await reload()
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  const shifts = data?.shifts ?? []
  const staff = data?.staff ?? []

  return (
    <div className="flex flex-col p-6">
      <section className="rounded-2xl border border-line bg-card">
        <PanelHeader
          title={m.shiftsTitle}
          subtitle={m.shiftsSubtitle}
          action={
            <ArcButton onClick={openCreate} disabled={loading || staff.length === 0}>
              <Plus className="size-4" strokeWidth={1.75} />
              {m.addShift}
            </ArcButton>
          }
        />
        {feedback && (
          <div className="pt-3">
            <FeedbackLine message={feedback.message} tone={feedback.tone} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {m.shiftCols.map((h: string) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist">{m.actions}</th>
              </tr>
            </thead>
            <tbody>
              {shifts.length > 0 ? (
                shifts.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <span className="text-[15px] font-semibold text-foreground">{row.staff_name}</span>
                      <span className="ms-2 align-middle">
                        <StatusPill tone="muted">
                          {m.staffTypes[row.staff_type as keyof typeof m.staffTypes] ?? row.staff_type}
                        </StatusPill>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {m.dayNames[row.day_of_week] ?? String(row.day_of_week)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground ltr-in-rtl">
                      {row.start_time.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground ltr-in-rtl">
                      {row.end_time.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone={row.is_active ? "ok" : "err"}>
                        {row.is_active ? m.active : m.inactive}
                      </StatusPill>
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
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {loading ? m.loading : m.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <PanelModal
        title={editing ? m.editShift : m.addShift}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>{m.shiftCols[0]}</FieldLabel>
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
            <FieldLabel>{m.shiftCols[1]}</FieldLabel>
            <SelectInput
              value={form.day_of_week}
              onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
            >
              {m.dayNames.map((d: string, i: number) => (
                <option key={d} value={String(i)}>
                  {d}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>{m.shiftCols[2]}</FieldLabel>
              <TextInput
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>{m.shiftCols[3]}</FieldLabel>
              <TextInput
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
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
