import { getTodayAppointments, getPatient, getUser, getDoctorInitials } from "@/lib/mock-data"
import { deriveAge, APPOINTMENT_STATUS_META } from "@/lib/types"
import { statusBg } from "@/lib/color-utils"

export function AppointmentsTab() {
  const appointments = getTodayAppointments()

  return (
    <div className="flex flex-col p-6">
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Today&apos;s Appointments</h3>
            <p className="mt-0.5 text-xs text-[#6B7280]">All doctors · {appointments.length} scheduled</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {["#", "Patient", "Age", "Doctor", "Time", "Type", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => {
                const patient = getPatient(apt.patient_id)
                const doctor = getUser(apt.doctor_id)
                const meta = APPOINTMENT_STATUS_META[apt.status]
                if (!patient) return null

                return (
                  <tr
                    key={apt.id}
                    className="border-b border-[#E5E7EB] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-xs font-bold text-[#6B7280]">
                        {apt.queue_number}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                      {patient.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">
                      {deriveAge(patient.date_of_birth)} yrs
                    </td>
                    <td className="px-4 py-3">
                      {doctor && (
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[10px] font-semibold text-[#6B7280]">
                            {getDoctorInitials(doctor)}
                          </span>
                          <span className="text-sm text-[#111827]">{doctor.full_name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#111827]">
                      {apt.scheduled_start.slice(11, 16)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
                        {apt.type === "new" ? "New" : "Follow-up"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: statusBg(meta.color),
                          color: meta.color,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}