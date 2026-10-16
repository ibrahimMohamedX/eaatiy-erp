"use client"

import { Stethoscope, ListChecks, LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { useAuth } from "@/lib/auth/auth-context"

type NavItem = { icon: LucideIcon; label: string; labelKey: string }
type NavGroup = { label: string; labelKey: string; items: NavItem[] }

function buildNavGroups(t: Record<string, any>) {
  const s = t.sidebar?.doctor ?? {}
  return [
    {
      labelKey: "sidebar.doctor.clinical",
      label: s.clinical ?? "CLINICAL",
      items: [
        { icon: ListChecks, labelKey: "sidebar.doctor.myQueue", label: s.myQueue ?? "My Queue" },
      ],
    },
  ]
}

// View identifiers are stable labelKey strings — locale-independent
export type DoctorView =
  "sidebar.doctor.myQueue"

type Props = {
  activeView: DoctorView
  onNavigate: (view: DoctorView) => void
}

export function DoctorSidebar({ activeView, onNavigate }: Props) {
  const { t } = useT()
  const auth = useAuth()
  const NAV_GROUPS = buildNavGroups(t)
  const activeKey = activeView

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-e border-line bg-sidebar">
      {/* Logo mark */}
      <div className="border-b border-line p-4">
        <div className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-[18px]" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-foreground">Meridian</span>
            <span className="block truncate text-xs text-mist">{t.sidebar.doctor.clinicSuite}</span>
          </div>
        </div>
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
                      onClick={() => onNavigate(item.labelKey as DoctorView)}
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

      {/* Doctor user card */}
      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-steel/40 p-3 dark:bg-ink/40">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-steel text-xs font-semibold text-silver">
            {auth.session?.fullName
              ? auth.session.fullName
                  .replace(/^Dr\.\s*/i, "")
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
              : "SR"}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-medium text-foreground">
              {auth.session?.fullName ?? "Dr. Sara Reyes"}
            </span>
            <span className="block truncate text-xs text-mist">{t.sidebar.doctor.doctor}</span>
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
