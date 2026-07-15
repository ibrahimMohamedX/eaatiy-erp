"use client"

import { DollarSign, Wallet, TrendingUp, ArrowDown } from "lucide-react"
import { getAdminKpis, billings, getPatient, getUser, appointments } from "@/lib/mock-data"
import { PAYMENT_STATUS_META } from "@/lib/types"
import { statusBg } from "@/lib/color-utils"
import { useT, resolveLabel } from "@/lib/i18n/use-t"

export function RevenueTab() {
  const { t } = useT()
  const kpis = getAdminKpis()

  const billingRows = billings.map((b) => {
    const apt = appointments.find((a) => a.id === b.appointment_id)
    const patient = apt ? getPatient(apt.patient_id) : undefined
    const doctor = apt ? getUser(apt.doctor_id) : undefined
    return { billing: b, patient, doctor, apt }
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(15,118,110,0.12)]">
              <DollarSign className="h-[18px] w-[18px] text-[#0F766E]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB] dark:text-[#F9FAFB]">
                ${kpis.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.totalRevenuePaid}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(217,119,6,0.12)]">
              <Wallet className="h-[18px] w-[18px] text-[#D97706]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB] dark:text-[#F9FAFB]">
                ${kpis.outstandingBalance.toLocaleString()}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.outstandingBalance}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(5,150,105,0.12)]">
              <TrendingUp className="h-[18px] w-[18px] text-[#059669]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB] dark:text-[#F9FAFB]">${150.00}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.avgConsultFee}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(37,99,235,0.12)]">
              <ArrowDown className="h-[18px] w-[18px] text-[#2563EB]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB] dark:text-[#F9FAFB]">{billings.length}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.admin.totalBillingRecords}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing table */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
        <div className="border-b border-[#E5E7EB] dark:border-[#374151] px-5 py-4">
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
              {billingRows.map(({ billing, patient, doctor, apt }) => {
                const statusMeta = PAYMENT_STATUS_META[billing.payment_status]
                return (
                  <tr
                    key={billing.id}
                    className="border-b border-[#E5E7EB] dark:border-[#374151] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                        {apt?.queue_number ?? "—"}
                      </span>
                      <span className="ml-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        {apt?.type === "new" ? t.admin.typeNew : t.admin.typeFU}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#111827] dark:text-[#F9FAFB]">
                      {patient?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {doctor?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                      ${billing.total_amount.toFixed(2)}
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
                      {billing.payment_method === "card"
                        ? t.doctor.card
                        : billing.payment_method === "cash"
                          ? t.doctor.cash
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {billing.created_at.slice(0, 10)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}