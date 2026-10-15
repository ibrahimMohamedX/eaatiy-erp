"use client"

import { useState, useTransition } from "react"
import { BellRing, Check, AlertCircle, ChevronDown } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { recordVitals } from "@/lib/actions/receptionist/record-vitals"
import { callNext } from "@/lib/actions/receptionist/call-next"
import { callAgain } from "@/lib/actions/receptionist/call-again"
import type { Appointment, Patient, Vitals } from "@/lib/types"

type Field = {
  key: keyof Vitals
  labelKey: "systolicBP" | "diastolicBP" | "temperature" | "weight" | "bloodSugar"
  placeholder: string
  unit: string
}

type Props = {
  /** Today's appointments (waiting + called shown) — from the page shell */
  appointments: Appointment[]
  /** Patients referenced by those appointments */
  patients: Patient[]
  /** Called after a successful save so the queue refreshes */
  onMutated: () => void
}

/**
 * Triage vitals capture — wired to recordVitals + callNext/callAgain.
 * "Save Vitals & Notify Doctor" persists the intake measurements (draft
 * medical record) and signals the doctor by calling the patient.
 */
export function VitalsIntakeCard({ appointments, patients, onMutated }: Props) {
  const { t } = useT()
  const r = t.receptionist
  const [isPending, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState<string>("")
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const FIELDS: Field[] = [
    { key: "systolic_bp", labelKey: "systolicBP", placeholder: "120", unit: "mmHg" },
    { key: "diastolic_bp", labelKey: "diastolicBP", placeholder: "80", unit: "mmHg" },
    { key: "temperature", labelKey: "temperature", placeholder: "36.6", unit: "°C" },
    { key: "weight", labelKey: "weight", placeholder: "70.0", unit: "kg" },
    { key: "blood_sugar", labelKey: "bloodSugar", placeholder: "95", unit: "mg/dL" },
  ]

  // Intake applies to patients waiting / called today
  const eligible = appointments.filter(
    (a) => a.status === "waiting" || a.status === "called",
  )
  const patientFor = (a: Appointment) => patients.find((p) => p.id === a.patient_id)
  const selected = eligible.find((a) => a.id === selectedId)
  const selectedPatient = selected ? patientFor(selected) : undefined

  function setValue(key: string, v: string) {
    // digits + one decimal point only
    if (!/^\d*\.?\d*$/.test(v)) return
    setValues((prev) => ({ ...prev, [key]: v }))
    setSaved(false)
  }

  function handleSubmit() {
    setError(null)
    setSaved(false)

    if (!selected || !selectedPatient) {
      setError(r.selectQueuePatient ?? "Pick the waiting patient from today's queue")
      return
    }

    const vitals: Vitals = {}
    for (const f of FIELDS) {
      const raw = values[f.key]?.trim()
      if (raw) {
        const num = Number.parseFloat(raw)
        if (Number.isNaN(num)) {
          setError(`${r[f.labelKey] ?? f.labelKey}: invalid number`)
          return
        }
        vitals[f.key] = num
      }
    }

    if (Object.keys(vitals).length === 0) {
      setError(r.triageDescription ?? "Record at least one measurement")
      return
    }

    startTransition(async () => {
      const res = await recordVitals(
        selected.id,
        selectedPatient.id,
        selected.doctor_id,
        vitals,
      )
      if (!res.success) {
        setError(res.error)
        return
      }
      // Notify: waiting → called (first call), called → re-call (cooldown enforced server-side)
      const call = selected.status === "waiting" ? callNext : callAgain
      const callRes = await call(selected.id)
      if (!callRes.success) {
        setError(callRes.error)
        onMutated()
        return
      }
      setSaved(true)
      setValues({})
      onMutated()
    })
  }

  const inputCls =
    "ltr-in-rtl h-10 w-full rounded-lg bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none font-mono"

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">{t.receptionist.triageCaptureVitals}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{t.receptionist.triageDescription}</p>

      {/* Patient picker — from today's live queue */}
      <div className="relative mt-4">
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value)
            setError(null)
            setSaved(false)
          }}
          aria-label={r.selectQueuePatient ?? "Select patient"}
          className="h-10 w-full appearance-none rounded-lg border border-line bg-card ps-3 pe-8 text-sm text-foreground transition-colors duration-200 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none dark:bg-ink"
        >
          <option value="">{r.selectQueuePatient ?? "Pick the waiting patient from today's queue"}</option>
          {eligible.map((a) => {
            const p = patientFor(a)
            return (
              <option key={a.id} value={a.id}>
                #{a.queue_number} — {p?.full_name ?? a.patient_id}
              </option>
            )
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-mist" strokeWidth={1.75} />
      </div>

      {eligible.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {r.noWaitingForVitals ?? "No patients waiting for intake right now."}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.labelKey} className="flex flex-col">
            <label className="mb-1.5 text-xs font-medium text-silver">
              {r[field.labelKey] ?? field.labelKey}
            </label>
            <div className="flex items-center rounded-lg border border-line bg-card pe-3 transition-colors duration-200 focus-within:border-ring focus-within:[box-shadow:var(--glow-soft)] dark:bg-ink">
              <input
                type="text"
                inputMode="decimal"
                placeholder={field.placeholder}
                aria-label={r[field.labelKey] ?? field.labelKey}
                value={values[field.key] ?? ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                disabled={isPending}
                className={inputCls}
              />
              <span className="whitespace-nowrap font-mono text-xs text-mist">{field.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-err/10 px-3.5 py-2.5 text-sm font-medium text-err" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}
      {saved && !error && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-ok/10 px-3.5 py-2.5 text-sm font-medium text-ok" role="status">
          <Check className="size-4 shrink-0" strokeWidth={1.75} />
          <span>{r.vitalsSavedCalled ?? "Saved — patient called to the doctor."}</span>
        </div>
      )}

      {/* Secondary action — this screen's single Arc button lives in the top bar */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || eligible.length === 0}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <BellRing className="size-[18px]" strokeWidth={1.75} />
        {isPending ? (t.common.loading ?? "Saving…") : t.receptionist.saveVitalsNotify}
      </button>
    </div>
  )
}
