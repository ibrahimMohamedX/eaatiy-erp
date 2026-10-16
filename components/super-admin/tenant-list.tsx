"use client"

import { useState } from "react"
import { useT } from "@/lib/i18n/use-t"
import { updateTenantStatusAction } from "@/lib/actions/super-admin/update-tenant-status"
import type { IdentityTenant, TenantStatus } from "@/lib/db/repositories/identity/tenants"
import { TenantDetailModal } from "./tenant-detail-modal"
import { SystemStateCard } from "./system-state-card"
import {
  Building2,
  AlertTriangle,
  CheckCircle,
  PauseCircle,
  XCircle,
  Eye,
} from "lucide-react"

interface TenantListProps {
  tenants: IdentityTenant[]
  onMutated: () => void
}

// Archai semantic tones — active=ok · suspended=warn · provisioning=arc · revoked=err
const STATUS_COLORS: Record<TenantStatus, string> = {
  active: "bg-ok/10 text-ok",
  suspended: "bg-warn/10 text-warn",
  provisioning: "bg-arc/10 text-arc",
  revoked: "bg-err/10 text-err",
}

const STATUS_DOTS: Record<TenantStatus, string> = {
  active: "bg-ok",
  suspended: "bg-warn",
  provisioning: "bg-arc",
  revoked: "bg-err",
}

const TIER_COLORS: Record<string, string> = {
  trial: "bg-steel text-silver",
  basic: "bg-arc/10 text-arc",
  premium: "bg-copper/10 text-copper",
}

const STATUS_ANIMATION: Record<TenantStatus, string> = {
  provisioning: "animate-pulse",
  active: "",
  suspended: "",
  revoked: "",
}

export function TenantList({ tenants, onMutated }: TenantListProps) {
  const { t } = useT()
  const sa = t["super-admin"]
  const [loadingTenant, setLoadingTenant] = useState<string | null>(null)
  const [detailTenantId, setDetailTenantId] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<{
    tenantId: string
    action: "activate" | "suspend" | "revoke"
    name: string
  } | null>(null)

  async function handleStatusChange(
    tenantId: string,
    transition: "activate" | "suspend" | "revoke",
  ) {
    setLoadingTenant(tenantId)
    setConfirmState(null)
    try {
      await updateTenantStatusAction(tenantId, transition)
      onMutated()
    } catch {
      // Error is surfaced via the console but can be enhanced with toast later
    } finally {
      setLoadingTenant(null)
    }
  }

  function renderStatusPill(status: TenantStatus) {
    const key = status as keyof typeof sa.statusValues
    const label = sa.statusValues[key] ?? status
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${STATUS_COLORS[status]} ${STATUS_ANIMATION[status] ?? ""}`}
      >
        <span className={`size-2 rounded-full ${STATUS_DOTS[status]}`} />
        {label}
      </span>
    )
  }

  function renderTierBadge(tier: string) {
    const key = tier as keyof typeof sa.tierValues
    const label = sa.tierValues[key] ?? tier
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TIER_COLORS[tier] ?? "bg-steel text-silver"}`}
      >
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Platform-wide system state — operational / maintenance / locked */}
      <SystemStateCard onMutated={onMutated} />

      {/* Section header */}
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-arc/10">
          <Building2 className="size-[18px] text-arc" strokeWidth={1.75} />
        </span>
        <h2 className="font-display text-xl font-semibold text-foreground">
          {sa.tenantListTitle}
        </h2>
        <span className="rounded-full border border-line px-2 py-0.5 font-mono text-xs text-mist ltr-in-rtl">
          {tenants.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="size-10 text-mist" strokeWidth={1.75} />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {t.common.noResults}
            </p>
            <p className="mt-1 text-xs text-mist">
              Provision your first tenant to get started.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-steel/40">
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  {sa.clinicName}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  {sa.slug}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  {sa.city}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  {sa.tier}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  {sa.status}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-mist">
                  {sa.created}
                </th>
                <th className="px-4 py-3 text-end text-xs font-semibold uppercase text-mist">
                  {sa.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="border-b border-line transition-colors duration-200 last:border-b-0 hover:bg-accent"
                >
                  <td className="px-4 py-3 text-[15px] font-medium text-foreground">
                    {tenant.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">
                    {tenant.slug}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-muted-foreground">
                    {tenant.city}
                  </td>
                  <td className="px-4 py-3">{renderTierBadge(tenant.subscription_tier)}</td>
                  <td className="px-4 py-3">{renderStatusPill(tenant.status as TenantStatus)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground ltr-in-rtl">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetailTenantId(tenant.id)}
                        disabled={loadingTenant === tenant.id}
                        className="inline-flex size-7 items-center justify-center rounded-lg text-arc transition-colors duration-200 hover:bg-arc/10 disabled:opacity-50"
                        title={sa.viewDetails}
                      >
                        <Eye className="size-3.5" strokeWidth={1.75} />
                      </button>
                      {tenant.status === "suspended" || tenant.status === "provisioning" ? (
                        <button
                          onClick={() =>
                            setConfirmState({
                              tenantId: tenant.id,
                              action: "activate",
                              name: tenant.name,
                            })
                          }
                          disabled={loadingTenant === tenant.id}
                          className="inline-flex size-7 items-center justify-center rounded-lg text-ok transition-colors duration-200 hover:bg-ok/10 disabled:opacity-50"
                          title={sa.activate}
                        >
                          <CheckCircle className="size-3.5" strokeWidth={1.75} />
                        </button>
                      ) : null}
                      {tenant.status === "active" ? (
                        <button
                          onClick={() =>
                            setConfirmState({
                              tenantId: tenant.id,
                              action: "suspend",
                              name: tenant.name,
                            })
                          }
                          disabled={loadingTenant === tenant.id}
                          className="inline-flex size-7 items-center justify-center rounded-lg text-warn transition-colors duration-200 hover:bg-warn/10 disabled:opacity-50"
                          title={sa.suspend}
                        >
                          <PauseCircle className="size-3.5" strokeWidth={1.75} />
                        </button>
                      ) : null}
                      {tenant.status !== "revoked" ? (
                        <button
                          onClick={() =>
                            setConfirmState({
                              tenantId: tenant.id,
                              action: "revoke",
                              name: tenant.name,
                            })
                          }
                          disabled={loadingTenant === tenant.id}
                          className="inline-flex size-7 items-center justify-center rounded-lg text-err transition-colors duration-200 hover:bg-err/10 disabled:opacity-50"
                          title={sa.revoke}
                        >
                          <XCircle className="size-3.5" strokeWidth={1.75} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Clinic detail drill-down */}
      <TenantDetailModal
        tenantId={detailTenantId}
        open={detailTenantId !== null}
        onClose={() => setDetailTenantId(null)}
      />

      {/* Confirmation dialog */}
      {confirmState && (
        <ConfirmationDialog
          tenantName={confirmState.name}
          action={confirmState.action}
          onConfirm={() => handleStatusChange(confirmState.tenantId, confirmState.action)}
          onCancel={() => setConfirmState(null)}
          t={sa}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Confirmation Dialog (inline — keeps simple flow without a separate file)
// ---------------------------------------------------------------------------

function ConfirmationDialog({
  tenantName,
  action,
  onConfirm,
  onCancel,
  t,
}: {
  tenantName: string
  action: "activate" | "suspend" | "revoke"
  onConfirm: () => void
  onCancel: () => void
  t: { confirmActivate?: string; confirmSuspend?: string; confirmRevoke?: string }
}) {
  const messages: Record<typeof action, { title: string; desc: string }> = {
    activate: { title: t.confirmActivate ?? "Activate this tenant?", desc: "" },
    suspend: {
      title: t.confirmSuspend ?? "Suspend this tenant?",
      desc: t.confirmSuspend ?? "All users will lose access.",
    },
    revoke: {
      title: t.confirmRevoke ?? "Revoke this tenant?",
      desc: t.confirmRevoke ?? "This is irreversible.",
    },
  }

  // Archai tone per action — activate=ok · suspend=warn · revoke=err
  const confirmTones: Record<typeof action, string> = {
    activate: "border-ok/40 text-ok hover:bg-ok/10",
    suspend: "border-warn/40 text-warn hover:bg-warn/10",
    revoke: "border-err/40 text-err hover:bg-err/10",
  }

  const msg = messages[action]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-archai-fade-up rounded-2xl border border-line bg-card p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={`mt-0.5 size-5 shrink-0 ${action === "revoke" ? "text-err" : "text-warn"}`}
            strokeWidth={1.75}
          />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              {msg.title}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tenantName}
              {msg.desc ? `. ${msg.desc}` : ""}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="inline-flex h-9 items-center rounded-lg border border-line px-4 text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`inline-flex h-9 items-center rounded-lg border px-4 text-sm font-semibold transition-colors duration-200 ${confirmTones[action]}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
