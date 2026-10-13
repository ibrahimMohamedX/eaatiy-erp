"use client"

import { useState, useTransition } from "react"
import { X, CalendarPlus, Search } from "lucide-react"
import { deriveAge } from "@/lib/types"
import type { Patient, User } from "@/lib/types"
import { useT } from "@/lib/i18n/use-t"
import { searchPatients } from "@/lib/actions/receptionist/search-patients"
import { bookAppointment } from "@/lib/actions/receptionist/book-appointment"

type Props = {
  open: boolean
  onClose: () => void
  onBooked: () => void
  doctors: User[]
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

const labelClass = "mb-1 block text-xs font-medium text-silver"
const inputClass =
  "h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none dark:bg-ink"

export function AppointmentModal({ open, onClose, onBooked, doctors }: Props) {
  const { t } = useT()
  const [form, setForm] = useState<FormData>(initialForm)
  const [patientQuery, setPatientQuery] = useState("")
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const activeDoctors = doctors.filter((d) => d.role === "doctor" && d.is_active)

  if (!open) return null

  const today = new Date().toISOString().slice(0, 10)

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function searchPatient(q: string) {
    setPatientQuery(q)
    if (q.length >= 2) {
      const res = await searchPatients(q)
      if (res.success) {
        setPatientResults(res.data)
        setShowPatientDropdown(true)
      }
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
    startTransition(async () => {
      const result = await bookAppointment({
        patient_id: form.patient_id,
        doctor_id: form.doctor_id,
        type: form.type,
        scheduled_start: `${form.scheduled_date}T${form.scheduled_time}:00Z`,
      })
      if (result.success) {
        setSubmitted(true)
        onBooked()
      }
    })
  }

  function handleClose() {
    setForm(initialForm)
    setPatientQuery("")
    setPatientResults([])
    setSubmitted(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 pt-[10vh] px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg animate-archai-fade-up rounded-2xl border border-line bg-card shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-arc/10">
              <CalendarPlus className="size-[18px] text-arc" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{t.receptionist.bookAppointmentTitle}</h2>
              <p className="text-xs text-muted-foreground">{t.receptionist.bookAppointmentDesc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-lg text-mist transition-colors duration-200 hover:bg-accent hover:text-foreground"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-ok/10">
              <CalendarPlus className="size-6 text-ok" strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">{t.receptionist.appointmentBooked}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.receptionist.appointmentBookedDesc
                .replace("{name}", form.patient_name)
                .replace("{date}", form.scheduled_date)
                .replace("{time}", form.scheduled_time || "TBD")
                .replace("{doctor}", activeDoctors.find((d) => d.id === form.doctor_id)?.full_name ?? "TBD")}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-primary/85 active:translate-y-px"
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
                    className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-mist"
                    strokeWidth={1.75}
                  />
                  <input
                    type="text"
                    className={`${inputClass} ps-10`}
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
                  <div className="absolute start-0 top-full z-20 mt-1 w-full animate-archai-fade-in overflow-hidden rounded-lg border border-line bg-popover shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]">
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
                          className={`flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-start last:border-b-0 transition-colors duration-200 ${
                            form.patient_id === p.id ? "bg-arc/10" : "hover:bg-accent"
                          }`}
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-steel text-[10px] font-semibold text-silver">
                            {initials}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                            <p className="font-mono text-xs text-mist ltr-in-rtl">
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
                  {activeDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visit type */}
              <div>
                <label className={labelClass}>{t.receptionist.visitType}</label>
                <div className="flex h-10 items-center rounded-lg border border-line bg-card p-0.5 dark:bg-ink">
                  <button
                    type="button"
                    onClick={() => update("type", "new")}
                    className={`h-8 flex-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                      form.type === "new"
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.receptionist.newPatient}
                  </button>
                  <button
                    type="button"
                    onClick={() => update("type", "follow_up")}
                    className={`h-8 flex-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                      form.type === "follow_up"
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground"
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
                    className={`${inputClass} ltr-in-rtl`}
                    value={form.scheduled_date}
                    min={today}
                    onChange={(e) => update("scheduled_date", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t.receptionist.time} *</label>
                  <input
                    type="time"
                    className={`${inputClass} ltr-in-rtl`}
                    value={form.scheduled_time}
                    onChange={(e) => update("scheduled_time", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!form.patient_id || !form.doctor_id || !form.scheduled_time || isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-primary/85 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
              >
                {isPending ? "…" : t.receptionist.newAppointment}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
