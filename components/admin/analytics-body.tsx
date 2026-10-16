"use client"

import { OverviewTab } from "./overview-tab"
import { RevenueTab } from "./revenue-tab"
import { AppointmentsTab } from "./appointments-tab"
import { DoctorsTab } from "./doctors-tab"
import { AuditLog } from "./audit-log"
import { StaffTab } from "./manage/staff-tab"
import { ShiftsTab } from "./manage/shifts-tab"
import { SalariesTab } from "./manage/salaries-tab"
import { ExpensesTab } from "./manage/expenses-tab"
import { PaymentPolicyTab } from "./manage/payment-policy-tab"
import { SupervisorsTab } from "./manage/supervisors-tab"
import { useT } from "@/lib/i18n/use-t"
import type { DashboardData } from "@/lib/actions/admin/get-dashboard-data"
import type { RevenueTabData } from "@/lib/actions/admin/get-revenue-data"
import type { AppointmentRow } from "@/lib/actions/admin/get-appointments-data"
import type { AuditLogEntry } from "@/lib/actions/admin/get-audit-data"

export type TabKey =
  | "overview"
  | "revenue"
  | "appointments"
  | "doctors"
  | "audit"
  | "staff"
  | "shifts"
  | "salaries"
  | "expenses"
  | "policy"
  | "supervisors"

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
      {/* Loading / Error states */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      )}
      {error && !isLoading && (
        <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-lg bg-err/10 px-4 py-3 text-sm font-medium text-err">
          <span className="size-2 shrink-0 rounded-full bg-err" />
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
          {activeTab === "staff" && <StaffTab />}
          {activeTab === "shifts" && <ShiftsTab />}
          {activeTab === "salaries" && <SalariesTab />}
          {activeTab === "expenses" && <ExpensesTab />}
          {activeTab === "policy" && <PaymentPolicyTab />}
          {activeTab === "supervisors" && <SupervisorsTab />}
        </div>
      )}
    </div>
  )
}
