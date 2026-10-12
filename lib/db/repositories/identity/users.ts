// ============================================================================
// Repository: Identity DB — Users
// ============================================================================
// Operates on the shared Identity DB's users table.
// Used by Super Admin (Phase 2C) and login (Phase 2D).
// ============================================================================

import type { DbPool } from "../../db-client"
import type { User, UserRole } from "@/lib/types"

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export interface IdentityUser {
  id: string // UUID
  tenant_id: string
  email: string
  password_hash: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string // ISO 8601
}

export async function getUserByEmail(
  pool: DbPool,
  email: string,
): Promise<IdentityUser | null> {
  const result = await pool.query<IdentityUser>(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  )
  return result.rows[0] ?? null
}

export async function getUserById(
  pool: DbPool,
  userId: string,
): Promise<IdentityUser | null> {
  const result = await pool.query<IdentityUser>(
    `SELECT * FROM users WHERE id = $1`,
    [userId],
  )
  return result.rows[0] ?? null
}

export async function getUsersByTenant(
  pool: DbPool,
  tenantId: string,
): Promise<IdentityUser[]> {
  const result = await pool.query<IdentityUser>(
    `SELECT * FROM users WHERE tenant_id = $1 ORDER BY full_name`,
    [tenantId],
  )
  return result.rows
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateIdentityUserInput {
  tenant_id: string
  email: string
  password_hash: string
  full_name: string
  role: UserRole
}

export async function createUser(
  pool: DbPool,
  input: CreateIdentityUserInput,
): Promise<IdentityUser> {
  const result = await pool.query<IdentityUser>(
    `INSERT INTO users (
       tenant_id, email, password_hash, full_name, role
     ) VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.tenant_id,
      input.email,
      input.password_hash,
      input.full_name,
      input.role,
    ],
  )
  return result.rows[0]
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateUserPassword(
  pool: DbPool,
  userId: string,
  newPasswordHash: string,
): Promise<IdentityUser | null> {
  const result = await pool.query<IdentityUser>(
    `UPDATE users SET password_hash = $2 WHERE id = $1 RETURNING *`,
    [userId, newPasswordHash],
  )
  return result.rows[0] ?? null
}

export async function setUserActive(
  pool: DbPool,
  userId: string,
  isActive: boolean,
): Promise<IdentityUser | null> {
  const result = await pool.query<IdentityUser>(
    `UPDATE users SET is_active = $2 WHERE id = $1 RETURNING *`,
    [userId, isActive],
  )
  return result.rows[0] ?? null
}