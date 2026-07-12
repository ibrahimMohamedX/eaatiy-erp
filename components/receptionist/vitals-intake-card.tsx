import { BellRing } from "lucide-react"

type Field = {
  label: string
  placeholder: string
  unit: string
  ariaLabel: string
}

const FIELDS: Field[] = [
  { label: "Systolic BP", placeholder: "120", unit: "mmHg", ariaLabel: "Systolic blood pressure" },
  { label: "Diastolic BP", placeholder: "80", unit: "mmHg", ariaLabel: "Diastolic blood pressure" },
  { label: "Temperature", placeholder: "36.6", unit: "°C", ariaLabel: "Temperature" },
  { label: "Weight", placeholder: "70.0", unit: "kg", ariaLabel: "Weight" },
]

export function VitalsIntakeCard() {
  return (
    <div className="flex flex-col rounded-[12px] border border-[#E5E7EB] bg-white p-5">
      <h2 className="text-sm font-semibold text-[#111827]">Triage — Capture Vitals</h2>
      <p className="mt-1 text-xs text-[#6B7280]">Record intake vitals before the consultation.</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.label} className="flex flex-col">
            <label className="mb-1.5 text-xs font-medium text-[#111827]">{field.label}</label>
            <div className="flex items-center rounded-[8px] border border-[#E5E7EB] bg-white pr-3 transition-colors focus-within:border-[#0F766E] focus-within:ring-2 focus-within:ring-[#0F766E]/20">
              <input
                type="text"
                inputMode="decimal"
                placeholder={field.placeholder}
                aria-label={field.ariaLabel}
                className="h-10 w-full rounded-[8px] bg-transparent px-3 text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none"
              />
              <span className="whitespace-nowrap text-xs text-[#6B7280]">{field.unit}</span>
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
        Save Vitals &amp; Notify Doctor
      </button>
    </div>
  )
}
