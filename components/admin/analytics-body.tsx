"use client"

import { OverviewTab } from "./overview-tab"
import { RevenueTab } from "./revenue-tab"
import { AppointmentsTab } from "./appointments-tab"
import { DoctorsTab } from "./doctors-tab"
import { AuditLog } from "./audit-log"
import { useT } from "@/lib/i18n/use-t"

export type TabKey = "overview" | "revenue" | "appointments" | "doctors" | "audit"

type Props = {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

export function AnalyticsBody({ activeTab, onTabChange }: Props) {
  const { t } = useT()

  const TABS: { key: TabKey; label: string }[] = [
    { key: "overview", label: t.admin.tabs[0] },
    { key: "revenue", label: t.admin.tabs[1] },
    { key: "appointments", label: t.admin.tabs[2] },
    { key: "doctors", label: t.admin.tabs[3] },
    { key: "audit", label: t.admin.tabs[4] },
  ]

  return (
    <div className="flex flex-col">
      {/* Underline-style tab row */}
      <div className="shrink-0 border-b border-[#E5E7EB] bg-white px-6 dark:border-[#374151] dark:bg-[#1F2937]">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const active = tab.key === activeTab
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`relative px-4 py-3 text-sm transition-colors ${
                  active
                    ? "font-medium text-[#111827] dark:text-[#F9FAFB]"
                    : "font-normal text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-[#0F766E]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active tab body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "revenue" && <RevenueTab />}
        {activeTab === "appointments" && <AppointmentsTab />}
        {activeTab === "doctors" && <DoctorsTab />}
        {activeTab === "audit" && <AuditLog />}
      </div>
    </div>
  )
}