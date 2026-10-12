"use client"

import { useState, useCallback, type FormEvent } from "react"
import { Building2 } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { provisionTenant } from "@/lib/actions/super-admin/provision-tenant"
import type { ProvisionTenantInput } from "@/lib/actions/super-admin/provision-tenant"

interface ProvisionModalProps {
  open: boolean
  onClose: () => void
  onProvisioned: () => void
}

const TIERS: ProvisionTenantInput["subscriptionTier"][] = ["trial", "basic", "premium"]

export function ProvisionModal({ open, onClose, onProvisioned }: ProvisionModalProps) {
  const { t } = useT()
  const sa = t["super-admin"]
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{
    ok: boolean
    message: string
  } | null>(null)
  const [form, setForm] = useState({
    clinicName: "",
    clinicSlug: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    phone: "",
    adminEmail: "",
    adminFullName: "",
    adminPassword: "",
    subscriptionTier: "trial" as ProvisionTenantInput["subscriptionTier"],
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = useCallback(() => {
    setForm({
      clinicName: "",
      clinicSlug: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      phone: "",
      adminEmail: "",
      adminFullName: "",
      adminPassword: "",
      subscriptionTier: "trial",
    })
    setResult(null)
  }, [])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setResult(null)

    try {
      const res = await provisionTenant({
        clinicName: form.clinicName,
        clinicSlug: form.clinicSlug,
        addressLine1: form.addressLine1,
        city: form.city,
        phone: form.phone,
        subscriptionTier: form.subscriptionTier,
        addressLine2: form.addressLine2 || undefined,
        adminEmail: form.adminEmail,
        adminFullName: form.adminFullName,
        adminPassword: form.adminPassword,
      })

      if (res.success) {
        setResult({
          ok: true,
          message: sa.tenantProvisionedDesc.replace("{name}", form.clinicName),
        })
        onProvisioned()
        // Reset form after a short delay so the user sees the success message
        setTimeout(() => {
          resetForm()
          onClose()
        }, 2000)
      } else {
        setResult({ ok: false, message: res.error })
      }
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setPending(false)
    }
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-[10vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={pending ? undefined : handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 mb-16 w-full max-w-lg rounded-[12px] border border-[#E5E7EB] bg-white shadow-xl dark:border-[#374151] dark:bg-[#1F2937]">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[#F3F4F6] px-6 py-4 dark:border-[#374151]">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-[#0F766E]" strokeWidth={1.5} />
            <div>
              <h2 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
                {sa.provisionTitle}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {sa.provisionDesc}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={pending}
            className="ml-4 inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] dark:hover:bg-[#374151] dark:hover:text-[#F9FAFB]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Result banner */}
        {result && (
          <div
            className={`mx-6 mt-4 rounded-[8px] px-4 py-3 text-sm ${
              result.ok
                ? "bg-[#05966915] text-[#059669]"
                : "bg-[#DC2626]/10 text-[#DC2626]"
            }`}
          >
            {result.message}
          </div>
        )}

        {/* Form body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Clinic Name */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label={sa.clinicName}>
              <input
                type="text"
                required
                value={form.clinicName}
                onChange={(e) => updateField("clinicName", e.target.value)}
                placeholder="Northgate Clinic"
                className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280]"
                disabled={pending}
              />
            </FormField>
            <FormField label={sa.clinicSlug}>
              <input
                type="text"
                required
                value={form.clinicSlug}
                onChange={(e) => updateField("clinicSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="northgate"
                className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#111827] placeholder:text-[#9CA3AF] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280]"
                disabled={pending}
                pattern="^[a-z0-9][a-z0-9-]*[a-z0-9]$"
                minLength={3}
                maxLength={63}
              />
              <p className="mt-1 text-xs text-[#9CA3AF]">{sa.slugHint}</p>
            </FormField>
          </div>

          {/* Address */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label={sa.addressLine1}>
              <input
                type="text"
                required
                value={form.addressLine1}
                onChange={(e) => updateField("addressLine1", e.target.value)}
                placeholder="142 Elm Street"
                className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280]"
                disabled={pending}
              />
            </FormField>
            <FormField label={sa.addressLine2}>
              <input
                type="text"
                value={form.addressLine2}
                onChange={(e) => updateField("addressLine2", e.target.value)}
                placeholder="Suite 5 (optional)"
                className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280]"
                disabled={pending}
              />
            </FormField>
          </div>

          {/* City / Phone / Tier */}
          <div className="grid grid-cols-3 gap-4">
            <FormField label={sa.city}>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="San Francisco, CA 94102"
                className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280]"
                disabled={pending}
              />
            </FormField>
            <FormField label={t.receptionist.phone}>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="(555) 018-2245"
                className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280]"
                disabled={pending}
              />
            </FormField>
            <FormField label={sa.subscriptionTier}>
              <select
                value={form.subscriptionTier}
                onChange={(e) => updateField("subscriptionTier", e.target.value)}
                className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB]"
                disabled={pending}
              >
                {TIERS.map((tier) => {
                  const key = tier as keyof typeof sa.tierValues
                  return (
                    <option key={tier} value={tier}>
                      {sa.tierValues[key] ?? tier}
                    </option>
                  )
                })}
              </select>
            </FormField>
          </div>

          {/* Divider */}
          <hr className="border-[#F3F4F6] dark:border-[#374151]" />

          {/* Admin User */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label={sa.adminFullName}>
              <input
                type="text"
                required
                value={form.adminFullName}
                onChange={(e) => updateField("adminFullName", e.target.value)}
                placeholder="Amelia Monroe"
                className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280]"
                disabled={pending}
              />
            </FormField>
            <FormField label={sa.adminEmail}>
              <input
                type="email"
                required
                value={form.adminEmail}
                onChange={(e) => updateField("adminEmail", e.target.value)}
                placeholder="admin@northgate.com"
                className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280]"
                disabled={pending}
              />
            </FormField>
          </div>
          <FormField label="Admin Password">
            <input
              type="password"
              required
              value={form.adminPassword}
              onChange={(e) => updateField("adminPassword", e.target.value)}
              placeholder="Minimum 8 characters"
              minLength={8}
              className="w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280]"
              disabled={pending}
            />
          </FormField>

          {/* Footer buttons */}
          <div className="flex justify-between gap-3 pt-2">
            <div>
              {/* No extra action needed for now */}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={pending}
                className="inline-flex h-9 items-center rounded-[8px] border border-[#E5E7EB] px-5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6] dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:bg-[#374151] disabled:opacity-50"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#0F766E] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Provisioning…
                  </>
                ) : (
                  sa.provisionNewTenant
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tiny reusable form field wrapper
// ---------------------------------------------------------------------------

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
        {label}
      </span>
      {children}
    </label>
  )
}