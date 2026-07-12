import {
  LayoutDashboard,
  Activity,
  Users,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Settings,
  ShieldCheck,
  Cross,
  ChevronsUpDown,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type NavItem = { label: string; icon: LucideIcon; active?: boolean }
type NavGroup = { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, active: true },
      { label: "Live Activity", icon: Activity },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Patients", icon: Users },
      { label: "Appointments", icon: CalendarClock },
      { label: "Triage & Vitals", icon: ClipboardList },
      { label: "Billing", icon: CreditCard },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { label: "Preferences", icon: Settings },
      { label: "Access & Security", icon: ShieldCheck },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white">
      {/* Clinic brand dropdown */}
      <div className="border-b border-[#E5E7EB] p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left transition-colors hover:bg-[#F9FAFB]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#0F766E]">
            <Cross className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#111827]">Northgate Clinic</p>
            <p className="truncate text-[11px] text-[#6B7280]">Reception Console</p>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#6B7280]" strokeWidth={1.5} />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-7" : ""}>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              {group.label}
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label}>
                    <a
                      href="#"
                      className={
                        item.active
                          ? "relative flex h-9 items-center gap-3 rounded-[8px] bg-[#0F766E]/[0.08] px-3 text-sm font-medium text-[#0F766E]"
                          : "flex h-9 items-center gap-3 rounded-[8px] px-3 text-sm text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827]"
                      }
                    >
                      {item.active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#0F766E]" />
                      )}
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card fixed at bottom */}
      <div className="border-t border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3 rounded-[12px] border border-[#E5E7EB] p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F766E]/[0.08] text-xs font-semibold text-[#0F766E]">
            HM
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#111827]">Helena Marsh</p>
            <p className="truncate text-xs text-[#6B7280]">Receptionist</p>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#6B7280]" strokeWidth={1.5} />
        </div>
      </div>
    </aside>
  )
}
