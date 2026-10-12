"use server"

// ============================================================================
// Admin Action: getAppointmentsData — Phase 2F
// ============================================================================
// Fetches appointments with patient/doctor info for the admin appointments tab.
// Supports date range filtering via `since` / `until` params.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { getTodayQueue, getAppointmentsByDateRange } from "@/lib/db/repositories/appointments"
import { getTenantContext } from "@/lib/auth/server-context"

export interface AppointmentRow {
  appointmentId: string
  queueNumber: number
  patientName: string
  patientDob: string
  doctorName: string
  doctorId: string
  scheduledStart: string
  type: string
  status: string
}

export async function getAppointmentsData(
  since?: string,
  until?: string,
): Promise<{ success: true; data: AppointmentRow[] } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    // If no date range specified, default to today's queue
    const appointments = since || until
      ? await getAppointmentsByDateRange(pool, ctx.tenantId, since, until)
      : await getTodayQueue(pool, ctx.tenantId)

    // Fetch all patients and doctors referenced by these appointments
    const patientIds = [...new Set(appointments.map((a) => a.patient_id))]
    const doctorIds = [...new Set(appointments.map((a) => a.doctor_id))]

    const [patientResult, doctorResult] = await Promise.all([
      patientIds.length > 0
        ? pool.query<{ id: string; full_name: string; date_of_birth: string }>(
            `SELECT id, full_name, date_of_birth FROM patients
             WHERE id = ANY($1::uuid[]) AND tenant_id = $2`,
            [patientIds, ctx.tenantId],
          )
        : Promise.resolve({ rows: [] }),
      doctorIds.length > 0
        ? pool.query<{ id: string; full_name: string }>(
            `SELECT id, full_name FROM users WHERE id = ANY($1::uuid[])`,
            [doctorIds],
          )
        : Promise.resolve({ rows: [] }),
    ])

    const patientMap = new Map(patientResult.rows.map((p) => [p.id, p]))
    const doctorMap = new Map(doctorResult.rows.map((d) => [d.id, d]))

    const data: AppointmentRow[] = appointments.map((apt) => {
      const patient = patientMap.get(apt.patient_id)
      const doctor = doctorMap.get(apt.doctor_id)
      return {
        appointmentId: apt.id,
        queueNumber: apt.queue_number,
        patientName: patient?.full_name ?? "Unknown",
        patientDob: patient?.date_of_birth ?? "",
        doctorName: doctor?.full_name ?? "Unknown",
        doctorId: apt.doctor_id,
        scheduledStart: apt.scheduled_start,
        type: apt.type,
        status: apt.status,
      }
    })

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch appointments data",
    }
  }
}