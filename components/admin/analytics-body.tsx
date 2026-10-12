"use client"

import { OverviewTab } from "./overview-tab"
import { RevenueTab } from "./revenue-tab"
import { AppointmentsTab } from "./appointments-tab"
import { DoctorsTab } from "./doctors-tab"
import { AuditLog } from "./audit-log"
import { useT } from "@/lib/i18n/use-t"
import type { DashboardData } from "@/lib/actions/admin/get-dashboard-data"
import type { RevenueTabData } from "@/lib/actions/admin/get-revenue-data"
import type { AppointmentRow } from "@/lib/actions/admin/get-appointments-data"
import type { AuditLogEntry } from "@/lib/actions/admin/get-audit-data"

export type TabKey = "overview" | "revenue" | "appointments" | "doctors" | "audit"

type Props = {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  dashboardData: DashboardData | null
  revenueData: RevenueTabData | null
  appointmentRows: AppointmentRow[] | null
  auditEntries: AuditLogEntry[] | null
  onAuditFilterChange?: (filters: { targetTable?: string; action?: string; actorId?: string; since?: string; searchRowId?: string }) => void
  isLoading: boolean
  error: string | null
}

export function AnalyticsBody({
  activeTab,
  onTabChange,
  dashboardData,
  revenueData,
  appointmentRows,
  auditEntries,
  onAuditFilterChange,
  isLoading,
  error,
}: Props) {
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

      {/* Loading / Error states */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Loading…</p>
        </div>
      )}
      {error && !isLoading && (
        <div className="mx-6 mt-4 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-xs text-[#DC2626] dark:border-[#7F1D1D] dark:bg-[#450A0A] dark:text-[#FCA5A5]">
          {error}
        </div>
      )}

      {/* Active tab body */}
      {!isLoading && (
        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && <OverviewTab data={dashboardData} />}
          {activeTab === "revenue" && <RevenueTab data={revenueData} />}
          {activeTab === "appointments" && <AppointmentsTab rows={appointmentRows} />}
          {activeTab === "doctors" && <DoctorsTab data={dashboardData} />}
          {activeTab === "audit" && <AuditLog entries={auditEntries} onFilterChange={onAuditFilterChange} />}
        </div>
      )}
    </div>
  )
}