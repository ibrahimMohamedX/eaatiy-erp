"use client"

import { Trash2, Minus, Plus, ChevronDown, Search, Printer } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"

type Medicine = {
  query: string
  matches: { text: string; boldStart: number; boldLen: number }[]
  dosage: string
  frequency: string
  duration: string
  unit: string
}

const rows: Medicine[] = [
  {
    query: "Amox",
    matches: [
      { text: "Amoxicillin 500mg", boldStart: 0, boldLen: 4 },
      { text: "Amoxicillin-Clavulanate 625mg", boldStart: 0, boldLen: 4 },
      { text: "Amoxil Forte 250mg/5ml", boldStart: 0, boldLen: 4 },
    ],
    dosage: "500mg",
    frequency: "Twice daily",
    duration: "7",
    unit: "days",
  },
  {
    query: "Para",
    matches: [
      { text: "Paracetamol 650mg", boldStart: 0, boldLen: 4 },
      { text: "Paracetamol-Caffeine 500mg", boldStart: 0, boldLen: 4 },
      { text: "Paradol Extra 500mg", boldStart: 0, boldLen: 4 },
    ],
    dosage: "650mg",
    frequency: "Every 8 hours",
    duration: "5",
    unit: "days",
  },
]

const fieldLabel = "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]"

function Highlight({ text, start, len }: { text: string; start: number; len: number }) {
  return (
    <>
      {text.slice(0, start)}
      <span className="font-semibold text-[#0F766E]">{text.slice(start, start + len)}</span>
      {text.slice(start + len)}
    </>
  )
}

function PrescriptionRow({ row, showDropdown, t }: { row: Medicine; showDropdown: boolean; t: Record<string, any> }) {
  const freqOptions: string[] = t.doctor.frequencyOptions

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-[#374151] dark:bg-[#1F2937]">
      <div className="flex items-start gap-2.5">
        {/* Medicine Name + autocomplete */}
        <div className="relative min-w-[130px] flex-1">
          <label className={fieldLabel}>{t.doctor.medicineName}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
            <input
              type="text"
              defaultValue={row.matches[0].text}
              className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-2 text-sm text-[#111827] outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB]"
            />
          </div>
          {showDropdown && (
            <div className="absolute left-0 top-full z-20 mt-1 min-w-[240px] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.06)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_4px_24px_rgba(0,0,0,0.32)]">
              {row.matches.map((m, i) => (
                <div
                  key={m.text}
                  className={`cursor-pointer px-3 py-2 text-sm text-[#111827] dark:text-[#F9FAFB] ${
                    i === 0 ? "bg-[#0F766E]/[0.06] dark:bg-[#0F766E]/[0.15]" : "hover:bg-[#F9FAFB] dark:hover:bg-[#374151]"
                  }`}
                >
                  <Highlight text={m.text} start={m.boldStart} len={m.boldLen} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dosage */}
        <div className="w-20 shrink-0">
          <label className={fieldLabel}>{t.doctor.dosage}</label>
          <input
            type="text"
            defaultValue={row.dosage}
            className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB]"
          />
        </div>

        {/* Frequency chips */}
        <div className="w-[168px] shrink-0">
          <label className={fieldLabel}>{t.doctor.frequency}</label>
          <div className="flex flex-wrap gap-1.5">
            {freqOptions.map((f) => {
              const selected = f === row.frequency
              return (
                <button
                  key={f}
                  type="button"
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
              <button type="button" className="grid h-full w-8 place-items-center text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]">
                <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <input
                type="text"
                defaultValue={row.duration}
                className="h-full w-8 border-x border-[#E5E7EB] bg-white text-center text-sm text-[#111827] outline-none dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB]"
              />
              <button type="button" className="grid h-full w-8 place-items-center text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]">
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="relative">
              <select
                defaultValue={row.unit}
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
            className="grid h-9 w-9 place-items-center rounded-lg border border-[#E5E7EB] text-[#6B7280] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:border-[#DC2626] dark:hover:text-[#DC2626]"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function PrescriptionsTab() {
  const { t } = useT()

  return (
    <div className="flex flex-col">
      <div className="flex gap-6 p-4">
        {/* FORM SIDE — 70% */}
        <div className="w-[70%] space-y-3">
          <PrescriptionRow row={rows[0]} showDropdown t={t} />
          <PrescriptionRow row={rows[1]} showDropdown={false} t={t} />

          <button
            type="button"
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
                <p className="font-medium text-[#111827] dark:text-[#F9FAFB]">Marcus Delgado</p>
              </div>
              <div className="text-right">
                <p className="text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.rxPreviewDate}</p>
                <p className="font-medium text-[#111827] dark:text-[#F9FAFB]">Jul 11, 2026</p>
              </div>
            </div>

            <div className="mb-2 font-serif text-2xl leading-none text-[#111827] dark:text-[#F9FAFB]">℞</div>

            <ol className="space-y-3 font-serif text-sm text-[#111827] dark:text-[#F9FAFB]">
              <li className="flex gap-2">
                <span>1.</span>
                <div>
                  <p className="font-medium dark:text-[#F9FAFB]">Amoxicillin 500mg</p>
                  <p className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">500mg · Twice daily · 7 days</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span>2.</span>
                <div>
                  <p className="font-medium dark:text-[#F9FAFB]">Paracetamol 650mg</p>
                  <p className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">650mg · Every 8 hours · 5 days</p>
                </div>
              </li>
            </ol>

            <div className="mt-8 border-t border-[#E5E7EB] pt-3 text-right dark:border-[#374151]">
              <p className="font-serif text-sm italic text-[#111827] dark:text-[#F9FAFB]">Dr. Sara Reyes</p>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.rxPreviewSignature}</p>
            </div>
          </div>
        </div>
      </div>

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
          className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t.doctor.savePrescription}
        </button>
      </div>
    </div>
  )
}
