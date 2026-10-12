"use client"

import { useState, useTransition } from "react"
import { Trash2, Minus, Plus, ChevronDown, Search, Printer } from "lucide-react"
import { createPrescription } from "@/lib/actions/doctor/create-prescription"
import { useT } from "@/lib/i18n/use-t"
import type { Patient, MedicalRecord, PrescriptionItem } from "@/lib/types"

type Props = {
  patient: Patient
  medicalRecord?: MedicalRecord
  /** Called after a successful mutation so the workspace can refresh data */
  onMutated: () => void
}

type MedicineEntry = {
  query: string
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  unit: "days" | "weeks"
}

function emptyEntry(): MedicineEntry {
  return {
    query: "",
    medicineName: "",
    dosage: "",
    frequency: "",
    duration: "7",
    unit: "days",
  }
}

const fieldLabel = "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]"

function PrescriptionRow({
  entry,
  onChange,
  onRemove,
  freqOptions,
  t,
}: {
  entry: MedicineEntry
  onChange: (e: MedicineEntry) => void
  onRemove: () => void
  freqOptions: string[]
  t: Record<string, any>
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-[#374151] dark:bg-[#1F2937]">
      <div className="flex items-start gap-2.5">
        {/* Medicine Name */}
        <div className="min-w-[130px] flex-1">
          <label className={fieldLabel}>{t.doctor.medicineName}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
            <input
              type="text"
              value={entry.medicineName}
              onChange={(e) => onChange({ ...entry, medicineName: e.target.value })}
              className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-2 text-sm text-[#111827] outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB]"
            />
          </div>
        </div>

        {/* Dosage */}
        <div className="w-20 shrink-0">
          <label className={fieldLabel}>{t.doctor.dosage}</label>
          <input
            type="text"
            value={entry.dosage}
            onChange={(e) => onChange({ ...entry, dosage: e.target.value })}
            className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB]"
          />
        </div>

        {/* Frequency chips */}
        <div className="w-[168px] shrink-0">
          <label className={fieldLabel}>{t.doctor.frequency}</label>
          <div className="flex flex-wrap gap-1.5">
            {freqOptions.map((f) => {
              const selected = f === entry.frequency
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => onChange({ ...entry, frequency: selected ? "" : f })}
                  className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                    selected
                      ? "bg-[#0F766E] font-medium text-white"
                      : "border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
                  }`}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        {/* Duration stepper + unit */}
        <div className="w-[150px] shrink-0">
          <label className={fieldLabel}>{t.doctor.duration}</label>
          <div className="flex items-center gap-1.5">
            <div className="flex h-9 items-center rounded-lg border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
              <button
                type="button"
                onClick={() =>
                  onChange({ ...entry, duration: String(Math.max(1, Number(entry.duration) - 1)) })
                }
                className="grid h-full w-8 place-items-center text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <input
                type="text"
                value={entry.duration}
                onChange={(e) => onChange({ ...entry, duration: e.target.value })}
                className="h-full w-8 border-x border-[#E5E7EB] bg-white text-center text-sm text-[#111827] outline-none dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB]"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({ ...entry, duration: String(Number(entry.duration) + 1) })
                }
                className="grid h-full w-8 place-items-center text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="relative">
              <select
                value={entry.unit}
                onChange={(e) => onChange({ ...entry, unit: e.target.value as "days" | "weeks" })}
                className="h-9 appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 text-sm text-[#111827] outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB]"
              >
                <option value="days">{t.doctor.days}</option>
                <option value="weeks">{t.doctor.weeks}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Trash */}
        <div className="shrink-0 pt-6">
          <button
            type="button"
            aria-label={t.doctor.removeMedicine}
            onClick={onRemove}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:border-[#DC2626] dark:hover:text-[#DC2626]"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function PrescriptionsTab({ patient, medicalRecord, onMutated }: Props) {
  const { t } = useT()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<MedicineEntry[]>([emptyEntry()])

  const freqOptions: string[] = t.doctor.frequencyOptions

  function updateEntry(index: number, updated: MedicineEntry) {
    setEntries((prev) => prev.map((e, i) => (i === index ? updated : e)))
  }

  function removeEntry(index: number) {
    setEntries((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  function addEntry() {
    setEntries((prev) => [...prev, emptyEntry()])
  }

  function handleSave() {
    if (!medicalRecord) return
    setError(null)

    const items: PrescriptionItem[] = entries
      .filter((e) => e.medicineName.trim())
      .map((e) => ({
        medicine_name: e.medicineName.trim(),
        dosage: e.dosage.trim(),
        frequency: e.frequency.trim(),
        duration: Number(e.duration) || 1,
        duration_unit: e.unit,
      }))

    if (items.length === 0) {
      setError("Add at least one medicine.")
      return
    }

    startTransition(async () => {
      const result = await createPrescription({
        medical_record_id: medicalRecord.id,
        patient_id: patient.id,
        items,
      })
      if (result.success) {
        onMutated()
      } else {
        setError(result.error)
      }
    })
  }

  // Build preview lines from current entries
  const previewItems = entries.filter((e) => e.medicineName.trim())

  return (
    <div className="flex flex-col">
      <div className="flex gap-6 p-4">
        {/* FORM SIDE — 70% */}
        <div className="w-[70%] space-y-3">
          {entries.map((entry, idx) => (
            <PrescriptionRow
              key={idx}
              entry={entry}
              onChange={(updated) => updateEntry(idx, updated)}
              onRemove={() => removeEntry(idx)}
              freqOptions={freqOptions}
              t={t}
            />
          ))}

          <button
            type="button"
            onClick={addEntry}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] py-3 text-sm font-medium text-[#0F766E] transition-colors hover:border-[#0F766E] dark:border-[#374151]"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            {t.doctor.addMedicine}
          </button>
        </div>

        {/* PREVIEW SIDE — 30%, sticky */}
        <div className="w-[30%]">
          <div className="sticky top-40 rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-[#374151] dark:bg-[#1F2937]">
            <div className="border-b border-[#E5E7EB] pb-4 text-center dark:border-[#374151]">
              <p className="font-serif text-base font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.doctor.rxPreviewClinic}</p>
              <p className="mt-0.5 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.rxPreviewAddress}</p>
            </div>

            <div className="flex items-center justify-between py-4 text-xs">
              <div>
                <p className="text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.rxPreviewPatient}</p>
                <p className="font-medium text-[#111827] dark:text-[#F9FAFB]">{patient.full_name}</p>
              </div>
              <div className="text-right">
                <p className="text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.rxPreviewDate}</p>
                <p className="font-medium text-[#111827] dark:text-[#F9FAFB]">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="mb-2 font-serif text-2xl leading-none text-[#111827] dark:text-[#F9FAFB]">℞</div>

            {previewItems.length === 0 ? (
              <p className="font-serif text-sm italic text-[#9CA3AF]">{t.doctor.noNotes}</p>
            ) : (
              <ol className="space-y-3 font-serif text-sm text-[#111827] dark:text-[#F9FAFB]">
                {previewItems.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span>{idx + 1}.</span>
                    <div>
                      <p className="font-medium dark:text-[#F9FAFB]">{item.medicineName}</p>
                      <p className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">
                        {[item.dosage, item.frequency, `${item.duration} ${item.unit}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-8 border-t border-[#E5E7EB] pt-3 text-right dark:border-[#374151]">
              <p className="font-serif text-sm italic text-[#111827] dark:text-[#F9FAFB]">Dr. {patient.full_name.split(" ").slice(-1)[0] || ""}</p>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.rxPreviewSignature}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-xs text-[#DC2626] dark:border-[#7F1D1D] dark:bg-[#450A0A] dark:text-[#FCA5A5]">
          {error}
        </div>
      )}

      {/* Sticky footer */}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#E5E7EB] bg-white px-4 py-3 dark:border-[#374151] dark:bg-[#1F2937]">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB] dark:border-[#374151] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
        >
          <Printer className="h-4 w-4" strokeWidth={1.5} />
          {t.doctor.print}
        </button>
        <button
          type="button"
          disabled={isPending || !medicalRecord}
          onClick={handleSave}
          className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {t.doctor.savePrescription}
        </button>
      </div>
    </div>
  )
}