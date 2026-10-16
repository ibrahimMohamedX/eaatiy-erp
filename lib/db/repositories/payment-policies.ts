// ============================================================================
// Repository: Payment Policies — singleton per tenant
// ============================================================================
// The admin's payment rules: who pays, and whether new consultations /
// follow-ups require payment (+ default fees). Upsert pattern — one row
// per tenant, created lazily on first read/write.
// ============================================================================

import type { DbPool } from "../db-client"
import type { PayerType } from "@/lib/db/schema/tenant/payment-policies"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaymentPolicyRow {
  id: string
  tenant_id: string
  payer_type: string
  new_consultation_requires_payment: boolean
  followup_requires_payment: boolean
  new_consultation_fee: number
  followup_fee: number
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface PaymentPolicyInput {
  payer_type: PayerType
  new_consultation_requires_payment: boolean
  followup_requires_payment: boolean
  new_consultation_fee: number
  followup_fee: number
}

interface RawPolicyRow {
  id: string
  tenant_id: string
  payer_type: string
  new_consultation_requires_payment: boolean
  followup_requires_payment: boolean
  new_consultation_fee: string
  followup_fee: string
  updated_by: string | null
  created_at: Date
  updated_at: Date
}

const COLS = `id, tenant_id, payer_type, new_consultation_requires_payment,
              followup_requires_payment, new_consultation_fee, followup_fee,
              updated_by, created_at, updated_at`

function normalize(row: RawPolicyRow): PaymentPolicyRow {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    payer_type: row.payer_type,
    new_consultation_requires_payment: row.new_consultation_requires_payment,
    followup_requires_payment: row.followup_requires_payment,
    new_consultation_fee: Number.parseFloat(row.new_consultation_fee) || 0,
    followup_fee: Number.parseFloat(row.followup_fee) || 0,
    updated_by: row.updated_by,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Read (lazily creates the singleton with defaults)
// ---------------------------------------------------------------------------

export async function getPaymentPolicy(
  pool: DbPool,
  tenantId: string,
): Promise<PaymentPolicyRow> {
  const result = await pool.query<RawPolicyRow>(
    `SELECT ${COLS} FROM payment_policies WHERE tenant_id = $1`,
    [tenantId],
  )
  if (result.rows[0]) return normalize(result.rows[0])

  // Lazily insert the singleton, then re-read (handles races via UNIQUE)
  await pool.query(
    `INSERT INTO payment_policies (tenant_id) VALUES ($1)
     ON CONFLICT (tenant_id) DO NOTHING`,
    [tenantId],
  )
  const created = await pool.query<RawPolicyRow>(
    `SELECT ${COLS} FROM payment_policies WHERE tenant_id = $1`,
    [tenantId],
  )
  return normalize(created.rows[0])
}

// ---------------------------------------------------------------------------
// Update (upsert singleton)
// ---------------------------------------------------------------------------

export async function savePaymentPolicy(
  pool: DbPool,
  tenantId: string,
  input: PaymentPolicyInput,
  updatedBy: string,
): Promise<PaymentPolicyRow> {
  const result = await pool.query<RawPolicyRow>(
    `INSERT INTO payment_policies
       (tenant_id, payer_type, new_consultation_requires_payment,
        followup_requires_payment, new_consultation_fee, followup_fee, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (tenant_id) DO UPDATE SET
       payer_type = EXCLUDED.payer_type,
       new_consultation_requires_payment = EXCLUDED.new_consultation_requires_payment,
       followup_requires_payment = EXCLUDED.followup_requires_payment,
       new_consultation_fee = EXCLUDED.new_consultation_fee,
       followup_fee = EXCLUDED.followup_fee,
       updated_by = EXCLUDED.updated_by,
       updated_at = now()
     RETURNING ${COLS}`,
    [
      tenantId,
      input.payer_type,
      input.new_consultation_requires_payment,
      input.followup_requires_payment,
      input.new_consultation_fee.toFixed(2),
      input.followup_fee.toFixed(2),
      updatedBy,
    ],
  )
  return normalize(result.rows[0])
}
