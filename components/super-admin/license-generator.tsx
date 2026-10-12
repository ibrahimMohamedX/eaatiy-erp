"use client"

import { useState } from "react"
import { Key, Copy, Check, ShieldOff } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { generateLicense } from "@/lib/actions/super-admin/generate-license"
import { revokeLicense as revokeLicenseAction } from "@/lib/actions/super-admin/revoke-license"
import type { IdentityTenant } from "@/lib/db/repositories/identity/tenants"
import type { LicenseClaims } from "@/lib/actions/super-admin/generate-license"

interface LicenseGeneratorProps {
  tenants: IdentityTenant[]
  onMutated: () => void
}

export function LicenseGenerator({ tenants, onMutated }: LicenseGeneratorProps) {
  const { t } = useT()
  const sa = t["super-admin"]
  const [selectedTenantId, setSelectedTenantId] = useState<string>("")
  const [licenseToken, setLicenseToken] = useState<string | null>(null)
  const [claims, setClaims] = useState<LicenseClaims | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const activeTenants = tenants.filter((t) => t.status === "active")
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId)

  async function handleGenerate() {
    if (!selectedTenantId) return
    setLoading(true)
    setMessage(null)
    setLicenseToken(null)
    setClaims(null)

    try {
      const result = await generateLicense({ tenantId: selectedTenantId })
      if (result.success) {
        setLicenseToken(result.data.licenseToken)
        setClaims(result.data.claims)
        setMessage({
          ok: true,
          text: sa.licenseGeneratedDesc
            .replace("{name}", selectedTenant?.name ?? "")
            .replace("{seq}", String(result.data.claims.seq)),
        })
        onMutated()
      } else {
        setMessage({ ok: false, text: result.error })
      }
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke() {
    if (!selectedTenantId) return
    setLoading(true)
    setMessage(null)

    try {
      const result = await revokeLicenseAction(selectedTenantId)
      if (result.success) {
        setLicenseToken(null)
        setClaims(null)
        setMessage({
          ok: true,
          text: sa.licenseRevokedDesc
            .replace("{name}", selectedTenant?.name ?? ""),
        })
        onMutated()
      } else {
        setMessage({ ok: false, text: result.error })
      }
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!licenseToken) return
    await navigator.clipboard.writeText(licenseToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (activeTenants.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Key className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">
            {sa.licensingManagement}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Key className="h-10 w-10 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
            {t.common.noResults}
          </p>
          <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            No active tenants available for license management.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <Key className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">
          {sa.licensingManagement}
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left panel: tenant selector + actions */}
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 dark:border-[#374151] dark:bg-[#1F2937]">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
              {sa.selectTenantForLicense}
            </label>
            <select
              value={selectedTenantId}
              onChange={(e) => {
                setSelectedTenantId(e.target.value)
                setLicenseToken(null)
                setClaims(null)
                setMessage(null)
              }}
              className="mt-2 w-full h-9 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB]"
            >
              <option value="">— Select a tenant —</option>
              {activeTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug})
                </option>
              ))}
            </select>

            {/* Tenant details */}
            {selectedTenant && (
              <div className="mt-4 space-y-2 rounded-[8px] bg-[#F9FAFB] p-3 dark:bg-[#111827]">
                <DetailRow label={sa.tier} value={selectedTenant.subscription_tier} />
                <DetailRow label={sa.status} value={selectedTenant.status} />
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleGenerate}
                disabled={!selectedTenantId || loading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-[8px] bg-[#0F766E] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Key className="h-4 w-4" />
                )}
                {sa.generateLicense}
              </button>
              <button
                onClick={handleRevoke}
                disabled={!selectedTenantId || loading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-[8px] border border-[#DC2626] px-4 text-sm font-medium text-[#DC2626] transition-colors hover:bg-[#DC2626]/10 disabled:opacity-50"
              >
                <ShieldOff className="h-4 w-4" />
                {sa.revokeLicense}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mt-4 rounded-[8px] px-3 py-2 text-xs ${
                  message.ok
                    ? "bg-[#05966915] text-[#059669]"
                    : "bg-[#DC2626]/10 text-[#DC2626]"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>

          {/* Right panel: license token + claims */}
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 dark:border-[#374151] dark:bg-[#1F2937]">
            {licenseToken ? (
              <div className="space-y-4">
                {/* Copy button */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                    {sa.licenseToken}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex h-7 items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6] dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:bg-[#374151]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-[#059669]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Token (truncated) */}
                <div className="rounded-[8px] bg-[#F9FAFB] p-3 font-mono text-xs text-[#6B7280] break-all dark:bg-[#111827] dark:text-[#9CA3AF] max-h-32 overflow-y-auto">
                  {licenseToken}
                </div>

                {/* Claims */}
                {claims && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                      Claims
                    </span>
                    <div className="mt-2 rounded-[8px] bg-[#F9FAFB] p-3 space-y-1 text-xs dark:bg-[#111827]">
                      <ClaimRow label="Subject (tenant)" value={claims.sub} />
                      <ClaimRow label="Issued" value={new Date(claims.iat * 1000).toLocaleString()} />
                      <ClaimRow label="Expires" value={new Date(claims.exp * 1000).toLocaleString()} />
                      <ClaimRow label="Sequence" value={`#${claims.seq}`} />
                      <ClaimRow label="Installation ID" value={claims.installation_id} />
                      <ClaimRow label="Tier" value={claims.tier} />
                      <ClaimRow label="Max Users" value={String(claims.max_users)} />
                      <ClaimRow label="Features" value={claims.features.join(", ")} />
                      <ClaimRow label="Grace Days" value={String(claims.grace_days)} />
                    </div>
                  </div>
                )}
              </div>
            ) : selectedTenant ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Key className="h-10 w-10 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  No license generated
                </p>
                <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Click "Generate License" to issue a new token for this tenant.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Key className="h-10 w-10 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  {sa.selectTenantForLicense}
                </p>
                <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Select an active tenant to manage its license.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}

// ---------------------------------------------------------------------------
// Tiny helpers
// ---------------------------------------------------------------------------

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[#6B7280] dark:text-[#9CA3AF]">{label}</span>
      <span className="font-medium text-[#111827] dark:text-[#F9FAFB]">{value}</span>
    </div>
  )
}

function ClaimRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6B7280] dark:text-[#9CA3AF]">{label}</span>
      <span className="font-mono font-medium text-[#111827] dark:text-[#F9FAFB] max-w-[240px] truncate text-right">
        {value}
      </span>
    </div>
  )
}