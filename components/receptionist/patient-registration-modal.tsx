"use client"

import { useState, useTransition } from "react"
import { X, UserPlus } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { registerPatient } from "@/lib/actions/receptionist/register-patient"
import type { CreatePatientInput } from "@/lib/db/repositories/patients"

type Props = {
  open: boolean
  onClose: () => void
  onRegistered: () => void
}

type FormData = {
  full_name: string
  date_of_birth: string
  gender: string
  phone: string
  email: string
  address: string
  blood_group: string
  allergies: string
  emergency_name: string
  emergency_phone: string
}

const initialForm: FormData = {
  full_name: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  blood_group: "",
  allergies: "",
  emergency_name: "",
  emergency_phone: "",
}

const labelClass = "mb-1 block text-xs font-medium text-silver"
const inputClass =
  "h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none dark:bg-ink"

export function PatientRegistrationModal({ open, onClose, onRegistered }: Props) {
  const { t } = useT()
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    const input: CreatePatientInput = {
      full_name: form.full_name,
      date_of_birth: form.date_of_birth,
      gender: (form.gender as "male" | "female" | "other") || "other",
      phone: form.phone,
      email: form.email || undefined,
      address: form.address || undefined,
      emergency_contact_name: form.emergency_name || undefined,
      emergency_contact_phone: form.emergency_phone || undefined,
      blood_group: form.blood_group || undefined,
      allergies: form.allergies || undefined,
    }
    startTransition(async () => {
      const result = await registerPatient(input)
      if (result.success) {
        setSubmitted(true)
        onRegistered()
      }
    })
  }

  function handleClose() {
    setForm(initialForm)
    setSubmitted(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 pt-[10vh] px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl animate-archai-fade-up rounded-2xl border border-line bg-card shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-arc/10">
              <UserPlus className="size-[18px] text-arc" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{t.receptionist.registerPatientTitle}</h2>
              <p className="text-xs text-muted-foreground">{t.receptionist.registerPatientDesc}</p>
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
              <UserPlus className="size-6 text-ok" strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">{t.receptionist.patientRegistered}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.receptionist.patientRegisteredDesc.replace("{name}", form.full_name)}
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
            {/* Form body — 2-col grid */}
            <div className="grid grid-cols-2 gap-4 p-6">
              {/* Full Name */}
              <div className="col-span-2">
                <label className={labelClass}>{t.receptionist.fullName} *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Jane Doe"
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className={labelClass}>{t.receptionist.dateOfBirth} *</label>
                <input
                  type="date"
                  className={`${inputClass} ltr-in-rtl`}
                  value={form.date_of_birth}
                  onChange={(e) => update("date_of_birth", e.target.value)}
                />
              </div>

              {/* Gender */}
              <div>
                <label className={labelClass}>{t.receptionist.gender}</label>
                <select
                  className={inputClass}
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="male">{t.common.male}</option>
                  <option value="female">{t.common.female}</option>
                  <option value="other">{t.common.other}</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>{t.receptionist.phone} *</label>
                <input
                  type="tel"
                  className={`${inputClass} ltr-in-rtl`}
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>{t.receptionist.email}</label>
                <input
                  type="email"
                  className={`${inputClass} ltr-in-rtl`}
                  placeholder="patient@email.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className={labelClass}>{t.receptionist.bloodGroup}</label>
                <select
                  className={`${inputClass} ltr-in-rtl`}
                  value={form.blood_group}
                  onChange={(e) => update("blood_group", e.target.value)}
                >
                  <option value="">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Allergies */}
              <div>
                <label className={labelClass}>{t.receptionist.allergies}</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Penicillin, Latex"
                  value={form.allergies}
                  onChange={(e) => update("allergies", e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className={labelClass}>{t.receptionist.address}</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Street, city, ZIP"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>

              {/* Divider */}
              <div className="col-span-2 mt-2 border-t border-line pt-3">
                <p className="archai-eyebrow !text-mist">
                  {t.receptionist.emergencyContact}
                </p>
              </div>

              {/* Emergency Name */}
              <div>
                <label className={labelClass}>{t.receptionist.emergencyName}</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Next of kin"
                  value={form.emergency_name}
                  onChange={(e) => update("emergency_name", e.target.value)}
                />
              </div>

              {/* Emergency Phone */}
              <div>
                <label className={labelClass}>{t.receptionist.emergencyPhone}</label>
                <input
                  type="tel"
                  className={`${inputClass} ltr-in-rtl`}
                  placeholder="+1 (555) 000-0000"
                  value={form.emergency_phone}
                  onChange={(e) => update("emergency_phone", e.target.value)}
                />
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
                disabled={!form.full_name || !form.date_of_birth || !form.phone || isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-primary/85 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
              >
                {isPending ? "…" : t.receptionist.registerNewPatient}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
