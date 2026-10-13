"use client"

import { Hourglass, Stethoscope, CheckCircle2, XCircle, Receipt } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"

type Kpi = {
  labelKey: string
  label: string
  icon: LucideIcon
  /** Archai semantic tone class (text-warn / text-arc / text-ok / text-err / text-copper) */
  tone: string
  /** 10% tinted tile for the tone */
  tile: string
}

function buildKpis(t: Record<string, any>): Kpi[] {
  const r = t.receptionist ?? {}
  return [
    { labelKey: "receptionist.waiting", label: r.waiting ?? "Waiting", icon: Hourglass, tone: "text-warn", tile: "bg-warn/10" },
    { labelKey: "receptionist.inConsultation", label: r.inConsultation ?? "In Consultation", icon: Stethoscope, tone: "text-arc", tile: "bg-arc/10" },
    { labelKey: "receptionist.completedToday", label: r.completedToday ?? "Completed Today", icon: CheckCircle2, tone: "text-ok", tile: "bg-ok/10" },
    { labelKey: "receptionist.cancelledToday", label: r.cancelledToday ?? "Cancelled Today", icon: XCircle, tone: "text-err", tile: "bg-err/10" },
    { labelKey: "receptionist.unpaidBills", label: r.unpaidBills ?? "Unpaid Bills", icon: Receipt, tone: "text-copper", tile: "bg-copper/10" },
  ]
}

export interface KpiCounts {
  waiting: number
  inConsultation: number
  completedToday: number
  cancelledToday: number
  unpaidBills: number
}

type Props = {
  counts: KpiCounts | null
}

/**
 * KPI Row — Archai stat tiles (5-column metric strip).
 * Receives counts from the database via props.
 */
export function KpiRow({ counts }: Props) {
  const { t } = useT()
  const KPIS = buildKpis(t)
  const liveValues = counts
    ? [
        String(counts.waiting),
        String(counts.inConsultation),
        String(counts.completedToday),
        String(counts.cancelledToday),
        String(counts.unpaidBills),
      ]
    : ["—", "—", "—", "—", "—"]

  return (
    <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {KPIS.map((kpi, i) => {
        const Icon = kpi.icon
        return (
          <div
            key={kpi.labelKey}
            className="group flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-mist"
          >
            <span className={`flex size-9 items-center justify-center rounded-xl ${kpi.tile}`}>
              <Icon className={`size-[18px] ${kpi.tone}`} strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-latin text-2xl font-semibold leading-none text-foreground ltr-in-rtl">
                {liveValues[i]}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          </div>
        )
      })}
    </section>
  )
}
