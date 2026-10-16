"use server"

// ============================================================================
// Admin Actions: Salaries — full CRUD + lifecycle (draft → approved → paid)
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import {
  listSalaries,
  getSalaryTotals,
  createSalary as repoCreate,
  updateSalary as repoUpdate,
  setSalaryStatus as repoSetStatus,
  deleteSalary as repoDelete,
  type SalaryRow,
  type SalaryTotals,
} from "@/lib/db/repositories/salaries"
import { listStaffMembers, type StaffMemberRow } from "@/lib/db/repositories/staff-members"
import { SALARY_STATUSES, type SalaryStatus } from "@/lib/db/schema/tenant/salaries"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type SalaryActionResult =
  | { success: true; data: SalaryRow }
  | { success: false; error: string }

export interface SalariesTabData {
  salaries: SalaryRow[]
  staff: StaffMemberRow[]
  totals: SalaryTotals
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getSalariesData(
  periodMonth?: string,
): Promise<
  { success: true; data: SalariesTabData } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const [salaries, staff, totals] = await Promise.all([
      listSalaries(pool, ctx.tenantId, periodMonth ? { periodMonth } : undefined),
      listStaffMembers(pool, ctx.tenantId),
      getSalaryTotals(pool, ctx.tenantId, periodMonth),
    ])
    return { success: true, data: { salaries, staff, totals } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch salaries data",
    }
  }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])-01$/

function validateMoney(v: number | undefined, label: string): string | null {
  if (v === undefined) return null
  if (!Number.isFinite(v) || v < 0) return `${label} must be a non-negative number`
  return null
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateSalaryActionInput {
  staff_member_id: string
  period_month: string // YYYY-MM-01
  base_amount: number
  bonuses?: number
  deductions?: number
  notes?: string | null
}

export async function createSalary(
  input: CreateSalaryActionInput,
): Promise<SalaryActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    if (!input.staff_member_id) return { success: false, error: "Staff member is required" }
    if (!MONTH_RE.test(input.period_month)) {
      return { success: false, error: "Period must be the first day of a month (YYYY-MM-01)" }
    }
    const moneyErr =
      validateMoney(input.base_amount, "Base amount") ??
      validateMoney(input.bonuses, "Bonuses") ??
      validateMoney(input.deductions, "Deductions")
    if (moneyErr) return { success: false, error: moneyErr }

    const pool = getTenantPool(ctx.tenantSlug)
    const staff = await listStaffMembers(pool, ctx.tenantId, { includeInactive: true })
    if (!staff.some((s) => s.id === input.staff_member_id)) {
      return { success: false, error: "Staff member not found" }
    }

    const row = await repoCreate(pool, ctx.tenantId, {
      staff_member_id: input.staff_member_id,
      period_month: input.period_month,
      base_amount: input.base_amount,
      bonuses: input.bonuses ?? 0,
      deductions: input.deductions ?? 0,
      notes: input.notes?.trim() || null,
    })
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create salary record",
    }
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateSalary(
  id: string,
  input: Partial<CreateSalaryActionInput>,
): Promise<SalaryActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    if (input.period_month !== undefined && !MONTH_RE.test(input.period_month)) {
      return { success: false, error: "Period must be the first day of a month (YYYY-MM-01)" }
    }
    const moneyErr =
      validateMoney(input.base_amount, "Base amount") ??
      validateMoney(input.bonuses, "Bonuses") ??
      validateMoney(input.deductions, "Deductions")
    if (moneyErr) return { success: false, error: moneyErr }

    const pool = getTenantPool(ctx.tenantSlug)
    const row = await repoUpdate(pool, ctx.tenantId, id, {
      staff_member_id: input.staff_member_id,
      period_month: input.period_month,
      base_amount: input.base_amount,
      bonuses: input.bonuses,
      deductions: input.deductions,
      notes: input.notes,
    })
    if (!row) return { success: false, error: "Salary record not found" }
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update salary record",
    }
  }
}

// ---------------------------------------------------------------------------
// Lifecycle: approve / mark paid
// ---------------------------------------------------------------------------

export async function setSalaryStatus(
  id: string,
  status: string,
): Promise<SalaryActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const valid = SALARY_STATUSES.find((s) => s === status)
    if (!valid) {
      return { success: false, error: `Status must be one of: ${SALARY_STATUSES.join(", ")}` }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const row = await repoSetStatus(pool, ctx.tenantId, id, valid as SalaryStatus)
    if (!row) return { success: false, error: "Salary record not found" }
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update salary status",
    }
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteSalary(
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
    if (!ok) return { success: false, error: "Salary record not found" }
    return { success: true, deleted: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete salary record",
    }
  }
}
