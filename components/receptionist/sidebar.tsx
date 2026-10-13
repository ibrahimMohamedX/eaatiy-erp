"use client"

import {
  LayoutDashboard,
  Users,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { useAuth } from "@/lib/auth/auth-context"
import { ArchaiLogo } from "@/components/archai/archai-logo"

type NavItem = { label: string; labelKey: string; icon: LucideIcon }
type NavGroup = { label: string; labelKey: string; items: NavItem[] }

function buildNavGroups(t: Record<string, any>) {
  const s = t.sidebar?.receptionist ?? {}
  return [
    {
      labelKey: "sidebar.receptionist.overview",
      label: s.overview ?? "OVERVIEW",
      items: [
        { labelKey: "sidebar.receptionist.dashboard", label: s.dashboard ?? "Dashboard", icon: LayoutDashboard },
        { labelKey: "sidebar.receptionist.patients", label: s.patients ?? "Patients", icon: Users },
      ],
    },
  ]
}

// Working views only — placeholder views removed
export type ReceptionistView =
  | "sidebar.receptionist.dashboard"
  | "sidebar.receptionist.patients"

type Props = {
  activeView: ReceptionistView
  onNavigate: (view: ReceptionistView) => void
}

export function Sidebar({ activeView, onNavigate }: Props) {
  const { t } = useT()
  const auth = useAuth()
  const NAV_GROUPS = buildNavGroups(t)
  const activeKey = activeView

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-e border-line bg-sidebar">
      {/* Clinic brand — Archai lockup */}
      <div className="border-b border-line p-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-accent"
        >
          <ArchaiLogo variant="mark" size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">Northgate Clinic</p>
            <p className="truncate text-xs text-mist">{t.sidebar.receptionist.receptionConsole}</p>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-mist" strokeWidth={1.75} />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.labelKey} className={gi > 0 ? "mt-7" : ""}>
            <p className="archai-eyebrow px-2 !text-mist">{group.label}</p>
            <ul className="mt-2.5 flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.labelKey === activeKey
                return (
                  <li key={item.labelKey}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.labelKey as ReceptionistView)}
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

      {/* User card fixed at bottom */}
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-steel/40 p-3 dark:bg-ink/40">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-steel text-xs font-semibold text-silver">
            {auth.session?.fullName
              ? auth.session.fullName
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
              : "HM"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {auth.session?.fullName ?? "Helena Marsh"}
            </p>
            <p className="truncate text-xs text-mist">{t.sidebar.receptionist.receptionConsole}</p>
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
