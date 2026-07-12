import { Activity, Thermometer, Weight, Droplets, Heart } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Vitals } from "@/lib/types"
import { statusBg, SEMANTIC_COLORS } from "@/lib/color-utils"

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

const CHIPS: ChipDef[] = [
  {
    key: "systolic_bp",
    label: "Systolic BP",
    unit: "mmHg",
    icon: Activity,
    normalRange: "90–140",
  },
  {
    key: "diastolic_bp",
    label: "Diastolic BP",
    unit: "mmHg",
    icon: Heart,
    normalRange: "60–90",
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    icon: Thermometer,
    normalRange: "36.1–37.2",
  },
  {
    key: "weight",
    label: "Weight",
    unit: "kg",
    icon: Weight,
    normalRange: "—",
  },
  {
    key: "blood_sugar",
    label: "Blood Sugar",
    unit: "mg/dL",
    icon: Droplets,
    normalRange: "70–140",
  },
]

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
  return (
    <div className="px-6 pb-3">
      <div className="flex gap-3 overflow-x-auto rounded-[12px] border border-[#E5E7EB] bg-white p-4">
        {CHIPS.map((chip) => {
          const Icon = chip.icon
          const value = vitals?.[chip.key]
          const alert = value != null && isAbnormal(chip.key, value)
          const bgColor = alert
            ? statusBg(SEMANTIC_COLORS.red.hex)
            : "#F9FAFB"
          const textColor = alert
            ? SEMANTIC_COLORS.red.hex
            : "#111827"

          return (
            <div
              key={chip.key}
              className="flex min-w-[160px] flex-1 items-center gap-3 rounded-[8px] p-3"
              style={{ backgroundColor: bgColor }}
            >
              {/* Icon */}
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: alert ? statusBg(SEMANTIC_COLORS.red.hex) : "rgba(15,118,110,0.12)" }}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.5}
                  style={{ color: alert ? SEMANTIC_COLORS.red.hex : "#0F766E" }}
                />
              </span>

              {/* Value + label */}
              <div className="min-w-0">
                <p
                  className="text-lg font-semibold leading-none"
                  style={{ color: textColor }}
                >
                  {value ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-[#6B7280]">
                  {chip.label}{" "}
                  <span className="text-[#E5E7EB]">·</span>{" "}
                  {chip.unit}
                </p>
                <p className="mt-0.5 text-[10px] text-[#6B7280]">
                  Normal: {chip.normalRange}
                </p>
              </div>

              {/* Abnormal dot */}
              {alert && (
                <span
                  className="ml-auto h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SEMANTIC_COLORS.red.hex }}
                  title="Outside normal range"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}