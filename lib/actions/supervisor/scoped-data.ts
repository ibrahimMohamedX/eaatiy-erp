"use server"

// ============================================================================
// Supervisor Actions: scoped section data (read) + scoped expense create
// ============================================================================
// The admin grants each supervisor view/edit rights per section
// (supervisor_scopes). These actions enforce those grants server-side:
//   - getSupervisorSections          → which sections to render
//   - getSupervisorSectionData       → rows only if can_view
//   - supervisorCreateExpense        → only if can_edit('expenses')
// ============================================================================

import { getTenantPool, getIdentityPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import {
  getViewableSections,
  canEditSection,
  listSupervisorScopes,
  type SupervisorScopeRow,
} from "@/lib/db/repositories/supervisor-scopes"
import {
  listExpenses,
  getExpenseTotals,
  createExpense,
  type ExpenseRow,
  type ExpenseTotals,
} from "@/lib/db/repositories/expenses"
import type { ExpenseCategory } from "@/lib/db/schema/tenant/expenses"
import { listSalaries, type SalaryRow } from "@/lib/db/repositories/salaries"
import { listStaffMembers, type StaffMemberRow } from "@/lib/db/repositories/staff-members"
import { listShifts, type ShiftRow } from "@/lib/db/repositories/shifts"
import { listPatients } from "@/lib/db/repositories/patients"
import { getDoctorsByTenant } from "@/lib/db/repositories/users"
import type { Patient } from "@/lib/types"

// ---------------------------------------------------------------------------
// Shared appointment projection (queue + appointments sections)
// ---------------------------------------------------------------------------

export interface SupervisorAppointmentRow {
  id: string
  patientName: string
  doctorName: string
  status: string
  type: string
  scheduledStart: string
  queueNumber: number
}

async function fetchAppointments(
  pool: ReturnType<typeof getTenantPool>,
  identityPool: ReturnType<typeof getIdentityPool>,
  tenantId: string,
  todayOnly: boolean,
): Promise<SupervisorAppointmentRow[]> {
  const rowsResult = await pool.query<{
    id: string
    patient_name: string
    doctor_id: string
    status: string
    type: string
    scheduled_start: Date
    queue_number: number
  }>(
    `SELECT a.id, p.full_name AS patient_name, a.doctor_id, a.status, a.type,
            a.scheduled_start, a.queue_number
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.tenant_id = $1 ${todayOnly ? `AND a.scheduled_start::date = (now() AT TIME ZONE 'Africa/Cairo')::date` : ""}
     ORDER BY a.scheduled_start DESC
     LIMIT 100`,
    [tenantId],
  )
  const doctors = await getDoctorsByTenant(identityPool, tenantId)
  const doctorNames = new Map(doctors.map((d) => [d.id, d.full_name]))
  return rowsResult.rows.map((r) => ({
    id: r.id,
    patientName: r.patient_name,
    doctorName: doctorNames.get(r.doctor_id) ?? r.doctor_id,
    status: r.status,
    type: r.type,
    scheduledStart: new Date(r.scheduled_start).toISOString(),
    queueNumber: r.queue_number,
  }))
}

// ---------------------------------------------------------------------------
// Read: the supervisor's granted sections + full scope rows
// ---------------------------------------------------------------------------

export interface SupervisorSectionsData {
  sections: string[]
  scopes: SupervisorScopeRow[]
}

export async function getSupervisorSections(): Promise<
  { success: true; data: SupervisorSectionsData } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "supervisor") {
      return { success: false, error: "Insufficient privileges" }
    }
    const pool = getTenantPool(ctx.tenantSlug)
    const [sections, scopes] = await Promise.all([
      getViewableSections(pool, ctx.tenantId, ctx.userId),
      listSupervisorScopes(pool, ctx.tenantId, { userId: ctx.userId }),
    ])
    return { success: true, data: { sections, scopes } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch supervisor sections",
    }
  }
}

// ---------------------------------------------------------------------------
// Read: section payloads — each gated on can_view
// ---------------------------------------------------------------------------

export type SupervisorSectionPayload =
  | { section: "queue"; appointments: SupervisorAppointmentRow[] }
  | { section: "patients"; patients: Patient[] }
  | { section: "appointments"; appointments: SupervisorAppointmentRow[] }
  | { section: "expenses"; expenses: ExpenseRow[]; totals: ExpenseTotals }
  | { section: "salaries"; salaries: SalaryRow[] }
  | { section: "staff"; staff: StaffMemberRow[] }
  | { section: "shifts"; shifts: ShiftRow[] }

export async function getSupervisorSectionData(
  section: string,
): Promise<
  { success: true; data: SupervisorSectionPayload } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "supervisor") {
      return { success: false, error: "Insufficient privileges" }
    }
    const pool = getTenantPool(ctx.tenantSlug)
    const identityPool = getIdentityPool()

    // Enforce the admin-defined view grant
    const viewable = await getViewableSections(pool, ctx.tenantId, ctx.userId)
    if (!viewable.includes(section)) {
      return { success: false, error: "You do not have access to this section" }
    }

    switch (section) {
      case "queue": {
        const appointments = await fetchAppointments(pool, identityPool, ctx.tenantId, true)
        return { success: true, data: { section, appointments } }
      }
      case "appointments": {
        const appointments = await fetchAppointments(pool, identityPool, ctx.tenantId, false)
        return { success: true, data: { section, appointments } }
      }
      case "patients": {
        const patients = await listPatients(pool, ctx.tenantId)
        return { success: true, data: { section, patients } }
      }
      case "expenses": {
        const [expenses, totals] = await Promise.all([
          listExpenses(pool, ctx.tenantId),
          getExpenseTotals(pool, ctx.tenantId),
        ])
        return { success: true, data: { section, expenses, totals } }
      }
      case "salaries": {
        const salaries = await listSalaries(pool, ctx.tenantId)
        return { success: true, data: { section, salaries } }
      }
      case "staff": {
        const staff = await listStaffMembers(pool, ctx.tenantId)
        return { success: true, data: { section, staff } }
      }
      case "shifts": {
        const shifts = await listShifts(pool, ctx.tenantId)
        return { success: true, data: { section, shifts } }
      }
      default:
        return { success: false, error: "Unknown section" }
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch section data",
    }
  }
}

// ---------------------------------------------------------------------------
// Edit: scoped expense creation (only when admin granted can_edit)
// ---------------------------------------------------------------------------

export interface SupervisorExpenseInput {
  category: ExpenseCategory
  description: string
  amount: number
  expense_date: string
}

export async function supervisorCreateExpense(
  input: SupervisorExpenseInput,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "supervisor") {
      return { success: false, error: "Insufficient privileges" }
    }
    if (!input.description.trim()) {
      return { success: false, error: "Description is required" }
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { success: false, error: "Amount must be a positive number" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const allowed = await canEditSection(pool, ctx.tenantId, ctx.userId, "expenses")
    if (!allowed) {
      return { success: false, error: "You do not have edit rights on expenses" }
    }

    await createExpense(
      pool,
      ctx.tenantId,
      {
        category: input.category,
        description: input.description.trim(),
        amount: input.amount,
        expense_date: input.expense_date,
      },
      ctx.userId,
    )
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create expense",
    }
  }
}
