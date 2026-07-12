import { Stethoscope, LayoutDashboard, ListChecks, Users, CalendarDays } from "lucide-react"

const navGroups = [
  {
    label: "OVERVIEW",
    items: [{ icon: LayoutDashboard, label: "Overview", active: false }],
  },
  {
    label: "CLINICAL",
    items: [
      { icon: ListChecks, label: "My Queue", active: true },
      { icon: Users, label: "Patients", active: false },
      { icon: CalendarDays, label: "Schedule", active: false },
    ],
  },
]

export function DoctorSidebar() {
  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-[#E5E7EB] bg-white">
      {/* Logo mark */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F766E]">
          <Stethoscope className="h-[18px] w-[18px] text-white" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-[#111827]">Meridian</span>
          <span className="text-[11px] text-[#6B7280]">Clinic Suite</span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-[#6B7280]">{group.label}</p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label}>
                    <a
                      href="#"
                      className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        item.active
                          ? "bg-[#F9FAFB] font-medium text-[#111827]"
                          : "font-normal text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                      }`}
                    >
                      {item.active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#0F766E]" />
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

      {/* Doctor user card */}
      <div className="border-t border-[#E5E7EB] p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9FAFB] text-sm font-semibold text-[#111827]">
            SR
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-[#111827]">Dr. Sara Reyes</span>
            <span className="truncate text-[11px] text-[#6B7280]">Doctor</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
