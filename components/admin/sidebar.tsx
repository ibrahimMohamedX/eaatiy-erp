"use client"

import { Activity, BarChart3, ScrollText, Users, CreditCard, Settings, LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { useAuth } from "@/lib/auth/auth-context"

export type AdminNavKey = "overview" | "revenue" | "appointments" | "doctors" | "audit"

type NavItem = { icon: LucideIcon; label: string; key: AdminNavKey }

type Props = {
  activeKey: AdminNavKey
  onNavigate: (key: AdminNavKey) => void
}

export function AdminSidebar({ activeKey, onNavigate }: Props) {
  const { t } = useT()
  const auth = useAuth()

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
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-e border-line bg-sidebar">
      {/* Brand mark */}
      <div className="flex items-center gap-2.5 border-b border-line p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary">
          <Activity className="size-[18px] text-primary-foreground" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold text-foreground">Meridian</span>
          <span className="block truncate text-xs text-mist">{t.admin.clinicSuite}</span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="archai-eyebrow px-2 !text-mist">{group.label}</p>
            <ul className="mt-2.5 flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.key === activeKey
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.key)}
                      className={
                        isActive
                          ? "relative flex h-10 w-full items-center gap-3 rounded-lg bg-accent px-3 text-sm font-medium text-foreground"
                          : "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                      }
                    >
                      {isActive && (
                        <span className="absolute start-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-arc" />
                      )}
                      <Icon
                        className={`size-[18px] ${isActive ? "text-arc" : ""}`}
                        strokeWidth={1.75}
                      />
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Admin user card fixed at bottom */}
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-steel/40 p-3 dark:bg-ink/40">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-steel text-xs font-semibold text-silver">
            {auth.session?.fullName
              ? auth.session.fullName
                  .replace(/^Dr\.\s*/i, "")
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
              : "AM"}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-medium text-foreground">
              {auth.session?.fullName ?? "Amelia Monroe"}
            </span>
            <span className="block truncate text-xs text-mist">{t.admin.administrator}</span>
          </div>
          <button
            type="button"
            onClick={() => auth.logout()}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-mist transition-colors duration-200 hover:bg-err/10 hover:text-err"
            aria-label={t.common.logOut}
            title={t.common.logOut}
          >
            <LogOut className="size-[18px]" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  )
}
