"use client"

import { DollarSign, Wallet, TrendingUp, ArrowDown } from "lucide-react"
import { PAYMENT_STATUS_META } from "@/lib/types"
import { useT, resolveLabel } from "@/lib/i18n/use-t"
import type { RevenueTabData } from "@/lib/actions/admin/get-revenue-data"

/** Archai tinted-pill classes per payment status */
const PAYMENT_PILL: Record<string, string> = {
  paid: "bg-ok/10 text-ok",
  unpaid: "bg-warn/10 text-warn",
}

const PAYMENT_DOT: Record<string, string> = {
  paid: "bg-ok",
  unpaid: "bg-warn",
}

type Props = {
  data: RevenueTabData | null
}

export function RevenueTab({ data }: Props) {
  const { t } = useT()

  const rows = data?.rows ?? []
  const totalPaid = data?.summary?.totalPaid ?? 0
  const totalOutstanding = data?.summary?.outstandingBalance ?? 0
  const avgFee = data?.summary?.averageFee ?? 0
  const recordCount = data?.summary?.recordCount ?? 0

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-line bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-arc/10">
              <DollarSign className="size-[18px] text-arc" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-latin text-2xl font-semibold leading-none text-foreground ltr-in-rtl">
                ${totalPaid.toLocaleString()}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{t.admin.totalRevenuePaid}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-warn/10">
              <Wallet className="size-[18px] text-warn" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-latin text-2xl font-semibold leading-none text-foreground ltr-in-rtl">
                ${totalOutstanding.toLocaleString()}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{t.admin.outstandingBalance}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ok/10">
              <TrendingUp className="size-[18px] text-ok" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-latin text-2xl font-semibold leading-none text-foreground ltr-in-rtl">
                ${avgFee.toFixed(2)}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{t.admin.avgConsultFee}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-arc/10">
              <ArrowDown className="size-[18px] text-arc" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-latin text-2xl font-semibold leading-none text-foreground ltr-in-rtl">
                {recordCount}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{t.admin.totalBillingRecords}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing table */}
      <div className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-foreground">{t.admin.billingRecords}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-start">
            <thead>
              <tr className="border-b border-line">
                {t.admin.billingCols.map(
                  (h: string) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase text-mist"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r) => {
                  const statusMeta = PAYMENT_STATUS_META[r.paymentStatus as keyof typeof PAYMENT_STATUS_META]
                  return (
                    <tr
                      key={r.billingId}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-mist ltr-in-rtl">
                          {r.queueNumber}
                        </span>
                        <span className="ms-2 text-xs text-muted-foreground">
                          {r.appointmentType === "new" ? t.admin.typeNew : t.admin.typeFU}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[15px] font-medium text-foreground">
                        {r.patientName}
                      </td>
                      <td className="px-4 py-3 text-[15px] text-muted-foreground">
                        {r.doctorName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">
                        ${Number.parseFloat(r.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            PAYMENT_PILL[r.paymentStatus] ?? "bg-steel text-silver"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${PAYMENT_DOT[r.paymentStatus] ?? "bg-silver"}`}
                          />
                          {resolveLabel(statusMeta.labelKey, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[15px] text-muted-foreground">
                        {r.paymentMethod === "card"
                          ? t.doctor.card
                          : r.paymentMethod === "cash"
                            ? t.doctor.cash
                            : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-mist ltr-in-rtl">
                        {r.createdAt.slice(0, 10)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No billing records found for the selected date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
