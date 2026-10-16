"use server"

// ============================================================================
// Admin Actions: Staff Accounts (Identity users) — full CRUD
// ============================================================================
// Admin creates and manages login accounts for clinic staff: doctors,
// receptionists and supervisors. Non-login staff (cleaners, security) are
// managed in staff_members (see manage-staff.ts) — accounts are only for
// people who sign in.
// ============================================================================

import { randomUUID } from "node:crypto"
import { hashSync } from "bcryptjs"
import { getTenantPool, getIdentityPool } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/auth/server-context"
import { getUsersByTenant, setUserActive, type IdentityUser } from "@/lib/db/repositories/identity/users"
import { deleteAllScopesForUser } from "@/lib/db/repositories/supervisor-scopes"

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface AccountRow {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export type AccountActionResult =
  | { success: true; data: AccountRow }
  | { success: false; error: string }

const BCRYPT_ROUNDS = 12
const MANAGED_ROLES = ["doctor", "receptionist", "supervisor"] as const
type ManagedRole = (typeof MANAGED_ROLES)[number]

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getAccountsData(): Promise<
  { success: true; data: AccountRow[] } | { success: false; error: string }
> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const identityPool = getIdentityPool()
    const users = await getUsersByTenant(identityPool, ctx.tenantId)
    const rows: AccountRow[] = users.map((u: IdentityUser) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      is_active: u.is_active,
      created_at: u.created_at,
    }))
    return { success: true, data: rows }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch accounts",
    }
  }
}

// ---------------------------------------------------------------------------
// Create (identity user + rbac_roles row + optional staff_members link)
// ---------------------------------------------------------------------------

export interface CreateAccountInput {
  email: string
  full_name: string
  role: ManagedRole
  password: string
  /** optionally also create a staff_members row for shifts/salary */
  create_staff_record?: boolean
  monthly_salary?: number
}

export async function createAccount(
  input: CreateAccountInput,
): Promise<AccountActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    const email = input.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Invalid email address" }
    }
    if (!input.full_name.trim()) {
      return { success: false, error: "Full name is required" }
    }
    if (!MANAGED_ROLES.find((r) => r === input.role)) {
      return { success: false, error: `Role must be one of: ${MANAGED_ROLES.join(", ")}` }
    }
    if (input.password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" }
    }

    const identityPool = getIdentityPool()

    // Email uniqueness across the Identity DB
    const dupe = await identityPool.query(
      `SELECT 1 FROM users WHERE email = $1`,
      [email],
    )
    if (dupe.rows.length > 0) {
      return { success: false, error: "An account with this email already exists" }
    }

    const passwordHash = hashSync(input.password, BCRYPT_ROUNDS)
    const userId = randomUUID()

    await identityPool.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, ctx.tenantId, email, passwordHash, input.full_name.trim(), input.role],
    )
    await identityPool.query(
      `INSERT INTO rbac_roles (id, user_id, tenant_id, role)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), userId, ctx.tenantId, input.role],
    )

    // Optional staff registry record for shifts/salaries
    if (input.create_staff_record) {
      const pool = getTenantPool(ctx.tenantSlug)
      await pool.query(
        `INSERT INTO staff_members (tenant_id, user_id, full_name, staff_type, monthly_salary)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          ctx.tenantId,
          userId,
          input.full_name.trim(),
          input.role === "supervisor" ? "supervisor" : input.role,
          (input.monthly_salary ?? 0).toFixed(2),
        ],
      )
    }

    return {
      success: true,
      data: {
        id: userId,
        email,
        full_name: input.full_name.trim(),
        role: input.role,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create account",
    }
  }
}

// ---------------------------------------------------------------------------
// Update (name / role)
// ---------------------------------------------------------------------------

export async function updateAccount(
  userId: string,
  input: { full_name?: string; role?: ManagedRole },
): Promise<AccountActionResult> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    if (input.role !== undefined && !MANAGED_ROLES.find((r) => r === input.role)) {
      return { success: false, error: `Role must be one of: ${MANAGED_ROLES.join(", ")}` }
    }
    if (input.full_name !== undefined && !input.full_name.trim()) {
      return { success: false, error: "Full name is required" }
    }

    const identityPool = getIdentityPool()
    const tenantUsers = await getUsersByTenant(identityPool, ctx.tenantId)
    const existing = tenantUsers.find((u) => u.id === userId)
    if (!existing) return { success: false, error: "Account not found" }
    if (existing.role === "admin") {
      return { success: false, error: "Admin accounts are managed by the super admin" }
    }

    const result = await identityPool.query<{
      id: string
      email: string
      full_name: string
      role: string
      is_active: boolean
      created_at: Date
    }>(
      `UPDATE users
       SET full_name = COALESCE($3, full_name), role = COALESCE($4, role)
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, email, full_name, role, is_active, created_at`,
      [
        userId,
        ctx.tenantId,
        input.full_name?.trim() ?? null,
        input.role ?? null,
      ],
    )
    const row = result.rows[0]
    if (!row) return { success: false, error: "Account not found" }

    // keep rbac_roles in sync
    if (input.role !== undefined) {
      await identityPool.query(
        `UPDATE rbac_roles SET role = $3 WHERE user_id = $1 AND tenant_id = $2`,
        [userId, ctx.tenantId, input.role],
      )
      // demotion from supervisor clears their scope grants
      if (input.role !== "supervisor") {
        const pool = getTenantPool(ctx.tenantSlug)
        await deleteAllScopesForUser(pool, ctx.tenantId, userId)
      }
    }

    return {
      success: true,
      data: { ...row, created_at: row.created_at.toISOString() },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update account",
    }
  }
}

// ---------------------------------------------------------------------------
// Activate / deactivate
// ---------------------------------------------------------------------------

export async function setAccountActive(
  userId: string,
  isActive: boolean,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    if (userId === ctx.userId) {
      return { success: false, error: "You cannot deactivate your own account" }
    }

    const identityPool = getIdentityPool()
    const tenantUsers = await getUsersByTenant(identityPool, ctx.tenantId)
    const existing = tenantUsers.find((u) => u.id === userId)
    if (!existing) return { success: false, error: "Account not found" }
    if (existing.role === "admin") {
      return { success: false, error: "Admin accounts are managed by the super admin" }
    }

    const updated = await setUserActive(identityPool, userId, isActive)
    if (!updated) return { success: false, error: "Account not found" }
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update account",
    }
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteAccount(
  userId: string,
): Promise<{ success: true; deleted: true } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) return { success: false, error: "Unauthorized" }
    if (ctx.role !== "admin") {
      return { success: false, error: "Insufficient privileges" }
    }
    if (userId === ctx.userId) {
      return { success: false, error: "You cannot delete your own account" }
    }

    const identityPool = getIdentityPool()
    const tenantUsers = await getUsersByTenant(identityPool, ctx.tenantId)
    const existing = tenantUsers.find((u) => u.id === userId)
    if (!existing) return { success: false, error: "Account not found" }
    if (existing.role === "admin") {
      return { success: false, error: "Admin accounts are managed by the super admin" }
    }

    // Clean tenant-side references first
    const pool = getTenantPool(ctx.tenantSlug)
    await deleteAllScopesForUser(pool, ctx.tenantId, userId)
    await pool.query(
      `UPDATE staff_members SET user_id = NULL WHERE tenant_id = $1 AND user_id = $2`,
      [ctx.tenantId, userId],
    )

    // Identity-side: rbac_roles FK then the user row
    await identityPool.query(
      `DELETE FROM rbac_roles WHERE user_id = $1 AND tenant_id = $2`,
      [userId, ctx.tenantId],
    )
    await identityPool.query(`DELETE FROM users WHERE id = $1`, [userId])

    return { success: true, deleted: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete account",
    }
  }
}
