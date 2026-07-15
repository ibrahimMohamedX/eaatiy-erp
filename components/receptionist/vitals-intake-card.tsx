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
    <div className="flex flex-col rounded-[12px] border border-[#E5E7EB] bg-white p-5 dark:border-[#374151] dark:bg-[#1F2937]">
      <h2 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.receptionist.triageCaptureVitals}</h2>
      <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.receptionist.triageDescription}</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.labelKey} className="flex flex-col">
            <label className="mb-1.5 text-xs font-medium text-[#111827] dark:text-[#F9FAFB]">{field.label}</label>
            <div className="flex items-center rounded-[8px] border border-[#E5E7EB] bg-white pr-3 transition-colors focus-within:border-[#0F766E] focus-within:ring-2 focus-within:ring-[#0F766E]/20 dark:border-[#374151] dark:bg-[#1F2937]">
              <input
                type="text"
                inputMode="decimal"
                placeholder={field.placeholder}
                aria-label={field.ariaLabel}
                className="h-10 w-full rounded-[8px] bg-transparent px-3 text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none dark:text-[#F9FAFB] dark:placeholder:text-[#9CA3AF]"
              />
              <span className="whitespace-nowrap text-xs text-[#6B7280] dark:text-[#9CA3AF]">{field.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Primary button */}
      <button
        type="button"
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0F766E] text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <BellRing className="h-[18px] w-[18px]" strokeWidth={1.5} />
        {t.receptionist.saveVitalsNotify}
      </button>
    </div>
  )
}
