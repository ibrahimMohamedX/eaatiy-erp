"use client"

// ============================================================================
// Super Admin: Tenant Detail modal — per-clinic drill-down
// ============================================================================
// Shows the Identity picture (tenant row, users, license state) plus LIVE
// operational stats pulled from that clinic's own tenant database.
// ============================================================================

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import {
  getTenantDetail,
  type TenantDetailData,
} from "@/lib/actions/super-admin/get-tenant-detail"
import {
  changeSubscriptionTierAction,
} from "@/lib/actions/super-admin/change-subscription-tier"
import { SUBSCRIPTION_TIERS } from "@/lib/db/schema/identity/tenants"

const ROLE_TONE: Record<string, string> = {
  admin: "bg-copper/10 text-copper",
  supervisor: "bg-arc/10 text-arc",
  doctor: "bg-arc/10 text-arc",
  receptionist: "bg-steel text-silver",
}

export function TenantDetailModal({
  tenantId,
  open,
  onClose,
}: {
  tenantId: string | null
  open: boolean
  onClose: () => void
}) {
  const { t } = useT()
  const sa = t["super-admin"]

  const [data, setData] = useState<TenantDetailData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tierBusy, setTierBusy] = useState(false)
  const [tierMsg, setTierMsg] = useState<{ text: string; ok: boolean } | null>(null)

  async function handleTierChange(tier: (typeof SUBSCRIPTION_TIERS)[number]) {
    if (!tenantId) return
    setTierBusy(true)
    setTierMsg(null)
    const res = await changeSubscriptionTierAction(tenantId, tier)
    setTierBusy(false)
    if (res.success) {
      setData((prev) =>
        prev ? { ...prev, tenant: { ...prev.tenant, subscription_tier: tier } } : prev,
      )
      setTierMsg({ text: sa.tierSavedOk, ok: true })
    } else {
      setTierMsg({ text: res.error, ok: false })
    }
  }

  useEffect(() => {
    if (!open || !tenantId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setData(null)
    getTenantDetail(tenantId).then((res) => {
      if (cancelled) return
      setLoading(false)
      if (res.success) {
        setData(res.data)
      } else {
        setError(res.error)
      }
    })
    return () => {
      cancelled = true
    }
  }, [open, tenantId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t.admin.manage.close}
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
      />
      <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-line bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-card px-5 py-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              {sa.detailTitle} — {data?.tenant.name ?? "…"}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-mist ltr-in-rtl">
              {data?.tenant.slug ?? ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.admin.manage.close}
            className="flex size-8 items-center justify-center rounded-lg text-mist transition-colors duration-200 hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {sa.loadingDetail}
            </p>
          )}
          {error && !loading && (
            <div className="rounded-lg bg-err/10 px-4 py-3 text-sm font-medium text-err">
              {error}
            </div>
          )}

          {data && !loading && (
            <div className="flex flex-col gap-6">
              {/* Live stats grid */}
              <div>
                <p className="archai-eyebrow !text-arc">{sa.detailStats}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatTile label={sa.staffCount} value={String(data.stats.staffCount)} />
                  <StatTile label={sa.patientCount} value={String(data.stats.patientCount)} />
                  <StatTile label={sa.appointmentsToday} value={String(data.stats.appointmentsToday)} />
                  <StatTile label={sa.appointmentCount} value={String(data.stats.appointmentCount)} />
                  <StatTile label={sa.completedTotal} value={String(data.stats.completedTotal)} />
                  <StatTile
                    label={sa.revenuePaid}
                    value={data.stats.revenuePaid.toFixed(2)}
                    tone="text-ok"
                  />
                  <StatTile
                    label={sa.revenueOutstanding}
                    value={data.stats.revenueOutstanding.toFixed(2)}
                    tone="text-warn"
                  />
                  <StatTile
                    label={sa.expensesTotal}
                    value={data.stats.expensesTotal.toFixed(2)}
                    tone="text-err"
                  />
                  <StatTile
                    label={sa.payrollPending}
                    value={data.stats.payrollPending.toFixed(2)}
                    tone="text-copper"
                  />
                </div>
              </div>

              {/* Subscription tier control */}
              <div>
                <p className="archai-eyebrow !text-copper">{sa.changeTier}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-steel/30 px-4 py-3 dark:bg-ink/40">
                  {SUBSCRIPTION_TIERS.map((tier) => {
                    const active = data.tenant.subscription_tier === tier
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => void handleTierChange(tier)}
                        disabled={tierBusy || active}
                        className={
                          active
                            ? "rounded-lg bg-copper/15 px-3 py-1.5 text-xs font-semibold text-copper"
                            : "rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground disabled:opacity-50"
                        }
                      >
                        {sa[tier as "trial" | "basic" | "premium"]}
                      </button>
                    )
                  })}
                  {tierBusy && (
                    <span className="font-mono text-[11px] text-mist">…</span>
                  )}
                  {tierMsg && (
                    <span
                      className={`text-xs font-medium ${tierMsg.ok ? "text-ok" : "text-err"}`}
                    >
                      {tierMsg.text}
                    </span>
                  )}
                </div>
              </div>

              {/* License state */}
              <div>
                <p className="archai-eyebrow !text-mist">{sa.detailLicense}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-steel/30 px-4 py-3 dark:bg-ink/40">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      data.license?.active
                        ? "bg-ok/10 text-ok"
                        : "bg-err/10 text-err"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${data.license?.active ? "bg-ok" : "bg-err"}`}
                    />
                    {data.license?.active ? sa.licenseActive : sa.licenseLocked}
                  </span>
                  {data.license && (
                    <span className="font-mono text-xs text-mist ltr-in-rtl">
                      {data.license.installationId}
                    </span>
                  )}
                  {data.license && (
                    <span className="font-mono text-xs text-mist ltr-in-rtl">
                      seq #{data.license.highestIssueSequence}
                    </span>
                  )}
                </div>
              </div>

              {/* Users */}
              <div>
                <p className="archai-eyebrow !text-mist">
                  {sa.detailUsers} · {data.userCount}
                </p>
                <div className="mt-3 overflow-hidden rounded-xl border border-line">
                  <table className="w-full border-collapse text-start">
                    <tbody>
                      {data.users.map((u) => (
                        <tr key={u.id} className="border-b border-line last:border-b-0">
                          <td className="px-4 py-2.5 text-sm font-medium text-foreground">
                            {u.full_name}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-mist ltr-in-rtl">
                            {u.email}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                ROLE_TONE[u.role] ?? "bg-steel text-silver"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-end">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                u.is_active ? "bg-ok/10 text-ok" : "bg-err/10 text-err"
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${u.is_active ? "bg-ok" : "bg-err"}`}
                              />
                              {u.is_active ? sa.active : sa.revoked}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  tone = "text-foreground",
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="rounded-xl border border-line bg-steel/30 p-4 dark:bg-ink/40">
      <p className="font-mono text-[11px] font-medium uppercase text-mist">{label}</p>
      <p className={`mt-1 font-mono text-xl font-semibold ltr-in-rtl ${tone}`}>{value}</p>
    </div>
  )
}
