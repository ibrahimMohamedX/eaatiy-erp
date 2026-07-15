"use client"

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

/* ------------------------------- Revenue chart ------------------------------- */

const revenueData = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const paid = Math.round(900 + Math.sin(i / 3) * 380 + i * 34 + (i % 5) * 60)
  const outstanding = Math.round(220 + Math.cos(i / 4) * 90 + (i % 7) * 22)
  return { day: `${day}`, paid, outstanding }
})

function RevenueTooltip({ active, payload, label, dayLabel }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(17,24,39,0.06)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_4px_24px_rgba(0,0,0,0.32)]">
      <div className="mb-1 text-[11px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">{dayLabel} {label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs text-[#111827] dark:text-[#F9FAFB]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="capitalize">{p.dataKey}</span>
          <span className="ml-auto font-medium">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart() {
  const { t } = useT()
  return (
    <div className="flex h-full flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 dark:border-[#374151] dark:bg-[#1F2937]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.admin.revenue}</h3>
          <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#9CA3AF]">{t.admin.revenueLast30}</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-[#0F766E]" />
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#9CA3AF]">{t.admin.paid}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-[#D97706]" />
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#9CA3AF]">{t.admin.outstanding}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="paidFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F766E" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7280", fontSize: 11 }}
              interval={4}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7280", fontSize: 11 }}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              width={56}
            />
            <Tooltip content={<RevenueTooltip dayLabel={t.admin.day} />} cursor={{ stroke: "#E5E7EB" }} />
            <Area
              type="monotone"
              dataKey="paid"
              stroke="#0F766E"
              strokeWidth={2}
              fill="url(#paidFill)"
              dot={false}
              activeDot={{ r: 3, fill: "#0F766E" }}
            />
            <Line
              type="monotone"
              dataKey="outstanding"
              stroke="#D97706"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 3, fill: "#D97706" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ------------------------------- Status donut ------------------------------- */

const statusData = [
  { name: "Completed", value: 186, color: "#059669" },
  { name: "Waiting", value: 64, color: "#D97706" },
  { name: "In Consultation", value: 43, color: "#2563EB" },
  { name: "Cancelled", value: 19, color: "#DC2626" },
]

const statusTotal = statusData.reduce((s, d) => s + d.value, 0)

export function StatusDonut() {
  const { t } = useT()
  return (
    <div className="flex h-full flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 dark:border-[#374151] dark:bg-[#1F2937]">
      <div>
        <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.admin.appointmentStatus}</h3>
        <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#9CA3AF]">{t.admin.distributionToday}</p>
      </div>

      <div className="relative mt-2 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              stroke="none"
            >
              {statusData.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-[#111827] dark:text-[#F9FAFB]">{statusTotal}</span>
          <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.total}</span>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {statusData.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[#6B7280]">{d.name}</span>
            <span className="ml-auto font-medium text-[#111827]">
              {Math.round((d.value / statusTotal) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------- Appointments per doctor -------------------------- */

const doctorData = [
  { name: "Dr. Sara Reyes", initials: "SR", count: 94 },
  { name: "Dr. Amir Khan", initials: "AK", count: 78 },
  { name: "Dr. Lena Osei", initials: "LO", count: 71 },
  { name: "Dr. Marco Bianchi", initials: "MB", count: 69 },
]

const maxCount = Math.max(...doctorData.map((d) => d.count))

export function AppointmentsPerDoctor() {
  const { t } = useT()
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 dark:border-[#374151] dark:bg-[#1F2937]">
      <div>
        <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.admin.appointmentsPerDoctor}</h3>
        <p className="mt-0.5 text-xs text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#9CA3AF]">{t.admin.appointmentsPerDoctorPeriod}</p>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {doctorData.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            {/* Left axis: avatar + name */}
            <div className="flex w-44 shrink-0 items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F9FAFB] dark:bg-[#374151] dark:bg-[#374151] text-[11px] font-semibold text-[#6B7280] ring-1 ring-[#E5E7EB] dark:bg-[#374151] dark:text-[#9CA3AF] dark:ring-[#374151]">
                {d.initials}
              </span>
              <span className="truncate text-sm text-[#111827] dark:text-[#F9FAFB]">{d.name}</span>
            </div>
            {/* Bar track */}
            <div className="flex flex-1 items-center gap-3">
              <div className="h-6 flex-1 overflow-hidden rounded-md bg-[#F9FAFB] dark:bg-[#374151] dark:bg-[#374151]">
                <div
                  className="h-full rounded-md bg-[#0F766E]"
                  style={{ width: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-medium text-[#111827]">{d.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
