// ============================================================================
// Repository: Admin KPIs — Phase 2F
// ============================================================================
// Aggregation queries for the admin dashboard. All functions accept an optional
// date range filter (since/until ISO strings) to support the date range selector.
// ============================================================================

import type { DbPool } from "../db-client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RevenueSummary {
  totalPaid: number
  outstandingBalance: number
  averageFee: number
  recordCount: number
}

export interface AppointmentStats {
  total: number
  completed: number
  cancelled: number
  completionRate: number // percentage 0-100
  cancellationRate: number // percentage 0-100
}

export interface DoctorPerformance {
  doctorId: string
  total: number
  completed: number
  completionRate: number
}

export interface StatusDistribution {
  waiting: number
  inConsultation: number
  completed: number
  cancelled: number
}

export interface RevenueOverTimePoint {
  date: string // ISO date
  paid: number
  outstanding: number
}

export interface AppointmentsPerDoctorPoint {
  doctorId: string
  count: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dateWhereClause(since?: string, until?: string): { clause: string; params: unknown[] } {
  const conditions: string[] = []
  const params: unknown[] = []
  if (since) {
    params.push(since)
    conditions.push(`created_at >= $${params.length}`)
  }
  if (until) {
    params.push(until)
    conditions.push(`created_at < $${params.length}`)
  }
  return {
    clause: conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "",
    params,
  }
}

// ---------------------------------------------------------------------------
// Revenue Summary
// ---------------------------------------------------------------------------

export async function getRevenueSummary(
  pool: DbPool,
  tenantId: string,
  since?: string,
  until?: string,
): Promise<RevenueSummary> {
  const { clause, params } = dateWhereClause(since, until)

  const result = await pool.query<{
    total_paid: string
    outstanding_balance: string
    average_fee: string
    record_count: string
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_paid,
       COALESCE(SUM(CASE WHEN payment_status = 'unpaid' THEN total_amount ELSE 0 END), 0) as outstanding_balance,
       COALESCE(AVG(total_amount), 0) as average_fee,
       COUNT(*)::text as record_count
     FROM billings
     WHERE tenant_id = $1 ${clause}`,
    [tenantId, ...params],
  )

  const row = result.rows[0]
  return {
    totalPaid: Number.parseFloat(row.total_paid),
    outstandingBalance: Number.parseFloat(row.outstanding_balance),
    averageFee: Number.parseFloat(row.average_fee),
    recordCount: Number.parseInt(row.record_count, 10),
  }
}

// ---------------------------------------------------------------------------
// Appointment Stats
// ---------------------------------------------------------------------------

export async function getAppointmentStats(
  pool: DbPool,
  tenantId: string,
  since?: string,
  until?: string,
): Promise<AppointmentStats> {
  const { clause, params } = dateWhereClause(since, until)

  const result = await pool.query<{
    total: string
    completed: string
    cancelled: string
  }>(
    `SELECT
       COUNT(*)::text as total,
       COUNT(*) FILTER (WHERE status = 'completed')::text as completed,
       COUNT(*) FILTER (WHERE status = 'cancelled')::text as cancelled
     FROM appointments
     WHERE tenant_id = $1 ${clause}`,
    [tenantId, ...params],
  )

  const row = result.rows[0]
  const total = Number.parseInt(row.total, 10)
  const completed = Number.parseInt(row.completed, 10)
  const cancelled = Number.parseInt(row.cancelled, 10)

  return {
    total,
    completed,
    cancelled,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
  }
}

// ---------------------------------------------------------------------------
// New Patient Count
// ---------------------------------------------------------------------------

export async function getNewPatientCount(
  pool: DbPool,
  tenantId: string,
  since?: string,
  until?: string,
): Promise<number> {
  const { clause, params } = dateWhereClause(since, until)

  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text as count
     FROM patients
     WHERE tenant_id = $1 ${clause}`,
    [tenantId, ...params],
  )

  return Number.parseInt(result.rows[0].count, 10)
}

// ---------------------------------------------------------------------------
// Doctor Performance
// ---------------------------------------------------------------------------

export async function getDoctorPerformance(
  pool: DbPool,
  tenantId: string,
  since?: string,
  until?: string,
): Promise<DoctorPerformance[]> {
  const { clause, params } = dateWhereClause(since, until)

  const result = await pool.query<{
    doctor_id: string
    total: string
    completed: string
  }>(
    `SELECT
       doctor_id,
       COUNT(*)::text as total,
       COUNT(*) FILTER (WHERE status = 'completed')::text as completed
     FROM appointments
     WHERE tenant_id = $1 ${clause}
     GROUP BY doctor_id
     ORDER BY total DESC`,
    [tenantId, ...params],
  )

  return result.rows.map((row) => {
    const total = Number.parseInt(row.total, 10)
    const completed = Number.parseInt(row.completed, 10)
    return {
      doctorId: row.doctor_id,
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  })
}

// ---------------------------------------------------------------------------
// Status Distribution (for donut chart)
// ---------------------------------------------------------------------------

export async function getStatusDistribution(
  pool: DbPool,
  tenantId: string,
  since?: string,
  until?: string,
): Promise<StatusDistribution> {
  const { clause, params } = dateWhereClause(since, until)

  const result = await pool.query<{
    waiting: string
    in_consultation: string
    completed: string
    cancelled: string
  }>(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'waiting')::text as waiting,
       COUNT(*) FILTER (WHERE status = 'in_consultation')::text as in_consultation,
       COUNT(*) FILTER (WHERE status = 'completed')::text as completed,
       COUNT(*) FILTER (WHERE status = 'cancelled')::text as cancelled
     FROM appointments
     WHERE tenant_id = $1 ${clause}`,
    [tenantId, ...params],
  )

  const row = result.rows[0]
  return {
    waiting: Number.parseInt(row.waiting, 10),
    inConsultation: Number.parseInt(row.in_consultation, 10),
    completed: Number.parseInt(row.completed, 10),
    cancelled: Number.parseInt(row.cancelled, 10),
  }
}

// ---------------------------------------------------------------------------
// Revenue Over Time (for line/area chart)
// ---------------------------------------------------------------------------

export async function getRevenueOverTime(
  pool: DbPool,
  tenantId: string,
  since?: string,
  until?: string,
): Promise<RevenueOverTimePoint[]> {
  const { clause, params } = dateWhereClause(since, until)

  const result = await pool.query<{
    date: string
    paid_amount: string
    outstanding_amount: string
  }>(
    `SELECT
       created_at::date::text as date,
       COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) as paid_amount,
       COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'unpaid'), 0) as outstanding_amount
     FROM billings
     WHERE tenant_id = $1 ${clause}
     GROUP BY created_at::date
     ORDER BY date ASC`,
    [tenantId, ...params],
  )

  return result.rows.map((row) => ({
    date: row.date,
    paid: Number.parseFloat(row.paid_amount),
    outstanding: Number.parseFloat(row.outstanding_amount),
  }))
}

// ---------------------------------------------------------------------------
// Appointments Per Doctor (for bar chart)
// ---------------------------------------------------------------------------

export async function getAppointmentsPerDoctorOverTime(
  pool: DbPool,
  tenantId: string,
  since?: string,
  until?: string,
): Promise<AppointmentsPerDoctorPoint[]> {
  const { clause, params } = dateWhereClause(since, until)

  const result = await pool.query<{
    doctor_id: string
    count: string
  }>(
    `SELECT
       doctor_id,
       COUNT(*)::text as count
     FROM appointments
     WHERE tenant_id = $1 ${clause}
     GROUP BY doctor_id
     ORDER BY count DESC`,
    [tenantId, ...params],
  )

  return result.rows.map((row) => ({
    doctorId: row.doctor_id,
    count: Number.parseInt(row.count, 10),
  }))
}

// ---------------------------------------------------------------------------
// Recent billings with patient/doctor info (for revenue table)
// ---------------------------------------------------------------------------

export async function getBillingsForAdmin(
  pool: DbPool,
  tenantId: string,
  since?: string,
  until?: string,
): Promise<
  Array<{
    billing_id: string
    total_amount: string
    payment_status: string
    payment_method: string | null
    paid_at: string | null
    created_at: string
    appointment_queue_number: number
    appointment_type: string
    patient_name: string
    doctor_name: string
  }>
> {
  const { clause, params } = dateWhereClause(since, until)
  // Replace bare created_at refs with b.created_at for the join context
  const billingsClause = clause.replace(/created_at/g, "b.created_at")

  const result = await pool.query(
    `SELECT
       b.id as billing_id,
       b.total_amount::text,
       b.payment_status,
       b.payment_method,
       b.paid_at,
       b.created_at,
       a.queue_number as appointment_queue_number,
       a.type as appointment_type,
       p.full_name as patient_name,
       u.full_name as doctor_name
     FROM billings b
     JOIN appointments a ON a.id = b.appointment_id AND a.tenant_id = b.tenant_id
     JOIN patients p ON p.id = a.patient_id AND p.tenant_id = b.tenant_id
     JOIN users u ON u.id = a.doctor_id
     WHERE b.tenant_id = $1 ${billingsClause}
     ORDER BY b.created_at DESC
     LIMIT 200`,
    [tenantId, ...params],
  )
  return result.rows
}