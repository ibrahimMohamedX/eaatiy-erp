"use client"

import { useState, useEffect, useCallback } from "react"
import { useT } from "@/lib/i18n/use-t"
import { getAllTenantsAction } from "@/lib/actions/super-admin/get-all-tenants"
import { getSuperAdminAuditLog as getSuperAdminAuditLogAction } from "@/lib/actions/super-admin/get-super-admin-audit-log"
import { SuperAdminTopBar } from "@/components/super-admin/top-bar"
import { TenantList } from "@/components/super-admin/tenant-list"
import { ProvisionModal } from "@/components/super-admin/provision-modal"
import { LicenseGenerator } from "@/components/super-admin/license-generator"
import { SuperAdminAudit } from "@/components/super-admin/super-admin-audit"
import { BusPaths } from "@/components/archai/bus-paths"
import type { IdentityTenant } from "@/lib/db/repositories/identity/tenants"
import type { AuditLog } from "@/lib/types"

export type SuperAdminTab = "tenants" | "licensing" | "audit"

export function SuperAdminPageShell() {
  const { t } = useT()
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("tenants")
  const [tenants, setTenants] = useState<IdentityTenant[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [showProvision, setShowProvision] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch tenants on mount and after mutations
  const fetchTenants = useCallback(async () => {
    const result = await getAllTenantsAction()
    if (result.success) {
      setTenants(result.data)
    }
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    const result = await getSuperAdminAuditLogAction()
    if (result.success) {
      setAuditLogs(result.data)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchTenants(), fetchAuditLogs()]).finally(() => setLoading(false))
  }, [fetchTenants, fetchAuditLogs])

  /** Refresh after a mutation (provision, status change, license gen) */
  const refreshData = useCallback(() => {
    fetchTenants()
    fetchAuditLogs()
  }, [fetchTenants, fetchAuditLogs])

  const tabLabels = t["super-admin"].tabs
  const tabKeys: SuperAdminTab[] = ["tenants", "licensing", "audit"]
  const activeTabLabel = tabLabels[tabKeys.indexOf(activeTab)]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar with action buttons */}
      <SuperAdminTopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onProvision={() => setShowProvision(true)}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Control-room page header — inert Bus Paths motif (MOTIF 01) */}
        <header className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-card p-6">
          <BusPaths active={false} />
          <div className="relative">
            <p className="archai-eyebrow">CONTROL ROOM</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
              {activeTabLabel}
            </h2>
          </div>
        </header>

        {loading ? (
          <div className="animate-archai-fade-up">
            <p className="sr-only">{t.common.loading}</p>
            {/* Greeting bar */}
            <div className="h-20 rounded-2xl bg-steel animate-pulse" />
            {/* KPI row */}
            <div className="mt-6 animate-archai-fade-up [animation-delay:120ms]">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-28 rounded-2xl bg-steel animate-pulse" />
                ))}
              </div>
            </div>
            {/* Main area */}
            <div className="mt-6 animate-archai-fade-up [animation-delay:240ms]">
              <div className="h-[420px] rounded-2xl bg-steel animate-pulse" />
            </div>
          </div>
        ) : activeTab === "tenants" ? (
          <TenantList tenants={tenants} onMutated={refreshData} />
        ) : activeTab === "licensing" ? (
          <LicenseGenerator tenants={tenants} onMutated={refreshData} />
        ) : activeTab === "audit" ? (
          <SuperAdminAudit logs={auditLogs} tenants={tenants} />
        ) : null}
      </main>

      {/* Provision modal */}
      <ProvisionModal
        open={showProvision}
        onClose={() => setShowProvision(false)}
        onProvisioned={refreshData}
      />
    </div>
  )
}
