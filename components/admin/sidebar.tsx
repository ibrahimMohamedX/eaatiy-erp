"use client"

import { Activity, BarChart3, ScrollText, Users, CreditCard, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"

export type AdminNavKey = "overview" | "revenue" | "appointments" | "doctors" | "audit"

type NavItem = { icon: LucideIcon; label: string; key: AdminNavKey }

type Props = {
  activeKey: AdminNavKey
  onNavigate: (key: AdminNavKey) => void
}

export function AdminSidebar({ activeKey, onNavigate }: Props) {
  const { t } = useT()

  const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
    {
      label: t.sidebar.admin.admin,
      items: [
        { icon: BarChart3, label: t.sidebar.admin.analytics, key: "overview" },
        { icon: ScrollText, label: t.sidebar.admin.auditLog, key: "audit" },
        { icon: Users, label: t.sidebar.admin.staffRoles, key: "doctors" },
        { icon: CreditCard, label: t.sidebar.admin.billingOverview, key: "revenue" },
        { icon: Settings, label: t.sidebar.admin.clinicSettings, key: "appointments" },
      ],
    },
  ]

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
      {/* Logo mark */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F766E]">
          <Activity className="h-[18px] w-[18px] text-white" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">Meridian</span>
          <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.clinicSuite}</span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">{group.label}</p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.key === activeKey
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.key)}
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

      {/* Admin user card */}
      <div className="border-t border-[#E5E7EB] p-3 dark:border-[#374151]">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9FAFB] text-sm font-semibold text-[#111827] dark:bg-[#374151] dark:text-[#F9FAFB]">
            AM
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Amelia Monroe</span>
            <span className="truncate text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.administrator}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
