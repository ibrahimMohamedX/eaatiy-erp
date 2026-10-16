// ============================================================================
// Repository: Expenses — Admin full CRUD
// ============================================================================
// Clinic operating expenses. Every query is tenant-scoped.
// ============================================================================

import type { DbPool } from "../db-client"
import type { ExpenseCategory } from "@/lib/db/schema/tenant/expenses"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExpenseRow {
  id: string
  category: string
  description: string
  amount: number
  expense_date: string // YYYY-MM-DD
  recorded_by: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseInput {
  category: ExpenseCategory
  description: string
  amount: number
  expense_date: string
}

interface RawExpenseRow {
  id: string
  category: string
  description: string
  amount: string
  expense_date: string
  recorded_by: string | null
  created_at: Date
  updated_at: Date
}

function normalize(row: RawExpenseRow): ExpenseRow {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    amount: Number.parseFloat(row.amount) || 0,
    expense_date: row.expense_date,
    recorded_by: row.recorded_by,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createExpense(
  pool: DbPool,
  tenantId: string,
  input: ExpenseInput,
  recordedBy: string,
): Promise<ExpenseRow> {
  const result = await pool.query<RawExpenseRow>(
    `INSERT INTO expenses (tenant_id, category, description, amount, expense_date, recorded_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, category, description, amount, expense_date::text AS expense_date,
               recorded_by, created_at, updated_at`,
    [
      tenantId,
      input.category,
      input.description,
      input.amount.toFixed(2),
      input.expense_date,
      recordedBy,
    ],
  )
  return normalize(result.rows[0])
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function listExpenses(
  pool: DbPool,
  tenantId: string,
  opts?: { since?: string; until?: string; category?: string },
): Promise<ExpenseRow[]> {
  const params: unknown[] = [tenantId]
  let where = `tenant_id = $1`
  if (opts?.since) {
    params.push(opts.since)
    where += ` AND expense_date >= $${params.length}`
  }
  if (opts?.until) {
    params.push(opts.until)
    where += ` AND expense_date <= $${params.length}`
  }
  if (opts?.category) {
    params.push(opts.category)
    where += ` AND category = $${params.length}`
  }
  const result = await pool.query<RawExpenseRow>(
    `SELECT id, category, description, amount, expense_date::text AS expense_date,
            recorded_by, created_at, updated_at
     FROM expenses WHERE ${where}
     ORDER BY expense_date DESC, created_at DESC`,
    params,
  )
  return result.rows.map(normalize)
}

export async function getExpenseById(
  pool: DbPool,
  tenantId: string,
  id: string,
): Promise<ExpenseRow | null> {
  const result = await pool.query<RawExpenseRow>(
    `SELECT id, category, description, amount, expense_date::text AS expense_date,
            recorded_by, created_at, updated_at
     FROM expenses WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  )
  return result.rows[0] ? normalize(result.rows[0]) : null
}

export interface ExpenseTotals {
  count: number
  totalAmount: number
  byCategory: Array<{ category: string; total: number; count: number }>
}

export async function getExpenseTotals(
  pool: DbPool,
  tenantId: string,
  opts?: { since?: string; until?: string },
): Promise<ExpenseTotals> {
  const params: unknown[] = [tenantId]
  let where = `tenant_id = $1`
  if (opts?.since) {
    params.push(opts.since)
    where += ` AND expense_date >= $${params.length}`
  }
  if (opts?.until) {
    params.push(opts.until)
    where += ` AND expense_date <= $${params.length}`
  }
  const [totalResult, byCategoryResult] = await Promise.all([
    pool.query<{ count: string; total: string }>(
      `SELECT COUNT(*)::text AS count, COALESCE(SUM(amount), 0)::text AS total
       FROM expenses WHERE ${where}`,
      params,
    ),
    pool.query<{ category: string; total: string; count: string }>(
      `SELECT category, COALESCE(SUM(amount), 0)::text AS total, COUNT(*)::text AS count
       FROM expenses WHERE ${where}
       GROUP BY category ORDER BY SUM(amount) DESC`,
      params,
    ),
  ])
  return {
    count: Number.parseInt(totalResult.rows[0].count, 10),
    totalAmount: Number.parseFloat(totalResult.rows[0].total) || 0,
    byCategory: byCategoryResult.rows.map((r) => ({
      category: r.category,
      total: Number.parseFloat(r.total) || 0,
      count: Number.parseInt(r.count, 10),
    })),
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateExpense(
  pool: DbPool,
  tenantId: string,
  id: string,
  input: Partial<ExpenseInput>,
): Promise<ExpenseRow | null> {
  const existing = await getExpenseById(pool, tenantId, id)
  if (!existing) return null
  const result = await pool.query<RawExpenseRow>(
    `UPDATE expenses
     SET category = $3, description = $4, amount = $5, expense_date = $6, updated_at = now()
     WHERE id = $1 AND tenant_id = $2
     RETURNING id, category, description, amount, expense_date::text AS expense_date,
               recorded_by, created_at, updated_at`,
    [
      id,
      tenantId,
      input.category ?? existing.category,
      input.description ?? existing.description,
      (input.amount ?? existing.amount).toFixed(2),
      input.expense_date ?? existing.expense_date,
    ],
  )
  return result.rows[0] ? normalize(result.rows[0]) : null
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteExpense(
  pool: DbPool,
  tenantId: string,
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM expenses WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  )
  return (result.rowCount ?? 0) > 0
}
