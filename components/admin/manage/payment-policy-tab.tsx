"use client"

// ============================================================================
// Admin Panel: Payment Policy — who pays, and which visits require payment
// ============================================================================

import { useCallback, useEffect, useState } from "react"
import { BadgeDollarSign } from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import {
  getPaymentPolicyData,
  savePaymentPolicy,
} from "@/lib/actions/admin/manage-payment-policy"
import type { PaymentPolicyRow } from "@/lib/db/repositories/payment-policies"
import {
  PanelHeader,
  FieldLabel,
  TextInput,
  SelectInput,
  ArcButton,
  FeedbackLine,
} from "./ui"

type Feedback = { message: string; tone: "ok" | "err" } | null

const PAYER_KEYS = ["patient", "companion", "organization"] as const

export function PaymentPolicyTab() {
  const { t } = useT()
  const m = t.admin.manage

  const [policy, setPolicy] = useState<PaymentPolicyRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const [form, setForm] = useState({
    payer_type: "patient",
    new_consultation_requires_payment: true,
    followup_requires_payment: false,
    new_consultation_fee: "0",
    followup_fee: "0",
  })

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getPaymentPolicyData()
    setLoading(false)
    if (res.success) {
      setPolicy(res.data)
      setForm({
        payer_type: res.data.payer_type,
        new_consultation_requires_payment: res.data.new_consultation_requires_payment,
        followup_requires_payment: res.data.followup_requires_payment,
        new_consultation_fee: String(res.data.new_consultation_fee),
        followup_fee: String(res.data.followup_fee),
      })
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleSave() {
    setSaving(true)
    const res = await savePaymentPolicy({
      payer_type: form.payer_type as (typeof PAYER_KEYS)[number],
      new_consultation_requires_payment: form.new_consultation_requires_payment,
      followup_requires_payment: form.followup_requires_payment,
      new_consultation_fee: Number.parseFloat(form.new_consultation_fee) || 0,
      followup_fee: Number.parseFloat(form.followup_fee) || 0,
    })
    setSaving(false)
    if (res.success) {
      setPolicy(res.data)
      setFeedback({ message: m.savedOk, tone: "ok" })
    } else {
      setFeedback({ message: res.error, tone: "err" })
    }
  }

  return (
    <div className="flex flex-col p-6">
      <section className="rounded-2xl border border-line bg-card">
        <PanelHeader
          title={m.policyTitle}
          subtitle={m.policySubtitle}
          action={
            <ArcButton onClick={() => void handleSave()} disabled={loading || saving}>
              <BadgeDollarSign className="size-4" strokeWidth={1.75} />
              {m.savePolicy}
            </ArcButton>
          }
        />
        {feedback && (
          <div className="pt-3">
            <FeedbackLine message={feedback.message} tone={feedback.tone} />
          </div>
        )}

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">{m.loading}</div>
        ) : (
          <div className="grid gap-6 p-5 lg:grid-cols-2">
            {/* WHO pays */}
            <div className="rounded-xl border border-line bg-steel/30 p-5 dark:bg-ink/40">
              <p className="archai-eyebrow !text-arc">{m.policyPayer}</p>
              <div className="mt-4 flex flex-col gap-3">
                {PAYER_KEYS.map((k) => (
                  <label
                    key={k}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors duration-200 ${
                      form.payer_type === k
                        ? "border-arc bg-arc/10 text-foreground"
                        : "border-line text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payer_type"
                      checked={form.payer_type === k}
                      onChange={() => setForm({ ...form, payer_type: k })}
                      className="accent-[#2ED2FF]"
                    />
                    {m.payerTypes[k]}
                  </label>
                ))}
              </div>
            </div>

            {/* WHEN payment is required + fees */}
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3.5">
                <span className="text-sm text-foreground">{m.policyNewRequired}</span>
                <input
                  type="checkbox"
                  checked={form.new_consultation_requires_payment}
                  onChange={(e) =>
                    setForm({ ...form, new_consultation_requires_payment: e.target.checked })
                  }
                  className="size-5 rounded border-line accent-[#2ED2FF]"
                />
              </label>
              <div>
                <FieldLabel>{m.policyNewFee}</FieldLabel>
                <TextInput
                  value={form.new_consultation_fee}
                  onChange={(e) => setForm({ ...form, new_consultation_fee: e.target.value })}
                  inputMode="decimal"
                  disabled={!form.new_consultation_requires_payment}
                />
              </div>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3.5">
                <span className="text-sm text-foreground">{m.policyFollowupRequired}</span>
                <input
                  type="checkbox"
                  checked={form.followup_requires_payment}
                  onChange={(e) =>
                    setForm({ ...form, followup_requires_payment: e.target.checked })
                  }
                  className="size-5 rounded border-line accent-[#2ED2FF]"
                />
              </label>
              <div>
                <FieldLabel>{m.policyFollowupFee}</FieldLabel>
                <TextInput
                  value={form.followup_fee}
                  onChange={(e) => setForm({ ...form, followup_fee: e.target.value })}
                  inputMode="decimal"
                  disabled={!form.followup_requires_payment}
                />
              </div>
              {policy && (
                <p className="mt-1 font-mono text-[11px] text-mist ltr-in-rtl">
                  {policy.updated_at.slice(0, 16).replace("T", " ")}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
