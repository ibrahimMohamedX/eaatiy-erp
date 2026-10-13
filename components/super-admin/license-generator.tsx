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
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-arc/10">
            <Key className="size-[18px] text-arc" strokeWidth={1.75} />
          </span>
          <h2 className="font-display text-xl font-semibold text-foreground">
            {sa.licensingManagement}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-card py-16 text-center">
          <Key className="size-10 text-mist" strokeWidth={1.75} />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            {t.common.noResults}
          </p>
          <p className="mt-1 text-xs text-mist">
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
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-arc/10">
          <Key className="size-[18px] text-arc" strokeWidth={1.75} />
        </span>
        <h2 className="font-display text-xl font-semibold text-foreground">
          {sa.licensingManagement}
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left panel: tenant selector + actions */}
          <div className="rounded-2xl border border-line bg-card p-5">
            <label className="text-xs font-semibold uppercase text-mist">
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
              className="mt-2 h-9 w-full rounded-lg border border-line bg-card px-3 text-sm text-foreground transition-all duration-200 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none dark:bg-ink"
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
              <div className="mt-4 space-y-2 rounded-lg border border-line bg-steel/40 p-3">
                <DetailRow label={sa.tier} value={selectedTenant.subscription_tier} />
                <DetailRow label={sa.status} value={selectedTenant.status} />
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleGenerate}
                disabled={!selectedTenantId || loading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/85 active:translate-y-px disabled:opacity-50"
              >
                {loading ? (
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Key className="size-4" strokeWidth={1.75} />
                )}
                {sa.generateLicense}
              </button>
              <button
                onClick={handleRevoke}
                disabled={!selectedTenantId || loading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-err/40 px-4 text-sm font-medium text-err transition-colors duration-200 hover:bg-err/10 disabled:opacity-50"
              >
                <ShieldOff className="size-4" strokeWidth={1.75} />
                {sa.revokeLicense}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mt-4 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium ${
                  message.ok ? "bg-ok/10 text-ok" : "bg-err/10 text-err"
                }`}
                role="status"
              >
                <span
                  className={`size-2 shrink-0 rounded-full ${message.ok ? "bg-ok" : "bg-err"}`}
                />
                {message.text}
              </div>
            )}
          </div>

          {/* Right panel: license token + claims */}
          <div className="rounded-2xl border border-line bg-card p-5">
            {licenseToken ? (
              <div className="space-y-4">
                {/* Copy button */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-mist">
                    {sa.licenseToken}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3 text-ok" strokeWidth={1.75} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" strokeWidth={1.75} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Token — mono spec block */}
                <div className="max-h-32 overflow-y-auto rounded-lg border border-line bg-ink p-3 font-mono text-xs text-silver break-all">
                  {licenseToken}
                </div>

                {/* Claims */}
                {claims && (
                  <div>
                    <span className="text-xs font-semibold uppercase text-mist">
                      Claims
                    </span>
                    <div className="mt-2 space-y-1 rounded-lg border border-line bg-ink p-3 text-xs">
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
                <Key className="size-10 text-mist" strokeWidth={1.75} />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No license generated
                </p>
                <p className="mt-1 text-xs text-mist">
                  Click "Generate License" to issue a new token for this tenant.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Key className="size-10 text-mist" strokeWidth={1.75} />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {sa.selectTenantForLicense}
                </p>
                <p className="mt-1 text-xs text-mist">
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
      <span className="text-mist">{label}</span>
      <span className="font-medium text-foreground ltr-in-rtl">{value}</span>
    </div>
  )
}

function ClaimRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-mist">{label}</span>
      <span className="max-w-[240px] truncate text-end font-mono font-medium text-silver ltr-in-rtl">
        {value}
      </span>
    </div>
  )
}
