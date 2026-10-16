"use server"

// ============================================================================
// Admin Action: getDashboardData — Phase 2F
// ============================================================================
// Aggregates KPI and chart data for the admin overview + doctors tabs.
// ============================================================================

import { getTenantPool, getIdentityPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import {
  type RevenueSummary,
  type AppointmentStats,
  type StatusDistribution,
  type RevenueOverTimePoint,
  type AppointmentsPerDoctorPoint,
  type DoctorPerformance,
} from "@/lib/db/repositories/admin-kpis"
import {
  getRevenueSummary,
  getAppointmentStats,
  getNewPatientCount,
  getStatusDistribution,
  getRevenueOverTime,
  getAppointmentsPerDoctorOverTime,
  getDoctorPerformance,
} from "@/lib/db/repositories/admin-kpis"

export interface DashboardData {
  revenueSummary: RevenueSummary
  appointmentStats: AppointmentStats
  newPatients: number
  statusDistribution: StatusDistribution
  revenueOverTime: RevenueOverTimePoint[]
  appointmentsPerDoctor: AppointmentsPerDoctorPoint[]
  doctorPerformance: DoctorPerformanceWithNames[]
}

export interface DoctorPerformanceWithNames extends DoctorPerformance {
  doctorName: string
  doctorEmail: string
}

export async function getDashboardData(
  since?: string,
  until?: string,
): Promise<{ success: true; data: DashboardData } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    const [
      revenueSummary,
      appointmentStats,
      newPatients,
      statusDistribution,
      revenueOverTime,
      appointmentsPerDoctor,
      doctorPerformance,
    ] = await Promise.all([
      getRevenueSummary(pool, ctx.tenantId, since, until),
      getAppointmentStats(pool, ctx.tenantId, since, until),
      getNewPatientCount(pool, ctx.tenantId, since, until),
      getStatusDistribution(pool, ctx.tenantId, since, until),
      getRevenueOverTime(pool, ctx.tenantId, since, until),
      getAppointmentsPerDoctorOverTime(pool, ctx.tenantId, since, until),
      getDoctorPerformance(pool, ctx.tenantId, since, until),
    ])

    // Resolve doctor names from the Identity DB (tenant DBs have no users table)
    const doctorIds = [...new Set(doctorPerformance.map((d) => d.doctorId))]
    let doctorMap = new Map<string, { full_name: string; email: string }>()

    if (doctorIds.length > 0) {
      const identityPool = getIdentityPool()
      const doctorResult = await identityPool.query<{ id: string; full_name: string; email: string }>(
        `SELECT id, full_name, email FROM users WHERE id = ANY($1::uuid[])`,
        [doctorIds],
      )
      for (const row of doctorResult.rows) {
        doctorMap.set(row.id, { full_name: row.full_name, email: row.email })
      }
    }

    const doctorPerformanceWithNames: DoctorPerformanceWithNames[] = doctorPerformance.map((d) => {
      const user = doctorMap.get(d.doctorId)
      return {
        ...d,
        doctorName: user?.full_name ?? `Doctor ${d.doctorId.slice(0, 6)}…`,
        doctorEmail: user?.email ?? "",
      }
    })

    return {
      success: true,
      data: {
        revenueSummary,
        appointmentStats,
        newPatients,
        statusDistribution,
        revenueOverTime,
        appointmentsPerDoctor,
        doctorPerformance: doctorPerformanceWithNames,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch admin dashboard data",
    }
  }
}