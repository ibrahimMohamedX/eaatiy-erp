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

const fieldLabel = "mb-1.5 block text-xs font-medium text-silver"

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
    <div className="rounded-lg border border-line bg-card p-4">
      <div className="flex items-start gap-2.5">
        {/* Medicine Name */}
        <div className="min-w-[130px] flex-1">
          <label className={fieldLabel}>{t.doctor.medicineName}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-mist" strokeWidth={1.75} />
            <input
              type="text"
              value={entry.medicineName}
              onChange={(e) => onChange({ ...entry, medicineName: e.target.value })}
              className="h-12 w-full rounded-lg border border-line bg-card ps-8 pe-2 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none dark:bg-ink"
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
            className="h-12 w-full rounded-lg border border-line bg-card px-3 font-mono text-sm text-foreground transition-all duration-200 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none dark:bg-ink"
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
                  className={`rounded-full px-3 py-1.5 text-xs transition-colors duration-200 ${
                    selected
                      ? "border border-arc/60 bg-arc/10 font-medium text-arc"
                      : "border border-line text-muted-foreground hover:border-mist hover:text-foreground"
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
            <div className="flex h-12 items-center rounded-lg border border-line bg-card dark:bg-ink">
              <button
                type="button"
                onClick={() =>
                  onChange({ ...entry, duration: String(Math.max(1, Number(entry.duration) - 1)) })
                }
                className="grid h-full w-8 place-items-center text-mist transition-colors duration-200 hover:text-foreground"
              >
                <Minus className="size-3.5" strokeWidth={1.75} />
              </button>
              <input
                type="text"
                value={entry.duration}
                onChange={(e) => onChange({ ...entry, duration: e.target.value })}
                className="h-full w-8 border-x border-line bg-transparent text-center font-mono text-sm text-foreground outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({ ...entry, duration: String(Number(entry.duration) + 1) })
                }
                className="grid h-full w-8 place-items-center text-mist transition-colors duration-200 hover:text-foreground"
              >
                <Plus className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="relative">
              <select
                value={entry.unit}
                onChange={(e) => onChange({ ...entry, unit: e.target.value as "days" | "weeks" })}
                className="h-12 w-full appearance-none rounded-lg border border-line bg-card ps-3 pe-8 text-sm text-foreground transition-all duration-200 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none dark:bg-ink"
              >
                <option value="days">{t.doctor.days}</option>
                <option value="weeks">{t.doctor.weeks}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute end-2 top-1/2 size-4 -translate-y-1/2 text-mist" strokeWidth={1.75} />
            </div>
          </div>
        </div>

        {/* Trash */}
        <div className="shrink-0 pt-6">
          <button
            type="button"
            aria-label={t.doctor.removeMedicine}
            onClick={onRemove}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-mist transition-colors duration-200 hover:border-err/60 hover:text-err"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
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
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line py-3 text-sm font-medium text-arc transition-colors duration-200 hover:border-arc/60"
          >
            <Plus className="size-4" strokeWidth={1.75} />
            {t.doctor.addMedicine}
          </button>
        </div>

        {/* PREVIEW SIDE — 30%, sticky */}
        <div className="w-[30%]">
          <div className="sticky top-40 rounded-2xl border border-line bg-card p-6">
            <div className="border-b border-line pb-4 text-center">
              <p className="font-display text-base font-semibold text-foreground">{t.doctor.rxPreviewClinic}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t.doctor.rxPreviewAddress}</p>
            </div>

            <div className="flex items-center justify-between py-4 text-xs">
              <div>
                <p className="text-muted-foreground">{t.doctor.rxPreviewPatient}</p>
                <p className="font-medium text-foreground">{patient.full_name}</p>
              </div>
              <div className="text-end">
                <p className="text-muted-foreground">{t.doctor.rxPreviewDate}</p>
                <p className="font-medium text-foreground ltr-in-rtl">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="mb-2 font-display text-2xl leading-none text-foreground">℞</div>

            {previewItems.length === 0 ? (
              <p className="text-sm italic text-mist">{t.doctor.noNotes}</p>
            ) : (
              <ol className="space-y-3 text-sm text-foreground">
                {previewItems.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="ltr-in-rtl font-mono">{idx + 1}.</span>
                    <div>
                      <p className="font-medium">{item.medicineName}</p>
                      <p className="mt-0.5 font-mono text-xs text-mist">
                        {[item.dosage, item.frequency, `${item.duration} ${item.unit}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-8 border-t border-line pt-3 text-end">
              <p className="font-display text-sm italic text-foreground">Dr. {patient.full_name.split(" ").slice(-1)[0] || ""}</p>
              <p className="text-[11px] text-muted-foreground">{t.doctor.rxPreviewSignature}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 flex items-center gap-2.5 rounded-lg bg-err/10 px-4 py-3 text-sm font-medium text-err">
          <span className="size-2 shrink-0 rounded-full bg-err" />
          {error}
        </div>
      )}

      {/* Sticky footer */}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-line bg-card px-4 py-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
        >
          <Printer className="size-4" strokeWidth={1.75} />
          {t.doctor.print}
        </button>
        <button
          type="button"
          disabled={isPending || !medicalRecord}
          onClick={handleSave}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground disabled:opacity-50"
        >
          {t.doctor.savePrescription}
        </button>
      </div>
    </div>
  )
}
