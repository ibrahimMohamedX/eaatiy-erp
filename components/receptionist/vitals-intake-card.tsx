"use client"

import { BellRing } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"

type Field = {
  labelKey: string
  label: string
  placeholder: string
  unit: string
  ariaLabel: string
}

export function VitalsIntakeCard() {
  const { t } = useT()
  const r = t.receptionist ?? {}
  const FIELDS: Field[] = [
    { labelKey: "vitals.systolicBP", label: r.systolicBP ?? "Systolic BP", placeholder: "120", unit: "mmHg", ariaLabel: "Systolic blood pressure" },
    { labelKey: "vitals.diastolicBP", label: r.diastolicBP ?? "Diastolic BP", placeholder: "80", unit: "mmHg", ariaLabel: "Diastolic blood pressure" },
    { labelKey: "vitals.temperature", label: r.temperature ?? "Temperature", placeholder: "36.6", unit: "°C", ariaLabel: "Temperature" },
    { labelKey: "vitals.weight", label: r.weight ?? "Weight", placeholder: "70.0", unit: "kg", ariaLabel: "Weight" },
  ]

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">{t.receptionist.triageCaptureVitals}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{t.receptionist.triageDescription}</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.labelKey} className="flex flex-col">
            <label className="mb-1.5 text-xs font-medium text-silver">{field.label}</label>
            <div className="flex items-center rounded-lg border border-line bg-card pe-3 transition-colors duration-200 focus-within:border-ring focus-within:[box-shadow:var(--glow-soft)] dark:bg-ink">
              <input
                type="text"
                inputMode="decimal"
                placeholder={field.placeholder}
                aria-label={field.ariaLabel}
                className="ltr-in-rtl h-10 w-full rounded-lg bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              <span className="whitespace-nowrap font-mono text-xs text-mist">{field.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary action — this screen's single Arc button lives in the top bar */}
      <button
        type="button"
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
      >
        <BellRing className="size-[18px]" strokeWidth={1.75} />
        {t.receptionist.saveVitalsNotify}
      </button>
    </div>
  )
}
