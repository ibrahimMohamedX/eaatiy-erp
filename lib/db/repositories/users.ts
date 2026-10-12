// ============================================================================
// Repository: Users
// ============================================================================
// Operates on Identity DB. Queries the users table for staff lookup.
// Note: password_hash and authentication logic belong to the auth module (Phase 2D).
// ============================================================================

import type { DbPool } from "../db-client"
import type { User, UserRole } from "@/lib/types"

// ---------------------------------------------------------------------------
// Read — safe (never returns password_hash)
// ---------------------------------------------------------------------------

const SAFE_COLUMNS =
  "id, tenant_id, email, full_name, avatar_url, role, is_active, created_at"

export async function getActiveUsersByTenant(
  pool: DbPool,
  tenantId: string,
): Promise<User[]> {
  const result = await pool.query<User>(
    `SELECT id, tenant_id, email, full_name, avatar_url, role, is_active, created_at
     FROM users
     WHERE tenant_id = $1 AND is_active = true
     ORDER BY full_name`,
    [tenantId],
  )
  return result.rows
}

export async function getDoctorsByTenant(
  pool: DbPool,
  tenantId: string,
): Promise<User[]> {
  const result = await pool.query<User>(
    `SELECT id, tenant_id, email, full_name, avatar_url, role, is_active, created_at
     FROM users
     WHERE tenant_id = $1 AND role = 'doctor' AND is_active = true
     ORDER BY full_name`,
    [tenantId],
  )
  return result.rows
}

export async function getUserById(
  pool: DbPool,
  tenantId: string,
  userId: string,
): Promise<User | null> {
  const result = await pool.query<User>(
    `SELECT id, tenant_id, email, full_name, avatar_url, role, is_active, created_at
     FROM users
     WHERE id = $1 AND tenant_id = $2`,
    [userId, tenantId],
  )
  return result.rows[0] ?? null
}

/** Get doctor initials — mirrors static mock-data helper signature */
export function getDoctorInitials(user: User): string {
  const name = user.full_name.replace(/^Dr\.\s*/i, "")
  const parts = name.split(" ")
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export interface CreateUserInput {
  email: string
  password_hash: string
  full_name: string
  role: UserRole
  is_active?: boolean
}

export async function createUser(
  pool: DbPool,
  tenantId: string,
  input: CreateUserInput,
): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, tenant_id, email, full_name, avatar_url, role, is_active, created_at`,
    [
      tenantId,
      input.email,
      input.password_hash,
      input.full_name,
      input.role,
      input.is_active ?? true,
    ],
  )
  return result.rows[0]
}