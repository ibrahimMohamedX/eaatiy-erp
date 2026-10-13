"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { AnalyticsBody } from "@/components/admin/analytics-body"
import type { AdminNavKey } from "@/components/admin/sidebar"
import type { TabKey } from "@/components/admin/analytics-body"
import type { DashboardData } from "@/lib/actions/admin/get-dashboard-data"
import { getDashboardData } from "@/lib/actions/admin/get-dashboard-data"
import { getRevenueData } from "@/lib/actions/admin/get-revenue-data"
import type { RevenueTabData } from "@/lib/actions/admin/get-revenue-data"
import { getAppointmentsData } from "@/lib/actions/admin/get-appointments-data"
import type { AppointmentRow } from "@/lib/actions/admin/get-appointments-data"
import { getAuditData } from "@/lib/actions/admin/get-audit-data"
import type { AuditLogEntry } from "@/lib/actions/admin/get-audit-data"

type Props = {
  initialData: DashboardData | null
  fetchError: string | null
}

const DATE_RANGE_LABELS: Record<string, { since: string | undefined }> = {
  "Today": { since: new Date(new Date().toISOString().slice(0, 10)).toISOString() },
  "Yesterday": {
    since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10) + "T00:00:00.000Z",
  },
  "7 Days": { since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  "30 Days": { since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  "90 Days": { since: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
  "This Month": {
    since: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  },
  "This Year": {
    since: new Date(new Date().getFullYear(), 0, 1).toISOString(),
  },
  "Custom": { since: undefined },
}

export function AdminPageShell({ initialData, fetchError }: Props) {
  const [dateRange, setDateRange] = useState("30 Days")
  const [activeTab, setActiveTab] = useState<TabKey>("overview")

  // Data state — initialized from server, refreshed on tab/range changes
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(initialData)
  const [revenueData, setRevenueData] = useState<RevenueTabData | null>(null)
  const [appointmentRows, setAppointmentRows] = useState<AppointmentRow[] | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[] | null>(null)
  const [auditFilters, setAuditFilters] = useState<{
    targetTable?: string; action?: string; actorId?: string; since?: string; searchRowId?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(fetchError)

  function handleNavigate(key: AdminNavKey) {
    setActiveTab(key)
    // Lazily load tab-specific data when switching tabs
    loadTabData(key, dateRange)
  }

  function handleRangeChange(range: string) {
    setDateRange(range)
    // Refresh all loaded data on range change
    loadTabData(activeTab, range)
  }

  function handleAuditFilterChange(filters: {
    targetTable?: string; action?: string; actorId?: string; since?: string; searchRowId?: string
  }) {
    const merged = { ...auditFilters, ...filters }
    // Remove undefined keys so they don't override intentional clears
    Object.keys(merged).forEach((k) => {
      if ((merged as Record<string, unknown>)[k] === undefined) {
        delete (merged as Record<string, unknown>)[k]
      }
    })
    setAuditFilters(merged)

    // Fire the filtered request immediately
    setIsLoading(true)
    getAuditData(merged).then((result) => {
      setIsLoading(false)
      if (result.success) {
        setAuditEntries(result.data)
        setError(null)
      } else {
        setError(result.error)
      }
    }).catch((err) => {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : "Failed to load")
    })
  }

  function loadTabData(tab: TabKey, range: string) {
    const { since } = DATE_RANGE_LABELS[range] ?? { since: undefined }
    setIsLoading(true)

    switch (tab) {
      case "overview":
        getDashboardData(since).then((result) => {
          setIsLoading(false)
          if (result.success) {
            setDashboardData(result.data)
            setError(null)
          } else {
            setError(result.error)
          }
        }).catch((err) => {
          setIsLoading(false)
          setError(err instanceof Error ? err.message : "Failed to load")
        })
        break
      case "revenue":
        getRevenueData(since).then((result) => {
          setIsLoading(false)
          if (result.success) {
            setRevenueData(result.data)
            setError(null)
          } else {
            setError(result.error)
          }
        }).catch((err) => {
          setIsLoading(false)
          setError(err instanceof Error ? err.message : "Failed to load")
        })
        break
      case "appointments":
        getAppointmentsData(since).then((result) => {
          setIsLoading(false)
          if (result.success) {
            setAppointmentRows(result.data)
            setError(null)
          } else {
            setError(result.error)
          }
        }).catch((err) => {
          setIsLoading(false)
          setError(err instanceof Error ? err.message : "Failed to load")
        })
        break
      case "audit":
        getAuditData(auditFilters).then((result) => {
          setIsLoading(false)
          if (result.success) {
            setAuditEntries(result.data)
            setError(null)
          } else {
            setError(result.error)
          }
        }).catch((err) => {
          setIsLoading(false)
          setError(err instanceof Error ? err.message : "Failed to load")
        })
        break
      default:
        setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeKey={activeTab} onNavigate={handleNavigate} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopBar activeRange={dateRange} onRangeChange={handleRangeChange} />
        <main className="flex-1 overflow-y-auto">
          <AnalyticsBody
            activeTab={activeTab}
            onTabChange={handleNavigate}
            dashboardData={dashboardData}
            revenueData={revenueData}
            appointmentRows={appointmentRows}
            auditEntries={auditEntries}
            onAuditFilterChange={handleAuditFilterChange}
            isLoading={isLoading}
            error={error}
          />
        </main>
      </div>
    </div>
  )
}