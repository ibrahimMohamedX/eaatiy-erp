// ============================================================================
// Repository: Salaries — Admin full CRUD + lifecycle
// ============================================================================
// Monthly payroll per staff member. Lifecycle: draft → approved → paid.
// Every query is tenant-scoped.
// ============================================================================

import type { DbPool } from "../db-client"
import type { SalaryStatus } from "@/lib/db/schema/tenant/salaries"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SalaryRow {
  id: string
  staff_member_id: string
  staff_name: string
  staff_type: string
  period_month: string // YYYY-MM-01
  base_amount: number
  bonuses: number
  deductions: number
  net_amount: number
  status: string
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SalaryInput {
  staff_member_id: string
  period_month: string // first day of month, e.g. "2026-10-01"
  base_amount: number
  bonuses?: number
  deductions?: number
  notes?: string | null
}

interface RawSalaryRow {
  id: string
  staff_member_id: string
  staff_name: string
  staff_type: string
  period_month: string
  base_amount: string
  bonuses: string
  deductions: string
  status: string
  paid_at: Date | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

const SELECT_WITH_STAFF = `
  SELECT s.id, s.staff_member_id, m.full_name AS staff_name, m.staff_type,
         s.period_month::text AS period_month, s.base_amount, s.bonuses, s.deductions,
         s.status, s.paid_at, s.notes, s.created_at, s.updated_at
  FROM salaries s
  JOIN staff_members m ON m.id = s.staff_member_id
`

function normalize(row: RawSalaryRow): SalaryRow {
  const base = Number.parseFloat(row.base_amount) || 0
  const bonuses = Number.parseFloat(row.bonuses) || 0
  const deductions = Number.parseFloat(row.deductions) || 0
  return {
    id: row.id,
    staff_member_id: row.staff_member_id,
    staff_name: row.staff_name,
    staff_type: row.staff_type,
    period_month: row.period_month,
    base_amount: base,
    bonuses,
    deductions,
    net_amount: base + bonuses - deductions,
    status: row.status,
    paid_at: row.paid_at ? row.paid_at.toISOString() : null,
    notes: row.notes,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createSalary(
  pool: DbPool,
  tenantId: string,
  input: SalaryInput,
): Promise<SalaryRow> {
  const result = await pool.query<RawSalaryRow>(
    `WITH ins AS (
       INSERT INTO salaries (tenant_id, staff_member_id, period_month, base_amount, bonuses, deductions, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, staff_member_id, period_month, base_amount, bonuses, deductions,
                 status, paid_at, notes, created_at, updated_at
     )
     SELECT ins.id, ins.staff_member_id, m.full_name AS staff_name, m.staff_type,
            ins.period_month::text AS period_month, ins.base_amount, ins.bonuses, ins.deductions,
            ins.status, ins.paid_at, ins.notes, ins.created_at, ins.updated_at
     FROM ins JOIN staff_members m ON m.id = ins.staff_member_id`,
    [
      tenantId,
      input.staff_member_id,
      input.period_month,
      input.base_amount.toFixed(2),
      (input.bonuses ?? 0).toFixed(2),
      (input.deductions ?? 0).toFixed(2),
      input.notes ?? null,
    ],
  )
  return normalize(result.rows[0])
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function listSalaries(
  pool: DbPool,
  tenantId: string,
  opts?: { periodMonth?: string; staffMemberId?: string },
): Promise<SalaryRow[]> {
  const params: unknown[] = [tenantId]
  let where = `s.tenant_id = $1`
  if (opts?.periodMonth) {
    params.push(opts.periodMonth)
    where += ` AND s.period_month = $${params.length}`
  }
  if (opts?.staffMemberId) {
    params.push(opts.staffMemberId)
    where += ` AND s.staff_member_id = $${params.length}`
  }
  const result = await pool.query<RawSalaryRow>(
    `${SELECT_WITH_STAFF} WHERE ${where}
     ORDER BY s.period_month DESC, m.full_name`,
    params,
  )
  return result.rows.map(normalize)
}

export async function getSalaryById(
  pool: DbPool,
  tenantId: string,
  id: string,
): Promise<SalaryRow | null> {
  const result = await pool.query<RawSalaryRow>(
    `${SELECT_WITH_STAFF} WHERE s.id = $1 AND s.tenant_id = $2`,
    [id, tenantId],
  )
  return result.rows[0] ? normalize(result.rows[0]) : null
}

export interface SalaryTotals {
  count: number
  totalNet: number
  totalPaid: number
  totalPending: number
}

export async function getSalaryTotals(
  pool: DbPool,
  tenantId: string,
  periodMonth?: string,
): Promise<SalaryTotals> {
  const params: unknown[] = [tenantId]
  let where = `s.tenant_id = $1`
  if (periodMonth) {
    params.push(periodMonth)
    where += ` AND s.period_month = $${params.length}`
  }
  const result = await pool.query<{
    count: string
    total_net: string
    total_paid: string
    total_pending: string
  }>(
    `SELECT COUNT(*)::text AS count,
            COALESCE(SUM(s.base_amount + s.bonuses - s.deductions), 0)::text AS total_net,
            COALESCE(SUM(CASE WHEN s.status = 'paid' THEN s.base_amount + s.bonuses - s.deductions ELSE 0 END), 0)::text AS total_paid,
            COALESCE(SUM(CASE WHEN s.status <> 'paid' THEN s.base_amount + s.bonuses - s.deductions ELSE 0 END), 0)::text AS total_pending
     FROM salaries s WHERE ${where}`,
    params,
  )
  const row = result.rows[0]
  return {
    count: Number.parseInt(row.count, 10),
    totalNet: Number.parseFloat(row.total_net) || 0,
    totalPaid: Number.parseFloat(row.total_paid) || 0,
    totalPending: Number.parseFloat(row.total_pending) || 0,
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateSalary(
  pool: DbPool,
  tenantId: string,
  id: string,
  input: Partial<SalaryInput>,
): Promise<SalaryRow | null> {
  const existing = await pool.query<RawSalaryRow>(
    `${SELECT_WITH_STAFF} WHERE s.id = $1 AND s.tenant_id = $2`,
    [id, tenantId],
  )
  if (!existing.rows[0]) return null
  const prev = normalize(existing.rows[0])

  const result = await pool.query<RawSalaryRow>(
    `WITH upd AS (
       UPDATE salaries
       SET staff_member_id = $3, period_month = $4, base_amount = $5, bonuses = $6,
           deductions = $7, notes = $8, updated_at = now()
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, staff_member_id, period_month, base_amount, bonuses, deductions,
                 status, paid_at, notes, created_at, updated_at
     )
     SELECT upd.id, upd.staff_member_id, m.full_name AS staff_name, m.staff_type,
            upd.period_month::text AS period_month, upd.base_amount, upd.bonuses, upd.deductions,
            upd.status, upd.paid_at, upd.notes, upd.created_at, upd.updated_at
     FROM upd JOIN staff_members m ON m.id = upd.staff_member_id`,
    [
      id,
      tenantId,
      input.staff_member_id ?? prev.staff_member_id,
      input.period_month ?? prev.period_month,
      (input.base_amount ?? prev.base_amount).toFixed(2),
      (input.bonuses ?? prev.bonuses).toFixed(2),
      (input.deductions ?? prev.deductions).toFixed(2),
      input.notes !== undefined ? input.notes : prev.notes,
    ],
  )
  return result.rows[0] ? normalize(result.rows[0]) : null
}

// ---------------------------------------------------------------------------
// Lifecycle transitions
// ---------------------------------------------------------------------------

export async function setSalaryStatus(
  pool: DbPool,
  tenantId: string,
  id: string,
  status: SalaryStatus,
): Promise<SalaryRow | null> {
  const result = await pool.query<RawSalaryRow>(
    `WITH upd AS (
       UPDATE salaries
       SET status = $3,
           paid_at = CASE WHEN $3 = 'paid' THEN now() ELSE paid_at END,
           updated_at = now()
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, staff_member_id, period_month, base_amount, bonuses, deductions,
                 status, paid_at, notes, created_at, updated_at
     )
     SELECT upd.id, upd.staff_member_id, m.full_name AS staff_name, m.staff_type,
            upd.period_month::text AS period_month, upd.base_amount, upd.bonuses, upd.deductions,
            upd.status, upd.paid_at, upd.notes, upd.created_at, upd.updated_at
     FROM upd JOIN staff_members m ON m.id = upd.staff_member_id`,
    [id, tenantId, status],
  )
  return result.rows[0] ? normalize(result.rows[0]) : null
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteSalary(
  pool: DbPool,
  tenantId: string,
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM salaries WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  )
  return (result.rowCount ?? 0) > 0
}
