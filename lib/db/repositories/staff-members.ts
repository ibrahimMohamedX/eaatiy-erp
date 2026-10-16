// ============================================================================
// Repository: Staff Members — Admin full CRUD
// ============================================================================
// Registry of everyone working at the clinic: login roles (doctors,
// receptionists, supervisors) and non-login staff (cleaners, security, …).
// Every query is tenant-scoped.
// ============================================================================

import type { DbPool } from "../db-client"
import type { StaffType } from "@/lib/db/schema/tenant/staff-members"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StaffMemberRow {
  id: string
  user_id: string | null
  full_name: string
  staff_type: string
  job_title: string | null
  phone: string | null
  monthly_salary: number
  is_active: boolean
  hired_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface StaffMemberInput {
  full_name: string
  staff_type: StaffType
  job_title?: string | null
  phone?: string | null
  monthly_salary: number
  user_id?: string | null
  hired_at?: string | null
  notes?: string | null
  is_active?: boolean
}

interface RawStaffRow {
  id: string
  user_id: string | null
  full_name: string
  staff_type: string
  job_title: string | null
  phone: string | null
  monthly_salary: string
  is_active: boolean
  hired_at: string | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

function normalize(row: RawStaffRow): StaffMemberRow {
  return {
    id: row.id,
    user_id: row.user_id,
    full_name: row.full_name,
    staff_type: row.staff_type,
    job_title: row.job_title,
    phone: row.phone,
    monthly_salary: Number.parseFloat(row.monthly_salary) || 0,
    is_active: row.is_active,
    hired_at: row.hired_at,
    notes: row.notes,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createStaffMember(
  pool: DbPool,
  tenantId: string,
  input: StaffMemberInput,
): Promise<StaffMemberRow> {
  const result = await pool.query<RawStaffRow>(
    `INSERT INTO staff_members
       (tenant_id, user_id, full_name, staff_type, job_title, phone, monthly_salary, hired_at, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      tenantId,
      input.user_id ?? null,
      input.full_name,
      input.staff_type,
      input.job_title ?? null,
      input.phone ?? null,
      input.monthly_salary.toFixed(2),
      input.hired_at ?? null,
      input.notes ?? null,
    ],
  )
  return normalize(result.rows[0])
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function listStaffMembers(
  pool: DbPool,
  tenantId: string,
  opts?: { staffType?: string; includeInactive?: boolean },
): Promise<StaffMemberRow[]> {
  const params: unknown[] = [tenantId]
  let where = `tenant_id = $1`
  if (opts?.staffType) {
    params.push(opts.staffType)
    where += ` AND staff_type = $${params.length}`
  }
  if (!opts?.includeInactive) {
    where += ` AND is_active = true`
  }
  const result = await pool.query<RawStaffRow>(
    `SELECT * FROM staff_members WHERE ${where} ORDER BY staff_type, full_name`,
    params,
  )
  return result.rows.map(normalize)
}

export async function getStaffMemberById(
  pool: DbPool,
  tenantId: string,
  id: string,
): Promise<StaffMemberRow | null> {
  const result = await pool.query<RawStaffRow>(
    `SELECT * FROM staff_members WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  )
  return result.rows[0] ? normalize(result.rows[0]) : null
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateStaffMember(
  pool: DbPool,
  tenantId: string,
  id: string,
  input: Partial<StaffMemberInput>,
): Promise<StaffMemberRow | null> {
  const existing = await getStaffMemberById(pool, tenantId, id)
  if (!existing) return null

  const merged = {
    full_name: input.full_name ?? existing.full_name,
    staff_type: input.staff_type ?? existing.staff_type,
    job_title: input.job_title !== undefined ? input.job_title : existing.job_title,
    phone: input.phone !== undefined ? input.phone : existing.phone,
    monthly_salary:
      input.monthly_salary !== undefined ? input.monthly_salary : existing.monthly_salary,
    is_active: input.is_active !== undefined ? input.is_active : existing.is_active,
    hired_at: input.hired_at !== undefined ? input.hired_at : existing.hired_at,
    notes: input.notes !== undefined ? input.notes : existing.notes,
  }

  const result = await pool.query<RawStaffRow>(
    `UPDATE staff_members
     SET full_name = $3, staff_type = $4, job_title = $5, phone = $6,
         monthly_salary = $7, is_active = $8, hired_at = $9, notes = $10,
         updated_at = now()
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [
      id,
      tenantId,
      merged.full_name,
      merged.staff_type,
      merged.job_title,
      merged.phone,
      merged.monthly_salary.toFixed(2),
      merged.is_active,
      merged.hired_at,
      merged.notes,
    ],
  )
  return result.rows[0] ? normalize(result.rows[0]) : null
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Hard delete. Salaries/shifts referencing this staff member are deleted
 * first to satisfy their FK constraints.
 */
export async function deleteStaffMember(
  pool: DbPool,
  tenantId: string,
  id: string,
): Promise<boolean> {
  await pool.query(`DELETE FROM salaries WHERE staff_member_id = $1 AND tenant_id = $2`, [
    id,
    tenantId,
  ])
  await pool.query(`DELETE FROM shifts WHERE staff_member_id = $1 AND tenant_id = $2`, [
    id,
    tenantId,
  ])
  const result = await pool.query(
    `DELETE FROM staff_members WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  )
  return (result.rowCount ?? 0) > 0
}
