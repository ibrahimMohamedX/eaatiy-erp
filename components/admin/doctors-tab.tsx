import { Stethoscope, TrendingUp, Users, CalendarDays } from "lucide-react"
import { users, appointments, getTodayAppointments } from "@/lib/mock-data"
import type { User } from "@/lib/types"
import { AppointmentsPerDoctor } from "./analytics-charts"

export function DoctorsTab() {
  const doctors = users.filter((u) => u.role === "doctor" && u.is_active)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Bar chart */}
      <AppointmentsPerDoctor />

      {/* Doctor performance cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {doctors.map((doctor) => {
          const todayApts = getTodayAppointments(doctor.id)
          const totalCompleted = appointments.filter(
            (a) => a.doctor_id === doctor.id && a.status === "completed",
          ).length
          const totalApts = appointments.filter(
            (a) => a.doctor_id === doctor.id,
          ).length

          const initials = doctor.full_name
            .replace(/^Dr\.\s*/i, "")
            .split(" ")
            .map((p) => p[0])
            .join("")
            .toUpperCase()

          return (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              initials={initials}
              todayCount={todayApts.length}
              completedCount={totalCompleted}
              totalCount={totalApts}
            />
          )
        })}
      </div>
    </div>
  )
}

function DoctorCard({
  doctor,
  initials,
  todayCount,
  completedCount,
  totalCount,
}: {
  doctor: User
  initials: string
  todayCount: number
  completedCount: number
  totalCount: number
}) {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5">
      {/* Doctor identity */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F766E]/[0.08] text-sm font-semibold text-[#0F766E] ring-1 ring-[#0F766E]/20">
          {initials}
        </span>
        <div>
          <p className="text-sm font-semibold text-[#111827]">{doctor.full_name}</p>
          <p className="text-xs text-[#6B7280]">{doctor.email}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[8px] bg-[#F9FAFB] p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <CalendarDays className="h-4 w-4 text-[#0F766E]" strokeWidth={1.5} />
          </div>
          <p className="mt-1 text-lg font-semibold text-[#111827]">{todayCount}</p>
          <p className="text-[11px] text-[#6B7280]">Today</p>
        </div>
        <div className="rounded-[8px] bg-[#F9FAFB] p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Stethoscope className="h-4 w-4 text-[#059669]" strokeWidth={1.5} />
          </div>
          <p className="mt-1 text-lg font-semibold text-[#111827]">{completedCount}</p>
          <p className="text-[11px] text-[#6B7280]">Completed</p>
        </div>
        <div className="rounded-[8px] bg-[#F9FAFB] p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Users className="h-4 w-4 text-[#2563EB]" strokeWidth={1.5} />
          </div>
          <p className="mt-1 text-lg font-semibold text-[#111827]">{totalCount}</p>
          <p className="text-[11px] text-[#6B7280]">Total</p>
        </div>
      </div>
    </div>
  )
}