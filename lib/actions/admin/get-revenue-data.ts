"use server"

// ============================================================================
// Admin Action: getRevenueData — Phase 2F
// ============================================================================
// Fetches revenue summary + detailed billing records with patient/doctor info
// for the revenue tab.
// ============================================================================

import { getTenantPool, getIdentityPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import { getDoctorsByTenant } from "@/lib/db/repositories/users"
import {
  getRevenueSummary,
  getBillingsForAdmin,
  type RevenueSummary,
} from "@/lib/db/repositories/admin-kpis"

export interface RevenueBillingRow {
  billingId: string
  totalAmount: string
  paymentStatus: string
  paymentMethod: string | null
  paidAt: string | null
  createdAt: string
  queueNumber: number
  appointmentType: string
  patientName: string
  doctorName: string
}

export interface RevenueTabData {
  summary: RevenueSummary
  rows: RevenueBillingRow[]
}

export async function getRevenueData(
  since?: string,
  until?: string,
): Promise<{ success: true; data: RevenueTabData } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    // Doctor names live in the Identity DB (tenant DBs have no users table)
    const identityPool = getIdentityPool()
    const [summary, billingRows, doctors] = await Promise.all([
      getRevenueSummary(pool, ctx.tenantId, since, until),
      getBillingsForAdmin(pool, ctx.tenantId, since, until),
      getDoctorsByTenant(identityPool, ctx.tenantId),
    ])

    const doctorNameById = new Map(doctors.map((d) => [d.id, d.full_name]))

    const rows: RevenueBillingRow[] = billingRows.map((r) => ({
      billingId: r.billing_id,
      totalAmount: r.total_amount,
      paymentStatus: r.payment_status,
      paymentMethod: r.payment_method,
      paidAt: r.paid_at,
      createdAt: r.created_at,
      queueNumber: r.appointment_queue_number,
      appointmentType: r.appointment_type,
      patientName: r.patient_name,
      doctorName: doctorNameById.get(r.doctor_id) ?? r.doctor_id,
    }))

    return { success: true, data: { summary, rows } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch revenue data",
    }
  }
}