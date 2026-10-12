"use client"

import { Plus, LogOut } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { useAuth } from "@/lib/auth/auth-context"
import type { SuperAdminTab } from "@/app/super-admin/super-admin-page-shell"

interface SuperAdminTopBarProps {
  activeTab: SuperAdminTab
  onTabChange: (tab: SuperAdminTab) => void
  onProvision: () => void
}

export function SuperAdminTopBar({
  activeTab,
  onTabChange,
  onProvision,
}: SuperAdminTopBarProps) {
  const { t } = useT()
  const auth = useAuth()
  const sa = t["super-admin"]
  const tabLabels = sa.tabs as [string, string, string]
  const tabKeys: SuperAdminTab[] = ["tenants", "licensing", "audit"]

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 dark:border-[#374151] dark:bg-[#1F2937]">
      <div className="flex items-center gap-6">
        {/* Title */}
        <h1 className="text-sm font-semibold uppercase tracking-wider text-[#111827] dark:text-[#F9FAFB]">
          {sa.superAdminConsole}
        </h1>

        {/* Tab switcher */}
        <nav className="flex items-center gap-1" role="tablist">
          {tabKeys.map((key, idx) => {
            const isActive = key === activeTab
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(key)}
                className={`inline-flex h-8 items-center rounded-[6px] px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#0F766E] text-white"
                    : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#374151] dark:hover:text-[#F9FAFB]"
                }`}
              >
                {tabLabels[idx]}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Provision button (only on tenants tab) */}
        {activeTab === "tenants" && (
          <button
            onClick={onProvision}
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[#0F766E] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {sa.provisionNewTenant}
          </button>
        )}

        {/* Logout */}
        <button
          type="button"
          onClick={() => auth.logout()}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] dark:text-[#9CA3AF] dark:hover:bg-[#450A0A] dark:hover:text-[#FCA5A5]"
          aria-label={t.common.logOut}
          title={t.common.logOut}
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}