"use client"

import { DollarSign, Wallet, TrendingUp, ArrowDown } from "lucide-react"
import { PAYMENT_STATUS_META } from "@/lib/types"
import { statusBg } from "@/lib/color-utils"
import { useT, resolveLabel } from "@/lib/i18n/use-t"
import type { RevenueTabData } from "@/lib/actions/admin/get-revenue-data"

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
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 dark:border-[#374151] dark:bg-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(15,118,110,0.12)]">
              <DollarSign className="h-[18px] w-[18px] text-[#0F766E]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB]">
                ${totalPaid.toLocaleString()}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.totalRevenuePaid}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 dark:border-[#374151] dark:bg-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(217,119,6,0.12)]">
              <Wallet className="h-[18px] w-[18px] text-[#D97706]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB]">
                ${totalOutstanding.toLocaleString()}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.outstandingBalance}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 dark:border-[#374151] dark:bg-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(5,150,105,0.12)]">
              <TrendingUp className="h-[18px] w-[18px] text-[#059669]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB]">
                ${avgFee.toFixed(2)}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.avgConsultFee}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 dark:border-[#374151] dark:bg-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(37,99,235,0.12)]">
              <ArrowDown className="h-[18px] w-[18px] text-[#2563EB]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB]">
                {recordCount}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.totalBillingRecords}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing table */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
        <div className="border-b border-[#E5E7EB] px-5 py-4 dark:border-[#374151]">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.admin.billingRecords}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-[#374151]">
                {t.admin.billingCols.map(
                  (h: string) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] dark:text-[#9CA3AF]"
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
                      className="border-b border-[#E5E7EB] last:border-b-0 dark:border-[#374151]"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                          {r.queueNumber}
                        </span>
                        <span className="ml-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                          {r.appointmentType === "new" ? t.admin.typeNew : t.admin.typeFU}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB]">
                        {r.patientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {r.doctorName}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                        ${Number.parseFloat(r.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: statusBg(statusMeta.color),
                            color: statusMeta.color,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: statusMeta.color }}
                          />
                          {resolveLabel(statusMeta.labelKey, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {r.paymentMethod === "card"
                          ? t.doctor.card
                          : r.paymentMethod === "cash"
                            ? t.doctor.cash
                            : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {r.createdAt.slice(0, 10)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]">
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