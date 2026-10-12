// ============================================================================
// Repository: Billings
// ============================================================================
// One billing per appointment. Total amount stored as DECIMAL(10,2).
// ============================================================================

import type { DbPool } from "../db-client"
import type { Billing, PaymentMethod } from "@/lib/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize pg row to strict Billing type — timestamps → ISO, total_amount → number */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBilling(row: any): Billing {
  return {
    ...row,
    total_amount: Number.parseFloat(row.total_amount) || 0,
    paid_at: toISO(row.paid_at) ?? undefined,
    created_at: toISO(row.created_at),
    updated_at: toISO(row.updated_at),
  } as Billing
}

function toISO(val: unknown): string {
  if (val instanceof Date) return val.toISOString()
  if (typeof val === "string") return val
  return String(val ?? "")
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateBillingInput {
  appointment_id: string
  total_amount: number
}

export async function createBilling(
  pool: DbPool,
  tenantId: string,
  input: CreateBillingInput,
): Promise<Billing> {
  const result = await pool.query<Billing>(
    `INSERT INTO billings (tenant_id, appointment_id, total_amount)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [tenantId, input.appointment_id, Number(input.total_amount ?? 0).toFixed(2)],
  )
  return normalizeBilling(result.rows[0])
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getBillingByAppointment(
  pool: DbPool,
  tenantId: string,
  appointmentId: string,
): Promise<Billing | null> {
  const result = await pool.query<Billing>(
    `SELECT * FROM billings
     WHERE appointment_id = $1 AND tenant_id = $2`,
    [appointmentId, tenantId],
  )
  return normalizeBilling(result.rows[0]) ?? null
}

export async function getBillingById(
  pool: DbPool,
  tenantId: string,
  billingId: string,
): Promise<Billing | null> {
  const result = await pool.query<Billing>(
    `SELECT * FROM billings WHERE id = $1 AND tenant_id = $2`,
    [billingId, tenantId],
  )
  return normalizeBilling(result.rows[0]) ?? null
}

export async function getUnpaidBillings(
  pool: DbPool,
  tenantId: string,
): Promise<Billing[]> {
  const result = await pool.query<Billing>(
    `SELECT * FROM billings
     WHERE tenant_id = $1 AND payment_status = 'unpaid'
     ORDER BY created_at DESC`,
    [tenantId],
  )
  return result.rows.map(normalizeBilling)
}

export async function countUnpaidBillings(
  pool: DbPool,
  tenantId: string,
): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM billings
     WHERE tenant_id = $1 AND payment_status = 'unpaid'`,
    [tenantId],
  )
  return Number.parseInt(result.rows[0].count, 10)
}

// ---------------------------------------------------------------------------
// Update (mark as paid)
// ---------------------------------------------------------------------------

export async function markBillingPaid(
  pool: DbPool,
  tenantId: string,
  billingId: string,
  method: PaymentMethod,
): Promise<Billing | null> {
  const now = new Date().toISOString()
  const result = await pool.query<Billing>(
    `UPDATE billings
     SET payment_status = 'paid',
         payment_method = $3,
         paid_at = $4,
         updated_at = $5
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [billingId, tenantId, method, now, now],
  )
  return normalizeBilling(result.rows[0]) ?? null
}