"use client"

import {
  LayoutDashboard,
  Users,
  Cross,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { useAuth } from "@/lib/auth/auth-context"

type NavItem = { label: string; labelKey: string; icon: LucideIcon }
type NavGroup = { label: string; labelKey: string; items: NavItem[] }

function buildNavGroups(t: Record<string, any>) {
  const s = t.sidebar?.receptionist ?? {}
  return [
    {
      labelKey: "sidebar.receptionist.overview",
      label: s.overview ?? "OVERVIEW",
      items: [
        { labelKey: "sidebar.receptionist.dashboard", label: s.dashboard ?? "Dashboard", icon: LayoutDashboard },
        { labelKey: "sidebar.receptionist.patients", label: s.patients ?? "Patients", icon: Users },
      ],
    },
  ]
}

// Working views only — placeholder views removed
export type ReceptionistView =
  | "sidebar.receptionist.dashboard"
  | "sidebar.receptionist.patients"

type Props = {
  activeView: ReceptionistView
  onNavigate: (view: ReceptionistView) => void
}

export function Sidebar({ activeView, onNavigate }: Props) {
  const { t } = useT()
  const auth = useAuth()
  const NAV_GROUPS = buildNavGroups(t)
  const activeKey = activeView

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
      {/* Clinic brand dropdown */}
      <div className="border-b border-[#E5E7EB] p-3 dark:border-[#374151]">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left transition-colors hover:bg-[#F9FAFB] dark:hover:bg-[#374151]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#0F766E]">
            <Cross className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">Northgate Clinic</p>
            <p className="truncate text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.sidebar.receptionist.receptionConsole}</p>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.labelKey} className={gi > 0 ? "mt-7" : ""}>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] dark:text-[#9CA3AF]">
              {group.label}
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.labelKey === activeKey
                return (
                  <li key={item.labelKey}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.labelKey as ReceptionistView)}
                      className={
                        isActive
                          ? "relative flex h-9 w-full items-center gap-3 rounded-[8px] bg-[#0F766E]/[0.08] px-3 text-sm font-medium text-[#0F766E]"
                          : "flex h-9 w-full items-center gap-3 rounded-[8px] px-3 text-sm text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#374151] dark:hover:text-[#E5E7EB]"
                      }
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#0F766E]" />
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

      {/* User card fixed at bottom */}
      <div className="border-t border-[#E5E7EB] p-4 dark:border-[#374151]">
        <div className="flex items-center gap-3 rounded-[12px] border border-[#E5E7EB] p-3 dark:border-[#374151]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F766E]/[0.08] text-xs font-semibold text-[#0F766E]">
            {auth.session?.fullName
              ? auth.session.fullName
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
              : "HM"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
              {auth.session?.fullName ?? "Helena Marsh"}
            </p>
            <p className="truncate text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.sidebar.receptionist.receptionConsole}</p>
          </div>
          <button
            type="button"
            onClick={() => auth.logout()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] dark:text-[#9CA3AF] dark:hover:bg-[#450A0A] dark:hover:text-[#FCA5A5]"
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
