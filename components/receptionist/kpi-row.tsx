"use client"

import { Hourglass, Stethoscope, CheckCircle2, XCircle, Receipt } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getReceptionistKpis } from "@/lib/mock-data"

type Kpi = {
  label: string
  value: string
  icon: LucideIcon
  color: string
  rgb: string
}

const KPIS: Kpi[] = [
  { label: "Waiting", value: "", icon: Hourglass, color: "#D97706", rgb: "217,119,6" },
  { label: "In Consultation", value: "", icon: Stethoscope, color: "#2563EB", rgb: "37,99,235" },
  { label: "Completed Today", value: "", icon: CheckCircle2, color: "#059669", rgb: "5,150,105" },
  { label: "Cancelled Today", value: "", icon: XCircle, color: "#DC2626", rgb: "220,38,38" },
  { label: "Unpaid Bills", value: "", icon: Receipt, color: "#D97706", rgb: "217,119,6" },
]

/**
 * KPI Row — 5-column metric card strip.
 * Values are derived live from the centralized mock data store.
 */
export function KpiRow() {
  const kpiData = getReceptionistKpis()
  const liveValues = [
    String(kpiData.waiting),
    String(kpiData.inConsultation),
    String(kpiData.completedToday),
    String(kpiData.cancelledToday),
    String(kpiData.unpaidBills),
  ]

  return (
    <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {KPIS.map((kpi, i) => {
        const Icon = kpi.icon
        return (
          <div
            key={kpi.label}
            className="flex flex-col gap-3 rounded-[12px] border border-[#E5E7EB] bg-white p-4"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: `rgba(${kpi.rgb},0.12)` }}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} style={{ color: kpi.color }} />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none text-[#111827]">{liveValues[i]}</p>
              <p className="mt-1.5 text-xs text-[#6B7280]">{kpi.label}</p>
            </div>
          </div>
        )
      })}
    </section>
  )
}