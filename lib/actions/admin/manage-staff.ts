"use server"

// ============================================================================
// Admin Actions: Staff Members — full CRUD
// ============================================================================
// Admin owns the staff registry: doctors, receptionists, supervisors,
// cleaners, security, … every query tenant-scoped via getTenantContext().
// ============================================================================

import { getTenantPool, getIdentityPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import {
  listStaffMembers,
  createStaffMember as repoCreate,
  updateStaffMember as repoUpdate,
  deleteStaffMember as repoDelete,
  type StaffMemberRow,
  type StaffMemberInput,
} from "@/lib/db/repositories/staff-members"
import { STAFF_TYPES, type StaffType } from "@/lib/db/schema/tenant/staff-members"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type StaffActionResult =
  | { success: true; data: StaffMemberRow }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export interface StaffTabData {
  staff: StaffMemberRow[]
  /** identity users with login accounts, enriched with staff link info */
  users: Array<{
    id: string
    full_name: string
    email: string
    role: string
    is_active: boolean
  }>
}

export async function getStaffData(): Promise<
  { success: true; data: StaffTabData } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const identityPool = getIdentityPool()

    const [staff, usersResult] = await Promise.all([
      listStaffMembers(pool, ctx.tenantId, { includeInactive: true }),
      identityPool.query<{
        id: string
        full_name: string
        email: string
        role: string
        is_active: boolean
      }>(
        `SELECT id, full_name, email, role, is_active
         FROM users WHERE tenant_id = $1 ORDER BY full_name`,
        [ctx.tenantId],
      ),
    ])

    return {
      success: true,
      data: { staff, users: usersResult.rows },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch staff data",
    }
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateStaffInput {
  full_name: string
  staff_type: StaffType
  job_title?: string | null
  phone?: string | null
  monthly_salary: number
  hired_at?: string | null
  notes?: string | null
  /** optionally link to an existing identity user account */
  user_id?: string | null
}

function validateStaffType(raw: string): StaffType | null {
  const t = STAFF_TYPES.find((s) => s === raw)
  return t ?? null
}

export async function createStaff(
  input: CreateStaffInput,
): Promise<StaffActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const staffType = validateStaffType(input.staff_type)
    if (!staffType) {
      return { success: false, error: "Invalid staff type" }
    }
    if (!input.full_name.trim()) {
      return { success: false, error: "Name is required" }
    }
    if (!Number.isFinite(input.monthly_salary) || input.monthly_salary < 0) {
      return { success: false, error: "Invalid salary amount" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const row = await repoCreate(pool, ctx.tenantId, {
      full_name: input.full_name.trim(),
      staff_type: staffType,
      job_title: input.job_title?.trim() || null,
      phone: input.phone?.trim() || null,
      monthly_salary: input.monthly_salary,
      hired_at: input.hired_at || null,
      notes: input.notes?.trim() || null,
      user_id: input.user_id || null,
    })
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create staff member",
    }
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export type UpdateStaffInput = Partial<CreateStaffInput>

export async function updateStaff(
  id: string,
  input: UpdateStaffInput,
): Promise<StaffActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    if (input.staff_type !== undefined) {
      const staffType = validateStaffType(input.staff_type)
      if (!staffType) return { success: false, error: "Invalid staff type" }
    }
    if (
      input.monthly_salary !== undefined &&
      (!Number.isFinite(input.monthly_salary) || input.monthly_salary < 0)
    ) {
      return { success: false, error: "Invalid salary amount" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const repoInput: Partial<StaffMemberInput> = {}
    if (input.full_name !== undefined) repoInput.full_name = input.full_name.trim()
    if (input.staff_type !== undefined && validateStaffType(input.staff_type)) {
      repoInput.staff_type = input.staff_type as StaffType
    }
    if (input.job_title !== undefined) repoInput.job_title = input.job_title?.trim() || null
    if (input.phone !== undefined) repoInput.phone = input.phone?.trim() || null
    if (input.monthly_salary !== undefined) repoInput.monthly_salary = input.monthly_salary
    if (input.hired_at !== undefined) repoInput.hired_at = input.hired_at || null
    if (input.notes !== undefined) repoInput.notes = input.notes?.trim() || null
    if (input.user_id !== undefined) repoInput.user_id = input.user_id || null

    const row = await repoUpdate(pool, ctx.tenantId, id, repoInput)
    if (!row) return { success: false, error: "Staff member not found" }
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update staff member",
    }
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteStaff(
  id: string,
): Promise<{ success: true; deleted: true } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const existing = await listStaffMembers(pool, ctx.tenantId, { includeInactive: true })
    const target = existing.find((s) => s.id === id)
    if (!target) return { success: false, error: "Staff member not found" }

    const ok = await repoDelete(pool, ctx.tenantId, id)
    if (!ok) return { success: false, error: "Failed to delete staff member" }
    return { success: true, deleted: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete staff member",
    }
  }
}
