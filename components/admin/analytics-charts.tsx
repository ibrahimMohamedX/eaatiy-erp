"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useT } from "@/lib/i18n/use-t"
import type { DashboardData } from "@/lib/actions/admin/get-dashboard-data"

/* ------------------------------- Revenue chart ------------------------------- */

function RevenueTooltip({ active, payload, label, dayLabel }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-popover px-3 py-2 font-mono text-xs text-foreground shadow-lg">
      <div className="mb-1 text-[11px] font-medium text-mist ltr-in-rtl">{dayLabel} {label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="capitalize">{p.dataKey}</span>
          <span className="ms-auto font-medium ltr-in-rtl">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

type RevenueChartProps = {
  data: DashboardData | null
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { t } = useT()

  const chartData = data?.revenueOverTime?.map((p) => ({
    date: p.date.slice(5), // "MM-DD" label
    paid: p.paid,
    outstanding: p.outstanding,
  })) ?? []

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">{t.admin.revenue}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.admin.revenueLast30}</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-arc" />
            <span className="text-xs text-mist">{t.admin.paid}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-warn" />
            <span className="text-xs text-mist">{t.admin.outstanding}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="paidFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--arc)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--arc)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--mist)", fontSize: 11, fontFamily: "var(--font-jetbrains), monospace" }}
              interval={4}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--mist)", fontSize: 11, fontFamily: "var(--font-jetbrains), monospace" }}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              width={56}
            />
            <Tooltip content={<RevenueTooltip dayLabel={t.admin.day} />} cursor={{ stroke: "var(--line)" }} />
            <Area
              type="monotone"
              dataKey="paid"
              stroke="var(--arc)"
              strokeWidth={2}
              fill="url(#paidFill)"
              dot={false}
              activeDot={{ r: 3, fill: "var(--arc)" }}
            />
            <Line
              type="monotone"
              dataKey="outstanding"
              stroke="var(--warn)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 3, fill: "var(--warn)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ------------------------------- Status donut ------------------------------- */

const STATUS_COLORS: Record<string, string> = {
  completed: "var(--ok)",
  waiting: "var(--warn)",
  inConsultation: "var(--arc)",
  cancelled: "var(--err)",
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  completed: "status.completed",
  waiting: "status.waiting",
  inConsultation: "status.inConsultation",
  cancelled: "status.cancelled",
}

type StatusDonutProps = {
  data: DashboardData | null
}

export function StatusDonut({ data }: StatusDonutProps) {
  const { t } = useT()

  const entries = data
    ? [
        { name: "Completed", key: "completed", value: data.statusDistribution.completed, color: STATUS_COLORS.completed },
        { name: "Waiting", key: "waiting", value: data.statusDistribution.waiting, color: STATUS_COLORS.waiting },
        { name: "In Consultation", key: "inConsultation", value: data.statusDistribution.inConsultation, color: STATUS_COLORS.inConsultation },
        { name: "Cancelled", key: "cancelled", value: data.statusDistribution.cancelled, color: STATUS_COLORS.cancelled },
      ]
    : []

  const total = entries.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-card p-5">
      <div>
        <h3 className="font-display text-sm font-semibold text-foreground">{t.admin.appointmentStatus}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.admin.distributionToday}</p>
      </div>

      <div className="relative mt-2 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={entries}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              stroke="none"
            >
              {entries.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-latin text-2xl font-semibold text-foreground ltr-in-rtl">{total}</span>
          <span className="text-[11px] text-mist">{t.admin.total}</span>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {entries.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-mist">{d.name}</span>
            <span className="ms-auto font-medium text-foreground ltr-in-rtl">
              {total > 0 ? `${Math.round((d.value / total) * 100)}%` : "0%"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------- Appointments per doctor -------------------------- */

type AppointmentsPerDoctorProps = {
  data: DashboardData | null
}

export function AppointmentsPerDoctor({ data }: AppointmentsPerDoctorProps) {
  const { t } = useT()

  // For the doctor performance bar chart, we use the appointmentsPerDoctor data
  // along with doctor name resolution from the appointments data
  // Note: v1 shows count only — doctor names need separate resolution.
  // We display "Doctor ID" placeholder for now; future enhancement will
  // join users table for names.

  const doctorEntries = (data?.appointmentsPerDoctor ?? []).map((d) => ({
    name: `Doctor ${d.doctorId.slice(0, 4)}…`,
    initials: "?",
    count: d.count,
  }))

  const maxCount = Math.max(0, ...doctorEntries.map((d) => d.count))

  if (doctorEntries.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-5">
        <h3 className="font-display text-sm font-semibold text-foreground">{t.admin.appointmentsPerDoctor}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.admin.appointmentsPerDoctorPeriod}</p>
        <p className="mt-8 text-center text-sm text-muted-foreground">No appointment data available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div>
        <h3 className="font-display text-sm font-semibold text-foreground">{t.admin.appointmentsPerDoctor}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.admin.appointmentsPerDoctorPeriod}</p>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {doctorEntries.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            {/* Left axis: avatar + name */}
            <div className="flex w-44 shrink-0 items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-steel text-[11px] font-semibold text-silver">
                {d.initials}
              </span>
              <span className="truncate text-sm text-foreground">{d.name}</span>
            </div>
            {/* Bar track */}
            <div className="flex flex-1 items-center gap-3">
              <div className="h-6 flex-1 overflow-hidden rounded-lg bg-steel">
                <div
                  className="h-full rounded-lg bg-primary transition-all duration-200"
                  style={{ width: `${maxCount > 0 ? (d.count / maxCount) * 100 : 0}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-end font-latin text-sm font-medium text-foreground ltr-in-rtl">
                {d.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
