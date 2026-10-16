"use server"

// ============================================================================
// Admin Actions: Payment Policy — read + save
// ============================================================================
// The admin decides: who is responsible for payment, and whether new
// consultations / follow-ups require payment, plus default fees.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import {
  getPaymentPolicy,
  savePaymentPolicy as repoSave,
  type PaymentPolicyRow,
} from "@/lib/db/repositories/payment-policies"
import { PAYER_TYPES, type PayerType } from "@/lib/db/schema/tenant/payment-policies"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type PolicyActionResult =
  | { success: true; data: PaymentPolicyRow }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Read (lazily creates the singleton with defaults)
// ---------------------------------------------------------------------------

export async function getPaymentPolicyData(): Promise<PolicyActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const pool = getTenantPool(ctx.tenantSlug)
    const policy = await getPaymentPolicy(pool, ctx.tenantId)
    return { success: true, data: policy }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch payment policy",
    }
  }
}

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

export interface SavePaymentPolicyInput {
  payer_type: PayerType
  new_consultation_requires_payment: boolean
  followup_requires_payment: boolean
  new_consultation_fee: number
  followup_fee: number
}

export async function savePaymentPolicy(
  input: SavePaymentPolicyInput,
): Promise<PolicyActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    if (!PAYER_TYPES.find((p) => p === input.payer_type)) {
      return { success: false, error: `Payer type must be one of: ${PAYER_TYPES.join(", ")}` }
    }
    if (
      !Number.isFinite(input.new_consultation_fee) ||
      input.new_consultation_fee < 0 ||
      !Number.isFinite(input.followup_fee) ||
      input.followup_fee < 0
    ) {
      return { success: false, error: "Fees must be non-negative numbers" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const policy = await repoSave(pool, ctx.tenantId, {
      payer_type: input.payer_type,
      new_consultation_requires_payment: input.new_consultation_requires_payment,
      followup_requires_payment: input.followup_requires_payment,
      new_consultation_fee: input.new_consultation_fee,
      followup_fee: input.followup_fee,
    }, ctx.userId)
    return { success: true, data: policy }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save payment policy",
    }
  }
}
