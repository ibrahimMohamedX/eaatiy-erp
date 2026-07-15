"use client"

import { useState } from "react"
import { X, CalendarPlus, Search } from "lucide-react"
import { users, searchPatients } from "@/lib/mock-data"
import { deriveAge } from "@/lib/types"
import type { Patient, User } from "@/lib/types"
import { useT } from "@/lib/i18n/use-t"

type Props = {
  open: boolean
  onClose: () => void
}

type FormData = {
  patient_id: string
  patient_name: string
  doctor_id: string
  type: "new" | "follow_up"
  scheduled_date: string
  scheduled_time: string
}

const initialForm: FormData = {
  patient_id: "",
  patient_name: "",
  doctor_id: "",
  type: "new",
  scheduled_date: new Date().toISOString().slice(0, 10),
  scheduled_time: "",
}

const labelClass = "mb-1 block text-xs font-medium text-[#111827] dark:text-[#F9FAFB]"
const inputClass =
  "h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:placeholder:text-[#9CA3AF]"

const doctors = users.filter((u) => u.role === "doctor" && u.is_active)

export function AppointmentModal({ open, onClose }: Props) {
  const { t } = useT()
  const [form, setForm] = useState<FormData>(initialForm)
  const [patientQuery, setPatientQuery] = useState("")
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!open) return null

  const today = new Date().toISOString().slice(0, 10)

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function searchPatient(q: string) {
    setPatientQuery(q)
    if (q.length >= 2) {
      setPatientResults(searchPatients(q))
      setShowPatientDropdown(true)
    } else {
      setPatientResults([])
      setShowPatientDropdown(false)
    }
    if (q !== form.patient_name) {
      update("patient_id", "")
      update("patient_name", q)
    }
  }

  function selectPatient(patient: Patient) {
    update("patient_id", patient.id)
    update("patient_name", patient.full_name)
    setPatientQuery(patient.full_name)
    setShowPatientDropdown(false)
  }

  function handleSubmit() {
    console.log("Book appointment:", form)
    setSubmitted(true)
  }

  function handleClose() {
    setForm(initialForm)
    setPatientQuery("")
    setPatientResults([])
    setSubmitted(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#6B7280]/20 pt-[10vh] px-4 dark:bg-[#111827]/60">
      <div className="relative w-full max-w-lg rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.06)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_4px_24px_rgba(0,0,0,0.32)]">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4 dark:border-[#374151]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F766E]/[0.08]">
              <CalendarPlus className="h-[18px] w-[18px] text-[#0F766E]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.receptionist.bookAppointmentTitle}</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.receptionist.bookAppointmentDesc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#059669]/[0.12]">
              <CalendarPlus className="h-6 w-6 text-[#059669]" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.receptionist.appointmentBooked}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {t.receptionist.appointmentBookedDesc
                .replace("{name}", form.patient_name)
                .replace("{date}", form.scheduled_date)
                .replace("{time}", form.scheduled_time || "TBD")
                .replace("{doctor}", doctors.find((d) => d.id === form.doctor_id)?.full_name ?? "TBD")}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-[8px] bg-[#0F766E] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t.common.done}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 p-6">
              {/* Patient search */}
              <div className="relative">
                <label className={labelClass}>{t.entities.patient} *</label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    className={`${inputClass} pl-10`}
                    placeholder={t.common.searchPatientPlaceholder}
                    value={patientQuery}
                    onChange={(e) => searchPatient(e.target.value)}
                    onFocus={() => {
                      if (patientResults.length > 0) setShowPatientDropdown(true)
                    }}
                    onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
                  />
                </div>
                {showPatientDropdown && patientResults.length > 0 && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.06)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_4px_24px_rgba(0,0,0,0.32)]">
                    {patientResults.map((p) => {
                      const initials = p.full_name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={() => selectPatient(p)}
                          className={`flex w-full items-center gap-3 border-b border-[#E5E7EB] px-3 py-2.5 text-left last:border-b-0 dark:border-[#374151] ${
                            form.patient_id === p.id
                              ? "bg-[#0F766E]/[0.06] dark:bg-[#0F766E]/[0.15]"
                              : "hover:bg-[#F9FAFB] dark:hover:bg-[#374151]"
                          }`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] text-[10px] font-semibold text-[#6B7280] dark:border-[#374151] dark:text-[#9CA3AF]">
                            {initials}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{p.full_name}</p>
                            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                              {deriveAge(p.date_of_birth)} yrs · {p.phone}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Doctor selector */}
              <div>
                <label className={labelClass}>{t.receptionist.doctor} *</label>
                <select
                  className={inputClass}
                  value={form.doctor_id}
                  onChange={(e) => update("doctor_id", e.target.value)}
                >
                  <option value="">{t.common.selectDoctor}</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visit type */}
              <div>
                <label className={labelClass}>{t.receptionist.visitType}</label>
                <div className="flex h-10 items-center rounded-[8px] border border-[#E5E7EB] bg-white p-0.5 dark:border-[#374151] dark:bg-[#1F2937]">
                  <button
                    type="button"
                    onClick={() => update("type", "new")}
                    className={`h-8 flex-1 rounded-[6px] text-xs font-medium transition-colors ${
                      form.type === "new"
                        ? "bg-[#0F766E] text-white"
                        : "text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
                    }`}
                  >
                    {t.receptionist.newPatient}
                  </button>
                  <button
                    type="button"
                    onClick={() => update("type", "follow_up")}
                    className={`h-8 flex-1 rounded-[6px] text-xs font-medium transition-colors ${
                      form.type === "follow_up"
                        ? "bg-[#0F766E] text-white"
                        : "text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#E5E7EB]"
                    }`}
                  >
                    {t.receptionist.followUp}
                  </button>
                </div>
              </div>

              {/* Date + Time row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.receptionist.date} *</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.scheduled_date}
                    min={today}
                    onChange={(e) => update("scheduled_date", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t.receptionist.time} *</label>
                  <input
                    type="time"
                    className={inputClass}
                    value={form.scheduled_time}
                    onChange={(e) => update("scheduled_time", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4 dark:border-[#374151]">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!form.patient_id || !form.doctor_id || !form.scheduled_time}
                className="rounded-[8px] bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {t.receptionist.newAppointment}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}