// ============================================================================
// Repository: Appointments
// ============================================================================
// Operates on tenant-scoped appointments table. queue_number computation
// (next-available per doctor per day) is an application-level concern.
// ============================================================================

import type { DbPool } from "../db-client"
import type { Appointment, AppointmentStatus, AppointmentType } from "@/lib/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize pg timestamp columns (Date objects) to ISO strings for the Appointment type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAppointment(row: any): Appointment {
  return {
    ...row,
    scheduled_start: toISO(row.scheduled_start),
    last_called_at: toISO(row.last_called_at) ?? undefined,
    actual_start: toISO(row.actual_start) ?? undefined,
    completed_at: toISO(row.completed_at) ?? undefined,
    cancelled_at: toISO(row.cancelled_at) ?? undefined,
    created_at: toISO(row.created_at),
    updated_at: toISO(row.updated_at),
  } as Appointment
}

function toISO(val: unknown): string {
  if (val instanceof Date) return val.toISOString()
  if (typeof val === "string") return val
  return String(val ?? "")
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateAppointmentInput {
  patient_id: string
  doctor_id: string
  type: AppointmentType
  scheduled_start: string // ISO 8601
}

export async function createAppointment(
  pool: DbPool,
  tenantId: string,
  input: CreateAppointmentInput,
): Promise<Appointment> {
  // Compute the next queue_number for this doctor + date
  const dayStart = input.scheduled_start.slice(0, 10)
  const queueResult = await pool.query<{ max_q: string | null }>(
    `SELECT MAX(queue_number) as max_q
     FROM appointments
     WHERE tenant_id = $1
       AND doctor_id = $2
       AND scheduled_start::date = $3::date`,
    [tenantId, input.doctor_id, dayStart],
  )
  const nextQueue = (Number.parseInt(queueResult.rows[0]?.max_q ?? "0", 10) || 0) + 1

  const result = await pool.query<Appointment>(
    `INSERT INTO appointments (
       tenant_id, patient_id, doctor_id, queue_number, type, scheduled_start
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      tenantId,
      input.patient_id,
      input.doctor_id,
      nextQueue,
      input.type,
      input.scheduled_start,
    ],
  )
  return result.rows.map(normalizeAppointment)[0]
}

// ---------------------------------------------------------------------------
// Read — today's queue
// ---------------------------------------------------------------------------

export async function getTodayQueue(
  pool: DbPool,
  tenantId: string,
  doctorId?: string,
): Promise<Appointment[]> {
  // Use a range query instead of ::date cast to leverage indexes on scheduled_start
  const now = new Date()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  let query: string
  let params: unknown[]
  if (doctorId) {
    query = `SELECT * FROM appointments
             WHERE tenant_id = $1
               AND scheduled_start >= $2
               AND scheduled_start < $3
               AND doctor_id = $4
             ORDER BY queue_number`
    params = [tenantId, dayStart.toISOString(), dayEnd.toISOString(), doctorId]
  } else {
    query = `SELECT * FROM appointments
             WHERE tenant_id = $1
               AND scheduled_start >= $2
               AND scheduled_start < $3
             ORDER BY queue_number`
    params = [tenantId, dayStart.toISOString(), dayEnd.toISOString()]
  }
  const result = await pool.query<Appointment>(query, params)
  return result.rows.map(normalizeAppointment)
}

export async function getAppointmentById(
  pool: DbPool,
  tenantId: string,
  appointmentId: string,
): Promise<Appointment | null> {
  const result = await pool.query<Appointment>(
    `SELECT * FROM appointments WHERE id = $1 AND tenant_id = $2`,
    [appointmentId, tenantId],
  )
  return result.rows.map(normalizeAppointment)[0] ?? null
}

export async function getPatientHistory(
  pool: DbPool,
  tenantId: string,
  patientId: string,
): Promise<Appointment[]> {
  const result = await pool.query<Appointment>(
    `SELECT * FROM appointments
     WHERE tenant_id = $1 AND patient_id = $2 AND status = 'completed'
     ORDER BY scheduled_start DESC
     LIMIT 50`,
    [tenantId, patientId],
  )
  return result.rows.map(normalizeAppointment)
}

// ---------------------------------------------------------------------------
// Status transitions
// ---------------------------------------------------------------------------

export async function transitionAppointmentStatus(
  pool: DbPool,
  tenantId: string,
  appointmentId: string,
  to: AppointmentStatus,
  opts?: { cancellation_reason?: string },
): Promise<Appointment | null> {
  const now = new Date().toISOString()

  let query: string
  const params: unknown[] = [appointmentId, tenantId]

  switch (to) {
    case "in_consultation":
      query = `UPDATE appointments
               SET status = $3, actual_start = $4, updated_at = $5
               WHERE id = $1 AND tenant_id = $2
               RETURNING *`
      params.push(to, now, now)
      break
    case "completed":
      query = `UPDATE appointments
               SET status = $3, completed_at = $4, updated_at = $5
               WHERE id = $1 AND tenant_id = $2
               RETURNING *`
      params.push(to, now, now)
      break
    case "cancelled":
      query = `UPDATE appointments
               SET status = $3, cancelled_at = $4, cancellation_reason = $5, updated_at = $6
               WHERE id = $1 AND tenant_id = $2
               RETURNING *`
      params.push(to, now, opts?.cancellation_reason ?? null, now)
      break
    case "waiting":
      query = `UPDATE appointments
               SET status = $3, updated_at = $4
               WHERE id = $1 AND tenant_id = $2
               RETURNING *`
      params.push(to, now)
      break
    case "called":
      query = `UPDATE appointments
               SET status = $3, last_called_at = $4, updated_at = $5
               WHERE id = $1 AND tenant_id = $2
               RETURNING *`
      params.push(to, now, now)
      break
    default: {
      // Exhaustive check — compile-time guarantee
      const _exhaustive: never = to
      throw new Error(`Unhandled status transition: ${String(_exhaustive)}`)
    }
  }

  const result = await pool.query<Appointment>(query, params)
  return result.rows.map(normalizeAppointment)[0] ?? null
}

// ---------------------------------------------------------------------------
// Date-range query (for admin analytics)
// ---------------------------------------------------------------------------

export async function getAppointmentsByDateRange(
  pool: DbPool,
  tenantId: string,
  since?: string,
  until?: string,
): Promise<Appointment[]> {
  const conditions: string[] = ["tenant_id = $1"]
  const params: unknown[] = [tenantId]
  if (since) {
    params.push(since)
    conditions.push(`created_at >= $${params.length}`)
  }
  if (until) {
    params.push(until)
    conditions.push(`created_at < $${params.length}`)
  }
  const query = `SELECT * FROM appointments
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT 500`
  const result = await pool.query<Appointment>(query, params)
  return result.rows.map(normalizeAppointment)
}

// ---------------------------------------------------------------------------
// Aggregates (KPI row)
// ---------------------------------------------------------------------------

export interface QueueCounts {
  waiting: number
  called: number
  inConsultation: number
  completedToday: number
  cancelledToday: number
}

export async function getTodayCounts(
  pool: DbPool,
  tenantId: string,
): Promise<QueueCounts> {
  // Use a range query instead of ::date cast to leverage indexes on scheduled_start
  const now = new Date()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  const result = await pool.query<{
    status: string
    count: string
  }>(
    `SELECT status, COUNT(*) as count
     FROM appointments
     WHERE tenant_id = $1 AND scheduled_start >= $2 AND scheduled_start < $3
     GROUP BY status`,
    [tenantId, dayStart.toISOString(), dayEnd.toISOString()],
  )
  const map: Record<string, number> = {}
  for (const row of result.rows) {
    map[row.status] = Number.parseInt(row.count, 10)
  }
  return {
    waiting: map.waiting ?? 0,
    called: map.called ?? 0,
    inConsultation: map.in_consultation ?? 0,
    completedToday: map.completed ?? 0,
    cancelledToday: map.cancelled ?? 0,
  }
}