"use client"

import { Activity, Thermometer, Weight, Droplets, Heart } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Vitals } from "@/lib/types"
import { useT } from "@/lib/i18n/use-t"

/**
 * Vitals Summary Strip — 5 interactive semantic tiles showing
 * the patient's triage vitals. Abnormal values surface the err tone.
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
      <div className="flex gap-3 overflow-x-auto">
        {chips.map((chip) => {
          const Icon = chip.icon
          const value = vitals?.[chip.key]
          const alert = value != null && isAbnormal(chip.key, value)
          // Neutral stat tiles — the err tone overrides every level
          // when the value falls outside the normal range.

          return (
            <div
              key={chip.key}
              className={`flex min-w-[160px] flex-1 items-center gap-3 rounded-2xl border p-4 transition-colors duration-200 ${
                alert
                  ? "border-err/40 bg-err/10"
                  : "border-line bg-card"
              }`}
            >
              {/* Icon */}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-steel">
                <Icon
                  className={`size-[18px] ${alert ? "text-err" : "text-silver"}`}
                  strokeWidth={1.75}
                />
              </span>

              {/* Value + label */}
              <div className="min-w-0">
                <p
                  className={`font-latin text-lg font-semibold leading-none ltr-in-rtl ${
                    alert ? "text-err" : "text-foreground"
                  }`}
                >
                  {value ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {chip.label}{" "}
                  <span className="text-line">·</span>{" "}
                  {chip.unit}
                </p>
                <p className="mt-0.5 text-[10px] text-mist">
                  {t.doctor.normalRange.replace("{range}", chip.normalRange)}
                </p>
              </div>

              {/* Abnormal dot */}
              {alert && (
                <span
                  className="ms-auto size-2 shrink-0 rounded-full bg-err"
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
