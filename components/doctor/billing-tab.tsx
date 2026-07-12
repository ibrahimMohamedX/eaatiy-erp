import { DollarSign, CreditCard, Banknote, CheckCircle2, Clock } from "lucide-react"
import { getBillingForAppointment } from "@/lib/mock-data"
import { PAYMENT_STATUS_META } from "@/lib/types"
import type { Appointment } from "@/lib/types"

type Props = { appointment: Appointment }

export function BillingTab({ appointment }: Props) {
  const billing = getBillingForAppointment(appointment.id)

  if (!billing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <DollarSign className="h-10 w-10 text-[#E5E7EB]" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-medium text-[#6B7280]">No billing record</p>
        <p className="mt-1 text-xs text-[#6B7280]">
          A billing record will be created when the consultation is completed.
        </p>
      </div>
    )
  }

  const statusMeta = PAYMENT_STATUS_META[billing.payment_status]
  const isPaid = billing.payment_status === "paid"

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-[#111827]">Consultation Fee</h3>
      <p className="mt-1 text-xs text-[#6B7280]">
        Billing record for appointment #{appointment.queue_number} ·{" "}
        {appointment.type === "new" ? "New Patient" : "Follow-up"}
      </p>

      {/* Amount card */}
      <div className="mt-5 flex items-center justify-between rounded-[12px] border border-[#E5E7EB] bg-white p-5">
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
            <p className="text-2xl font-bold text-[#111827]">
              ${billing.total_amount.toFixed(2)}
            </p>
            <p className="text-xs text-[#6B7280]">
              Standard consultation fee
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
          {statusMeta.label}
        </span>
      </div>

      {/* Detail rows */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
          <span className="text-sm text-[#6B7280]">Payment Method</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#111827]">
            {billing.payment_method === "card" ? (
              <CreditCard className="h-4 w-4 text-[#6B7280]" strokeWidth={1.5} />
            ) : billing.payment_method === "cash" ? (
              <Banknote className="h-4 w-4 text-[#6B7280]" strokeWidth={1.5} />
            ) : (
              <span className="text-[#6B7280]">—</span>
            )}
            {billing.payment_method
              ? billing.payment_method === "card"
                ? "Card"
                : "Cash"
              : "Not yet paid"}
          </span>
        </div>

        {billing.paid_at && (
          <div className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
            <span className="text-sm text-[#6B7280]">Paid At</span>
            <span className="text-sm font-medium text-[#111827]">
              {billing.paid_at.slice(0, 10)} · {billing.paid_at.slice(11, 16)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
          <span className="text-sm text-[#6B7280]">Billing ID</span>
          <span className="font-mono text-xs text-[#6B7280]">{billing.id}</span>
        </div>
      </div>

      {/* Payment action */}
      {!isPaid && (
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB]"
          >
            <Banknote className="h-4 w-4 text-[#6B7280]" strokeWidth={1.5} />
            Mark Paid (Cash)
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB]"
          >
            <CreditCard className="h-4 w-4 text-[#6B7280]" strokeWidth={1.5} />
            Mark Paid (Card)
          </button>
        </div>
      )}
    </div>
  )
}