// ============================================================================
// Repository: Shifts — Admin full CRUD
// ============================================================================
// Weekly shift template per staff member (day_of_week 0=Sunday … 6=Saturday).
// Every query is tenant-scoped.
// ============================================================================

import type { DbPool } from "../db-client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShiftRow {
  id: string
  staff_member_id: string
  staff_name: string
  staff_type: string
  day_of_week: number
  start_time: string // "HH:MM:SS"
  end_time: string // "HH:MM:SS"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ShiftInput {
  staff_member_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active?: boolean
}

interface RawShiftRow {
  id: string
  staff_member_id: string
  staff_name: string
  staff_type: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

const SELECT_WITH_STAFF = `
  SELECT s.id, s.staff_member_id, m.full_name AS staff_name, m.staff_type,
         s.day_of_week, s.start_time::text AS start_time, s.end_time::text AS end_time,
         s.is_active, s.created_at, s.updated_at
  FROM shifts s
  JOIN staff_members m ON m.id = s.staff_member_id
`

function normalize(row: RawShiftRow): ShiftRow {
  return {
    id: row.id,
    staff_member_id: row.staff_member_id,
    staff_name: row.staff_name,
    staff_type: row.staff_type,
    day_of_week: row.day_of_week,
    start_time: row.start_time,
    end_time: row.end_time,
    is_active: row.is_active,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createShift(
  pool: DbPool,
  tenantId: string,
  input: ShiftInput,
): Promise<ShiftRow> {
  const result = await pool.query<RawShiftRow>(
    `WITH ins AS (
       INSERT INTO shifts (tenant_id, staff_member_id, day_of_week, start_time, end_time, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, staff_member_id, day_of_week, start_time, end_time, is_active, created_at, updated_at
     )
     SELECT ins.id, ins.staff_member_id, m.full_name AS staff_name, m.staff_type,
            ins.day_of_week, ins.start_time::text AS start_time, ins.end_time::text AS end_time,
            ins.is_active, ins.created_at, ins.updated_at
     FROM ins JOIN staff_members m ON m.id = ins.staff_member_id`,
    [
      tenantId,
      input.staff_member_id,
      input.day_of_week,
      input.start_time,
      input.end_time,
      input.is_active ?? true,
    ],
  )
  return normalize(result.rows[0])
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function listShifts(
  pool: DbPool,
  tenantId: string,
  opts?: { staffMemberId?: string },
): Promise<ShiftRow[]> {
  const params: unknown[] = [tenantId]
  let where = `s.tenant_id = $1`
  if (opts?.staffMemberId) {
    params.push(opts.staffMemberId)
    where += ` AND s.staff_member_id = $${params.length}`
  }
  const result = await pool.query<RawShiftRow>(
    `${SELECT_WITH_STAFF} WHERE ${where}
     ORDER BY m.full_name, s.day_of_week, s.start_time`,
    params,
  )
  return result.rows.map(normalize)
}

export async function getShiftById(
  pool: DbPool,
  tenantId: string,
  id: string,
): Promise<ShiftRow | null> {
  const result = await pool.query<RawShiftRow>(
    `${SELECT_WITH_STAFF} WHERE s.id = $1 AND s.tenant_id = $2`,
    [id, tenantId],
  )
  return result.rows[0] ? normalize(result.rows[0]) : null
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateShift(
  pool: DbPool,
  tenantId: string,
  id: string,
  input: Partial<ShiftInput>,
): Promise<ShiftRow | null> {
  const existing = await pool.query<RawShiftRow>(
    `${SELECT_WITH_STAFF} WHERE s.id = $1 AND s.tenant_id = $2`,
    [id, tenantId],
  )
  if (!existing.rows[0]) return null
  const prev = normalize(existing.rows[0])

  const result = await pool.query<RawShiftRow>(
    `WITH upd AS (
       UPDATE shifts
       SET staff_member_id = $3, day_of_week = $4, start_time = $5, end_time = $6,
           is_active = $7, updated_at = now()
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, staff_member_id, day_of_week, start_time, end_time, is_active, created_at, updated_at
     )
     SELECT upd.id, upd.staff_member_id, m.full_name AS staff_name, m.staff_type,
            upd.day_of_week, upd.start_time::text AS start_time, upd.end_time::text AS end_time,
            upd.is_active, upd.created_at, upd.updated_at
     FROM upd JOIN staff_members m ON m.id = upd.staff_member_id`,
    [
      id,
      tenantId,
      input.staff_member_id ?? prev.staff_member_id,
      input.day_of_week ?? prev.day_of_week,
      input.start_time ?? prev.start_time,
      input.end_time ?? prev.end_time,
      input.is_active ?? prev.is_active,
    ],
  )
  return result.rows[0] ? normalize(result.rows[0]) : null
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteShift(
  pool: DbPool,
  tenantId: string,
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM shifts WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  )
  return (result.rowCount ?? 0) > 0
}
