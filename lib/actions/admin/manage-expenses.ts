"use server"

// ============================================================================
// Admin Actions: Expenses — full CRUD
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import {
  listExpenses,
  getExpenseTotals,
  createExpense as repoCreate,
  updateExpense as repoUpdate,
  deleteExpense as repoDelete,
  type ExpenseRow,
  type ExpenseTotals,
} from "@/lib/db/repositories/expenses"
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/db/schema/tenant/expenses"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type ExpenseActionResult =
  | { success: true; data: ExpenseRow }
  | { success: false; error: string }

export interface ExpensesTabData {
  expenses: ExpenseRow[]
  totals: ExpenseTotals
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getExpensesData(
  since?: string,
  until?: string,
): Promise<
  { success: true; data: ExpensesTabData } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const [expenses, totals] = await Promise.all([
      listExpenses(pool, ctx.tenantId, { since, until }),
      getExpenseTotals(pool, ctx.tenantId, { since, until }),
    ])
    return { success: true, data: { expenses, totals } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch expenses data",
    }
  }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function validateExpenseInput(input: {
  category?: string
  description?: string
  amount?: number
  expense_date?: string
}): string | null {
  if (input.category !== undefined) {
    if (!EXPENSE_CATEGORIES.find((c) => c === input.category)) {
      return `Category must be one of: ${EXPENSE_CATEGORIES.join(", ")}`
    }
  }
  if (input.description !== undefined && !input.description.trim()) {
    return "Description is required"
  }
  if (
    input.amount !== undefined &&
    (!Number.isFinite(input.amount) || input.amount <= 0)
  ) {
    return "Amount must be a positive number"
  }
  if (input.expense_date !== undefined && !DATE_RE.test(input.expense_date)) {
    return "Expense date must be YYYY-MM-DD"
  }
  return null
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateExpenseActionInput {
  category: ExpenseCategory
  description: string
  amount: number
  expense_date: string
}

export async function createExpense(
  input: CreateExpenseActionInput,
): Promise<ExpenseActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const validation = validateExpenseInput(input)
    if (!input.description?.trim()) return { success: false, error: "Description is required" }
    if (validation) return { success: false, error: validation }

    const pool = getTenantPool(ctx.tenantSlug)
    const row = await repoCreate(pool, ctx.tenantId, {
      category: input.category,
      description: input.description.trim(),
      amount: input.amount,
      expense_date: input.expense_date,
    }, ctx.userId)
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create expense",
    }
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateExpense(
  id: string,
  input: Partial<CreateExpenseActionInput>,
): Promise<ExpenseActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const validation = validateExpenseInput(input)
    if (validation) return { success: false, error: validation }

    const pool = getTenantPool(ctx.tenantSlug)
    const row = await repoUpdate(pool, ctx.tenantId, id, {
      category: input.category,
      description: input.description,
      amount: input.amount,
      expense_date: input.expense_date,
    })
    if (!row) return { success: false, error: "Expense not found" }
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update expense",
    }
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteExpense(
  id: string,
): Promise<{ success: true; deleted: true } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const pool = getTenantPool(ctx.tenantSlug)
    const ok = await repoDelete(pool, ctx.tenantId, id)
    if (!ok) return { success: false, error: "Expense not found" }
    return { success: true, deleted: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete expense",
    }
  }
}
