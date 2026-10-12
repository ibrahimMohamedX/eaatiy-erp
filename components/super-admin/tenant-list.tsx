"use client"

import { useState } from "react"
import { useT } from "@/lib/i18n/use-t"
import { updateTenantStatusAction } from "@/lib/actions/super-admin/update-tenant-status"
import type { IdentityTenant, TenantStatus } from "@/lib/db/repositories/identity/tenants"
import {
  Building2,
  AlertTriangle,
  CheckCircle,
  PauseCircle,
  XCircle,
} from "lucide-react"

interface TenantListProps {
  tenants: IdentityTenant[]
  onMutated: () => void
}

const STATUS_COLORS: Record<TenantStatus, string> = {
  active: "#059669",
  suspended: "#D97706",
  provisioning: "#6366F1",
  revoked: "#DC2626",
}

const TIER_COLORS: Record<string, string> = {
  trial: "#6B7280",
  basic: "#2563EB",
  premium: "#7C3AED",
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
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_ANIMATION[status] ?? ""}`}
        style={{ color: STATUS_COLORS[status], backgroundColor: `${STATUS_COLORS[status]}15` }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
        {label}
      </span>
    )
  }

  function renderTierBadge(tier: string) {
    const key = tier as keyof typeof sa.tierValues
    const label = sa.tierValues[key] ?? tier
    return (
      <span
        className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-xs font-medium"
        style={{ color: TIER_COLORS[tier] ?? "#6B7280", backgroundColor: `${TIER_COLORS[tier] ?? "#6B7280"}15` }}
      >
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">
          {sa.tenantListTitle}
        </h2>
        <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#6B7280] dark:bg-[#374151] dark:text-[#9CA3AF]">
          {tenants.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
        {tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-10 w-10 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
              {t.common.noResults}
            </p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Provision your first tenant to get started.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] dark:border-[#374151] dark:bg-[#111827]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  {sa.clinicName}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  {sa.slug}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  {sa.city}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  {sa.tier}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  {sa.status}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  {sa.created}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
                  {sa.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="border-b border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB] dark:border-[#374151] dark:hover:bg-[#111827]"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                    {tenant.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    {tenant.slug}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    {tenant.city}
                  </td>
                  <td className="px-4 py-3">{renderTierBadge(tenant.subscription_tier)}</td>
                  <td className="px-4 py-3">{renderStatusPill(tenant.status as TenantStatus)}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
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
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[#059669] transition-colors hover:bg-[#05966915] disabled:opacity-50"
                          title={sa.activate}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
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
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[#D97706] transition-colors hover:bg-[#D97706]/10 disabled:opacity-50"
                          title={sa.suspend}
                        >
                          <PauseCircle className="h-3.5 w-3.5" />
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
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[#DC2626] transition-colors hover:bg-[#DC2626]/10 disabled:opacity-50"
                          title={sa.revoke}
                        >
                          <XCircle className="h-3.5 w-3.5" />
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

  const msg = messages[action]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-lg dark:border-[#374151] dark:bg-[#1F2937]">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{
              color: action === "revoke" ? "#DC2626" : "#D97706",
            }}
            strokeWidth={1.5}
          />
          <div>
            <p className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
              {msg.title}
            </p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {tenantName}
              {msg.desc ? `. ${msg.desc}` : ""}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="inline-flex h-8 items-center rounded-[6px] border border-[#E5E7EB] px-4 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6] dark:border-[#374151] dark:text-[#9CA3AF] dark:hover:bg-[#374151]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex h-8 items-center rounded-[6px] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor:
                action === "revoke"
                  ? "#DC2626"
                  : action === "suspend"
                    ? "#D97706"
                    : "#059669",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

