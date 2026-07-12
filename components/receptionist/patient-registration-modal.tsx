"use client"

import { useState } from "react"
import { X, UserPlus } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
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

const labelClass = "mb-1 block text-xs font-medium text-[#111827]"
const inputClass =
  "h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"

export function PatientRegistrationModal({ open, onClose }: Props) {
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitted, setSubmitted] = useState(false)

  if (!open) return null

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    // In production, POST to /api/[tenant]/patients
    console.log("Register patient:", form)
    setSubmitted(true)
  }

  function handleClose() {
    setForm(initialForm)
    setSubmitted(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#6B7280]/20 pt-[10vh] px-4">
      <div className="relative w-full max-w-xl rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.06)]">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F766E]/[0.08]">
              <UserPlus className="h-[18px] w-[18px] text-[#0F766E]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#111827]">Register New Patient</h2>
              <p className="text-xs text-[#6B7280]">Add a patient to the clinic roster</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6B7280] hover:text-[#111827]"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#059669]/[0.12]">
              <UserPlus className="h-6 w-6 text-[#059669]" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#111827]">Patient Registered</p>
            <p className="mt-1 text-xs text-[#6B7280]">
              {form.full_name} has been added to the clinic roster.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-[8px] bg-[#0F766E] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Form body — 2-col grid */}
            <div className="grid grid-cols-2 gap-4 p-6">
              {/* Full Name */}
              <div className="col-span-2">
                <label className={labelClass}>Full Name *</label>
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
                <label className={labelClass}>Date of Birth *</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.date_of_birth}
                  onChange={(e) => update("date_of_birth", e.target.value)}
                />
              </div>

              {/* Gender */}
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  className={inputClass}
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>Phone *</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="patient@email.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className={labelClass}>Blood Group</label>
                <select
                  className={inputClass}
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
                <label className={labelClass}>Allergies</label>
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
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Street, city, ZIP"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>

              {/* Divider */}
              <div className="col-span-2 mt-2 border-t border-[#E5E7EB] pt-3">
                <p className="text-xs font-semibold text-[#6B7280]">
                  Emergency Contact (optional)
                </p>
              </div>

              {/* Emergency Name */}
              <div>
                <label className={labelClass}>Contact Name</label>
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
                <label className={labelClass}>Contact Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="+1 (555) 000-0000"
                  value={form.emergency_phone}
                  onChange={(e) => update("emergency_phone", e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!form.full_name || !form.date_of_birth || !form.phone}
                className="rounded-[8px] bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Register Patient
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}