"use client"

import { useState, useTransition } from "react"
import { DollarSign, CreditCard, Banknote, CheckCircle2, Clock } from "lucide-react"
import { PAYMENT_STATUS_META } from "@/lib/types"
import { markBillingPaid } from "@/lib/actions/doctor/mark-billing-paid"
import type { Appointment, Billing } from "@/lib/types"
import { useT, resolveLabel } from "@/lib/i18n/use-t"

type Props = {
  billing?: Billing
  appointment: Appointment
  /** Called after a successful mutation so the workspace can refresh data */
  onMutated: () => void
}

export function BillingTab({ billing, appointment, onMutated }: Props) {
  const { t } = useT()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!billing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <DollarSign className="size-10 text-mist" strokeWidth={1.75} />
        <p className="mt-4 text-sm font-medium text-foreground">{t.doctor.noBillingRecord}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t.doctor.noBillingDesc}</p>
      </div>
    )
  }

  const statusMeta = PAYMENT_STATUS_META[billing.payment_status]
  const isPaid = billing.payment_status === "paid"

  function handleMarkPaid(method: "cash" | "card") {
    setError(null)
    startTransition(async () => {
      const result = await markBillingPaid(billing!.id, method)
      if (result.success) {
        onMutated()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="p-5">
      <h3 className="font-display text-base font-semibold text-foreground">{t.doctor.consultationFee}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {t.doctor.billingDescription
          .replace("{queue}", String(appointment.queue_number))
          .replace("{type}", appointment.type === "new" ? t.doctor.newPatientLabel : t.doctor.followUpLabel)}
      </p>

      {/* Amount card */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-line bg-card p-5">
        <div className="flex items-center gap-4">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
              isPaid ? "bg-ok/10" : "bg-warn/10"
            }`}
          >
            <DollarSign
              className={`size-6 ${isPaid ? "text-ok" : "text-warn"}`}
              strokeWidth={1.75}
            />
          </div>
          <div>
            <p className="font-latin text-3xl font-semibold text-foreground ltr-in-rtl">
              ${billing.total_amount.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.doctor.standardFee}
            </p>
          </div>
        </div>

        {/* Payment status pill */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
            isPaid ? "bg-ok/10 text-ok" : "bg-warn/10 text-warn"
          }`}
        >
          {isPaid ? (
            <CheckCircle2 className="size-4" strokeWidth={1.75} />
          ) : (
            <Clock className="size-4" strokeWidth={1.75} />
          )}
          {resolveLabel(statusMeta.labelKey, t)}
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-err/10 px-4 py-3 text-sm font-medium text-err">
          <span className="size-2 shrink-0 rounded-full bg-err" />
          {error}
        </div>
      )}

      {/* Detail rows */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-line bg-steel/40 px-4 py-3 dark:bg-ink/40">
          <span className="text-sm text-muted-foreground">{t.doctor.paymentMethod}</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            {billing.payment_method === "card" ? (
              <CreditCard className="size-4 text-mist" strokeWidth={1.75} />
            ) : billing.payment_method === "cash" ? (
              <Banknote className="size-4 text-mist" strokeWidth={1.75} />
            ) : (
              <span className="text-mist">—</span>
            )}
            {billing.payment_method
              ? billing.payment_method === "card"
                ? t.doctor.card
                : t.doctor.cash
              : t.doctor.notYetPaid}
          </span>
        </div>

        {billing.paid_at && (
          <div className="flex items-center justify-between rounded-lg border border-line bg-steel/40 px-4 py-3 dark:bg-ink/40">
            <span className="text-sm text-muted-foreground">{t.doctor.paidAt}</span>
            <span className="font-mono text-sm font-medium text-foreground ltr-in-rtl">
              {billing.paid_at.slice(0, 10)} · {billing.paid_at.slice(11, 16)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-line bg-steel/40 px-4 py-3 dark:bg-ink/40">
          <span className="text-sm text-muted-foreground">{t.doctor.billingId}</span>
          <span className="font-mono text-xs text-muted-foreground ltr-in-rtl">{billing.id}</span>
        </div>
      </div>

      {/* Payment action */}
      {!isPaid && (
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleMarkPaid("cash")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-semibold text-[#12181D] transition-all duration-200 hover:bg-copper/85 active:translate-y-px disabled:opacity-50"
          >
            <Banknote className="size-4" strokeWidth={1.75} />
            {t.doctor.markPaidCash}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleMarkPaid("card")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-semibold text-[#12181D] transition-all duration-200 hover:bg-copper/85 active:translate-y-px disabled:opacity-50"
          >
            <CreditCard className="size-4" strokeWidth={1.75} />
            {t.doctor.markPaidCard}
          </button>
        </div>
      )}
    </div>
  )
}
