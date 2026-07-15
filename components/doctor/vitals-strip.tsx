"use client"

import { Activity, Thermometer, Weight, Droplets, Heart } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Vitals } from "@/lib/types"
import { statusBg, SEMANTIC_COLORS } from "@/lib/color-utils"
import { useT } from "@/lib/i18n/use-t"

/**
 * Vitals Summary Strip — 5 interactive semantic chips showing
 * the patient's triage vitals. Each chip uses the 12% opacity rule
 * for its background.
 */

type ChipDef = {
  key: keyof Vitals
  label: string
  unit: string
  icon: LucideIcon
  normalRange: string
}

function buildChips(t: Record<string, any>): ChipDef[] {
  return [
    {
      key: "systolic_bp",
      label: t.vitals.systolicBP,
      unit: "mmHg",
      icon: Activity,
      normalRange: t.vitals.normalSystolic,
    },
    {
      key: "diastolic_bp",
      label: t.vitals.diastolicBP,
      unit: "mmHg",
      icon: Heart,
      normalRange: t.vitals.normalDiastolic,
    },
    {
      key: "temperature",
      label: t.vitals.temperature,
      unit: "°C",
      icon: Thermometer,
      normalRange: t.vitals.normalTemp,
    },
    {
      key: "weight",
      label: t.vitals.weight,
      unit: "kg",
      icon: Weight,
      normalRange: t.vitals.normalWeight,
    },
    {
      key: "blood_sugar",
      label: t.vitals.bloodSugar,
      unit: "mg/dL",
      icon: Droplets,
      normalRange: t.vitals.normalBloodSugar,
    },
  ]
}

function isAbnormal(key: keyof Vitals, value: number | undefined): boolean {
  if (value == null) return false
  switch (key) {
    case "systolic_bp":
      return value < 90 || value > 140
    case "diastolic_bp":
      return value < 60 || value > 90
    case "temperature":
      return value < 36.1 || value > 37.2
    case "blood_sugar":
      return value < 70 || value > 140
    default:
      return false
  }
}

export function VitalsStrip({ vitals }: { vitals?: Vitals }) {
  const { t } = useT()
  const chips = buildChips(t)

  return (
    <div className="px-6 pb-3">
      <div className="flex gap-3 overflow-x-auto rounded-[12px] border border-[#E5E7EB] bg-white p-4 dark:border-[#374151] dark:bg-[#1F2937]">
        {chips.map((chip) => {
          const Icon = chip.icon
          const value = vitals?.[chip.key]
          const alert = value != null && isAbnormal(chip.key, value)
          // Non-alert states use Tailwind classes (dark-aware); alert overrides
          // are applied via inline style, which takes precedence.

          return (
            <div
              key={chip.key}
              className="flex min-w-[160px] flex-1 items-center gap-3 rounded-[8px] bg-[#F9FAFB] p-3 dark:bg-[#374151]"
              style={alert ? { backgroundColor: statusBg(SEMANTIC_COLORS.red.hex) } : undefined}
            >
              {/* Icon */}
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={alert ? { backgroundColor: statusBg(SEMANTIC_COLORS.red.hex) } : { backgroundColor: "rgba(15,118,110,0.12)" }}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.5}
                  style={alert ? { color: SEMANTIC_COLORS.red.hex } : { color: "#0F766E" }}
                />
              </span>

              {/* Value + label */}
              <div className="min-w-0">
                <p
                  className="text-lg font-semibold leading-none text-[#111827] dark:text-[#F9FAFB]"
                  style={alert ? { color: SEMANTIC_COLORS.red.hex } : undefined}
                >
                  {value ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                  {chip.label}{" "}
                  <span className="text-[#E5E7EB] dark:text-[#374151]">·</span>{" "}
                  {chip.unit}
                </p>
                <p className="mt-0.5 text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                  {t.doctor.normalRange.replace("{range}", chip.normalRange)}
                </p>
              </div>

              {/* Abnormal dot */}
              {alert && (
                <span
                  className="ml-auto h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SEMANTIC_COLORS.red.hex }}
                  title={t.doctor.outsideNormalRange}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}