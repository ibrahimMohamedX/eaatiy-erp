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

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] dark:bg-[#111827]">
      {/* Top bar with action buttons */}
      <SuperAdminTopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onProvision={() => setShowProvision(true)}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{t.common.loading}</p>
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