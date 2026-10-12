"use client"

import { Stethoscope, LayoutDashboard, ListChecks, Users, CalendarDays, LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { useAuth } from "@/lib/auth/auth-context"

type NavItem = { icon: LucideIcon; label: string; labelKey: string }
type NavGroup = { label: string; labelKey: string; items: NavItem[] }

function buildNavGroups(t: Record<string, any>) {
  const s = t.sidebar?.doctor ?? {}
  return [
    {
      labelKey: "sidebar.doctor.overview",
      label: s.overview ?? "OVERVIEW",
      items: [
        { icon: LayoutDashboard, labelKey: "sidebar.doctor.overviewItem", label: s.overviewItem ?? "Overview" },
      ],
    },
    {
      labelKey: "sidebar.doctor.clinical",
      label: s.clinical ?? "CLINICAL",
      items: [
        { icon: ListChecks, labelKey: "sidebar.doctor.myQueue", label: s.myQueue ?? "My Queue" },
        { icon: Users, labelKey: "sidebar.doctor.patients", label: s.patients ?? "Patients" },
        { icon: CalendarDays, labelKey: "sidebar.doctor.schedule", label: s.schedule ?? "Schedule" },
      ],
    },
  ]
}

// View identifiers are stable labelKey strings — locale-independent
export type DoctorView =
  | "sidebar.doctor.overviewItem"
  | "sidebar.doctor.myQueue"
  | "sidebar.doctor.patients"
  | "sidebar.doctor.schedule"

type Props = {
  activeView: DoctorView
  onNavigate: (view: DoctorView) => void
}

export function DoctorSidebar({ activeView, onNavigate }: Props) {
  const { t } = useT()
  const auth = useAuth()
  const NAV_GROUPS = buildNavGroups(t)
  const activeKey = activeView

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
      {/* Logo mark */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F766E]">
          <Stethoscope className="h-[18px] w-[18px] text-white" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">Meridian</span>
          <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.sidebar.doctor.clinicSuite}</span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="mb-6">
            <p className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">{group.label}</p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.labelKey === activeKey
                return (
                  <li key={item.labelKey}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.labelKey as DoctorView)}
                      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-[#F9FAFB] font-medium text-[#111827] dark:bg-[#374151] dark:text-[#F9FAFB]"
                          : "font-normal text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#374151] dark:hover:text-[#E5E7EB]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#0F766E]" />
                      )}
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Doctor user card */}
      <div className="border-t border-[#E5E7EB] p-3 dark:border-[#374151]">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9FAFB] text-sm font-semibold text-[#111827] dark:bg-[#374151] dark:text-[#F9FAFB]">
            {auth.session?.fullName
              ? auth.session.fullName
                  .replace(/^Dr\.\s*/i, "")
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
              : "SR"}
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
              {auth.session?.fullName ?? "Dr. Sara Reyes"}
            </span>
            <span className="truncate text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.sidebar.doctor.doctor}</span>
          </div>
          <button
            type="button"
            onClick={() => auth.logout()}
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] dark:text-[#9CA3AF] dark:hover:bg-[#450A0A] dark:hover:text-[#FCA5A5]"
            aria-label={t.common.logOut}
            title={t.common.logOut}
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  )
}