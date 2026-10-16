"use server"

// ============================================================================
// Admin Actions: Shifts — full CRUD
// ============================================================================
// Admin defines weekly shift templates per staff member.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import {
  listShifts,
  createShift as repoCreate,
  updateShift as repoUpdate,
  deleteShift as repoDelete,
  type ShiftRow,
} from "@/lib/db/repositories/shifts"
import { listStaffMembers, type StaffMemberRow } from "@/lib/db/repositories/staff-members"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type ShiftActionResult =
  | { success: true; data: ShiftRow }
  | { success: false; error: string }

export interface ShiftsTabData {
  shifts: ShiftRow[]
  staff: StaffMemberRow[]
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getShiftsData(): Promise<
  { success: true; data: ShiftsTabData } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const [shifts, staff] = await Promise.all([
      listShifts(pool, ctx.tenantId),
      listStaffMembers(pool, ctx.tenantId),
    ])
    return { success: true, data: { shifts, staff } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch shifts data",
    }
  }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function validateShiftInput(input: {
  staff_member_id?: string
  day_of_week?: number
  start_time?: string
  end_time?: string
}): string | null {
  if (!input.staff_member_id) return "Staff member is required"
  if (
    input.day_of_week === undefined ||
    !Number.isInteger(input.day_of_week) ||
    input.day_of_week < 0 ||
    input.day_of_week > 6
  ) {
    return "Day of week must be 0 (Sunday) … 6 (Saturday)"
  }
  if (!input.start_time || !TIME_RE.test(input.start_time)) {
    return "Start time must be HH:MM (24h)"
  }
  if (!input.end_time || !TIME_RE.test(input.end_time)) {
    return "End time must be HH:MM (24h)"
  }
  return null
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateShiftActionInput {
  staff_member_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export async function createShift(
  input: CreateShiftActionInput,
): Promise<ShiftActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const validation = validateShiftInput(input)
    if (validation) return { success: false, error: validation }

    const pool = getTenantPool(ctx.tenantSlug)
    const staff = await listStaffMembers(pool, ctx.tenantId, { includeInactive: true })
    if (!staff.some((s) => s.id === input.staff_member_id)) {
      return { success: false, error: "Staff member not found" }
    }

    const row = await repoCreate(pool, ctx.tenantId, {
      staff_member_id: input.staff_member_id,
      day_of_week: input.day_of_week,
      start_time: input.start_time,
      end_time: input.end_time,
    })
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create shift",
    }
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateShift(
  id: string,
  input: Partial<CreateShiftActionInput>,
): Promise<ShiftActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const validation = validateShiftInput({
      staff_member_id: input.staff_member_id ?? "keep",
      day_of_week: input.day_of_week,
      start_time: input.start_time,
      end_time: input.end_time,
    })
    if (input.start_time !== undefined || input.end_time !== undefined || input.day_of_week !== undefined) {
      if (validation && validation !== "Staff member is required") {
        return { success: false, error: validation }
      }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const row = await repoUpdate(pool, ctx.tenantId, id, {
      staff_member_id: input.staff_member_id,
      day_of_week: input.day_of_week,
      start_time: input.start_time,
      end_time: input.end_time,
    })
    if (!row) return { success: false, error: "Shift not found" }
    return { success: true, data: row }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update shift",
    }
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteShift(
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
    if (!ok) return { success: false, error: "Shift not found" }
    return { success: true, deleted: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete shift",
    }
  }
}
