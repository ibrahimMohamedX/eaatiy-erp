"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, LogOut } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { logoutSuperAdmin } from "@/lib/actions/super-admin/auth"
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
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const sa = t["super-admin"]
  const tabLabels = sa.tabs as [string, string, string]
  const tabKeys: SuperAdminTab[] = ["tenants", "licensing", "audit"]

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-card/60 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        {/* Title */}
        <h1 className="archai-eyebrow">{sa.superAdminConsole}</h1>

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
                className={
                  isActive
                    ? "inline-flex h-8 items-center rounded-lg bg-accent px-3 text-sm font-medium text-foreground"
                    : "inline-flex h-8 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                }
              >
                {tabLabels[idx]}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Provision button (only on tenants tab) — the single Arc action of this screen */}
        {activeTab === "tenants" && (
          <button
            onClick={onProvision}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/85 active:translate-y-px"
          >
            <Plus className="size-4" strokeWidth={1.75} />
            {sa.provisionNewTenant}
          </button>
        )}

        {/* Logout — clears the super_admin_key cookie; the page re-renders the gate */}
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await logoutSuperAdmin()
              router.refresh()
            })
          }
          disabled={isPending}
          className="flex size-9 items-center justify-center rounded-lg text-mist transition-colors duration-200 hover:bg-err/10 hover:text-err disabled:opacity-50"
          aria-label={t.common.logOut}
          title={t.common.logOut}
        >
          <LogOut className="size-[18px]" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  )
}
