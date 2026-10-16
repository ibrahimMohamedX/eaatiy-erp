"use server"

// ============================================================================
// Super Admin Action: Get Tenant Detail — per-clinic drill-down
// ============================================================================
// For one clinic, returns the Identity picture (users, license state) and
// LIVE operational stats from that clinic's own tenant DB (staff, patients,
// appointments, revenue, expenses, payroll). This is the "معلومات كل عيادة
// بالتفصيل وتقدمها وحالتها" view.
// ============================================================================

import { Pool } from "pg"
import { getIdentityPool } from "@/lib/db/connection"
import { isSuperAdminAuthed } from "@/lib/auth/super-admin"
import type { IdentityTenant } from "@/lib/db/repositories/identity/tenants"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TenantDetailUserRow {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export interface TenantDetailStats {
  staffCount: number
  patientCount: number
  appointmentCount: number
  appointmentsToday: number
  completedTotal: number
  revenuePaid: number
  revenueOutstanding: number
  expensesTotal: number
  payrollPending: number
}

export interface TenantDetailData {
  tenant: IdentityTenant
  users: TenantDetailUserRow[]
  userCount: number
  stats: TenantDetailStats
  license: {
    installationId: string
    highestIssueSequence: number
    active: boolean
  } | null
}

export type TenantDetailResult =
  | { success: true; data: TenantDetailData }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function getTenantDetail(tenantId: string): Promise<TenantDetailResult> {
  if (!(await isSuperAdminAuthed())) {
    return { success: false, error: "Unauthorized" }
  }

  const identityPool = getIdentityPool()

  try {
    // 1. Identity picture
    const tenantResult = await identityPool.query<IdentityTenant>(
      `SELECT * FROM tenants WHERE id = $1`,
      [tenantId],
    )
    const tenant = tenantResult.rows[0]
    if (!tenant) {
      return { success: false, error: "Tenant not found" }
    }

    const [usersResult, licenseResult] = await Promise.all([
      identityPool.query<TenantDetailUserRow>(
        `SELECT id, full_name, email, role, is_active
         FROM users WHERE tenant_id = $1 ORDER BY role, full_name`,
        [tenantId],
      ),
      identityPool.query<{
        installation_id: string
        highest_issue_sequence: number
        locked_out: boolean
      }>(
        `SELECT installation_id, highest_issue_sequence, locked_out
         FROM license_state WHERE tenant_id = $1`,
        [tenantId],
      ),
    ])

    // 2. Live stats from the tenant's own database (only if it exists)
    const stats: TenantDetailStats = {
      staffCount: 0,
      patientCount: 0,
      appointmentCount: 0,
      appointmentsToday: 0,
      completedTotal: 0,
      revenuePaid: 0,
      revenueOutstanding: 0,
      expensesTotal: 0,
      payrollPending: 0,
    }

    const prefix = process.env.TENANT_DATABASE_URL_PREFIX
    if (prefix) {
      const dbName = `tenant_${tenant.slug}`
      const exists = await identityPool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName],
      )
      if (exists.rows.length > 0) {
        const tenantPool = new Pool({
          connectionString: `${prefix}/${dbName}`,
          max: 2,
          idleTimeoutMillis: 10_000,
        })
        try {
          const [staff, patients, appts, revenue, expenses, payroll] = await Promise.all([
            tenantPool.query<{ count: string }>(
              `SELECT COUNT(*)::text AS count FROM staff_members WHERE tenant_id = $1 AND is_active`,
              [tenantId],
            ),
            tenantPool.query<{ count: string }>(
              `SELECT COUNT(*)::text AS count FROM patients WHERE tenant_id = $1`,
              [tenantId],
            ),
            tenantPool.query<{
              total: string
              today: string
              completed: string
            }>(
              `SELECT COUNT(*)::text AS total,
                      COUNT(*) FILTER (WHERE scheduled_start::date = (now() AT TIME ZONE 'Africa/Cairo')::date)::text AS today,
                      COUNT(*) FILTER (WHERE status = 'completed')::text AS completed
               FROM appointments WHERE tenant_id = $1`,
              [tenantId],
            ),
            tenantPool.query<{ paid: string; outstanding: string }>(
              `SELECT COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0)::text AS paid,
                      COALESCE(SUM(CASE WHEN payment_status = 'unpaid' THEN total_amount ELSE 0 END), 0)::text AS outstanding
               FROM billings WHERE tenant_id = $1`,
              [tenantId],
            ),
            tenantPool.query<{ total: string }>(
              `SELECT COALESCE(SUM(amount), 0)::text AS total FROM expenses WHERE tenant_id = $1`,
              [tenantId],
            ),
            tenantPool.query<{ pending: string }>(
              `SELECT COALESCE(SUM(base_amount + bonuses - deductions), 0)::text AS pending
               FROM salaries WHERE tenant_id = $1 AND status <> 'paid'`,
              [tenantId],
            ),
          ])

          stats.staffCount = Number.parseInt(staff.rows[0].count, 10)
          stats.patientCount = Number.parseInt(patients.rows[0].count, 10)
          stats.appointmentCount = Number.parseInt(appts.rows[0].total, 10)
          stats.appointmentsToday = Number.parseInt(appts.rows[0].today, 10)
          stats.completedTotal = Number.parseInt(appts.rows[0].completed, 10)
          stats.revenuePaid = Number.parseFloat(revenue.rows[0].paid) || 0
          stats.revenueOutstanding = Number.parseFloat(revenue.rows[0].outstanding) || 0
          stats.expensesTotal = Number.parseFloat(expenses.rows[0].total) || 0
          stats.payrollPending = Number.parseFloat(payroll.rows[0].pending) || 0
        } finally {
          await tenantPool.end()
        }
      }
    }

    const license = licenseResult.rows[0]
      ? {
          installationId: licenseResult.rows[0].installation_id,
          highestIssueSequence: licenseResult.rows[0].highest_issue_sequence,
          active: !licenseResult.rows[0].locked_out,
        }
      : null

    return {
      success: true,
      data: {
        tenant,
        users: usersResult.rows,
        userCount: usersResult.rows.length,
        stats,
        license,
      },
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch tenant detail"
    console.error("getTenantDetail error:", message)
    return { success: false, error: message }
  }
}
