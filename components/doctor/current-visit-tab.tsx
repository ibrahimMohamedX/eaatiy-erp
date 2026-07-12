import type { Patient, Appointment, MedicalRecord } from "@/lib/types"

type Props = {
  patient: Patient
  appointment: Appointment
  existingRecord?: MedicalRecord
}

const fieldDefs = [
  { key: "chief_complaint" as const, label: "Chief Complaint", rows: 2 },
  { key: "diagnosis" as const, label: "Diagnosis", rows: 4 },
  { key: "notes" as const, label: "Doctor's Notes", rows: 8 },
]

export function CurrentVisitTab({ patient, appointment, existingRecord }: Props) {
  const isCompleted = appointment.status === "completed"

  return (
    <div className="relative">
      {/* Patient context banner */}
      <div className="flex items-center gap-4 px-5 pt-5">
        <div className="flex items-center gap-2">
          <p className="text-sm text-[#6B7280]">
            {appointment.type === "new" ? "New Patient" : "Follow-up"} · Queue #
            {appointment.queue_number}
          </p>
        </div>
        {isCompleted && (
          <span className="rounded-full bg-[#059669]/[0.12] px-2.5 py-0.5 text-xs font-medium text-[#059669]">
            Completed
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5 p-5 pb-24">
        {fieldDefs.map((field) => (
          <div key={field.key} className="flex flex-col gap-2">
            <label
              htmlFor={`field-${field.key}`}
              className="text-[13px] font-medium text-[#111827]"
            >
              {field.label}
            </label>
            <textarea
              id={`field-${field.key}`}
              rows={field.rows}
              defaultValue={existingRecord?.[field.key] ?? ""}
              readOnly={isCompleted}
              placeholder={
                isCompleted
                  ? "No notes recorded"
                  : field.key === "chief_complaint"
                    ? "Enter the patient's primary complaint…"
                    : field.key === "diagnosis"
                      ? "Enter diagnosis and clinical findings…"
                      : "Enter additional clinical notes, observations, and care instructions…"
              }
              className={`w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm leading-relaxed text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] ${
                isCompleted ? "bg-[#F9FAFB]" : ""
              }`}
            />
          </div>
        ))}
      </div>

      {/* Sticky footer */}
      {!isCompleted && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#E5E7EB] bg-white px-5 py-3.5 rounded-b-[12px]">
          <button
            type="button"
            className="rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB]"
          >
            Save Draft
          </button>
          <button
            type="button"
            className="rounded-[8px] bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Complete Consultation
          </button>
        </div>
      )}
    </div>
  )
}