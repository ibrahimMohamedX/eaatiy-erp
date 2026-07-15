"use client"

import { DollarSign, CreditCard, Banknote, CheckCircle2, Clock } from "lucide-react"
import { getBillingForAppointment } from "@/lib/mock-data"
import { PAYMENT_STATUS_META } from "@/lib/types"
import type { Appointment } from "@/lib/types"
import { useT, resolveLabel } from "@/lib/i18n/use-t"

type Props = { appointment: Appointment }

export function BillingTab({ appointment }: Props) {
  const { t } = useT()
  const billing = getBillingForAppointment(appointment.id)

  if (!billing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <DollarSign className="h-10 w-10 text-[#E5E7EB] dark:text-[#374151]" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.noBillingRecord}</p>
        <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.noBillingDesc}</p>
      </div>
    )
  }

  const statusMeta = PAYMENT_STATUS_META[billing.payment_status]
  const isPaid = billing.payment_status === "paid"

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.doctor.consultationFee}</h3>
      <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
        {t.doctor.billingDescription
          .replace("{queue}", String(appointment.queue_number))
          .replace("{type}", appointment.type === "new" ? t.doctor.newPatientLabel : t.doctor.followUpLabel)}
      </p>

      {/* Amount card */}
      <div className="mt-5 flex items-center justify-between rounded-[12px] border border-[#E5E7EB] bg-white p-5 dark:border-[#374151] dark:bg-[#1F2937]">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              backgroundColor: isPaid
                ? "rgba(5,150,105,0.12)"
                : "rgba(217,119,6,0.12)",
            }}
          >
            <DollarSign
              className="h-6 w-6"
              strokeWidth={1.5}
              style={{ color: statusMeta.color }}
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB]">
              ${billing.total_amount.toFixed(2)}
            </p>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {t.doctor.standardFee}
            </p>
          </div>
        </div>

        {/* Payment status pill */}
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: isPaid
              ? "rgba(5,150,105,0.12)"
              : "rgba(217,119,6,0.12)",
            color: statusMeta.color,
          }}
        >
          {isPaid ? (
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Clock className="h-4 w-4" strokeWidth={1.5} />
          )}
          {resolveLabel(statusMeta.labelKey, t)}
        </span>
      </div>

      {/* Detail rows */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 dark:border-[#374151] dark:bg-[#374151]">
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.paymentMethod}</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
            {billing.payment_method === "card" ? (
              <CreditCard className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
            ) : billing.payment_method === "cash" ? (
              <Banknote className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
            ) : (
              <span className="text-[#6B7280] dark:text-[#9CA3AF]">—</span>
            )}
            {billing.payment_method
              ? billing.payment_method === "card"
                ? t.doctor.card
                : t.doctor.cash
              : t.doctor.notYetPaid}
          </span>
        </div>

        {billing.paid_at && (
          <div className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 dark:border-[#374151] dark:bg-[#374151]">
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.paidAt}</span>
            <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
              {billing.paid_at.slice(0, 10)} · {billing.paid_at.slice(11, 16)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 dark:border-[#374151] dark:bg-[#374151]">
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{t.doctor.billingId}</span>
          <span className="font-mono text-xs text-[#6B7280] dark:text-[#9CA3AF]">{billing.id}</span>
        </div>
      </div>

      {/* Payment action */}
      {!isPaid && (
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
          >
            <Banknote className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
            {t.doctor.markPaidCash}
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB] dark:border-[#374151] dark:bg-[#1F2937] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
          >
            <CreditCard className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" strokeWidth={1.5} />
            {t.doctor.markPaidCard}
          </button>
        </div>
      )}
    </div>
  )
}