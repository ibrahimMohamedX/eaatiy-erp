// ============================================================================
// Repository: Identity DB — Tenants
// ============================================================================
// Operates on the shared Identity DB's tenants table.
// Used by Super Admin flows (Phase 2C) for tenant lifecycle management:
// listing, provisioning, status changes.
// ============================================================================

import type { DbPool } from "../../db-client"
import type { Tenant } from "@/lib/types"

// ---------------------------------------------------------------------------
// Tenant status type (Identity DB — wider than the Tenant domain type)
// ---------------------------------------------------------------------------

export type TenantStatus = "active" | "suspended" | "provisioning" | "revoked"

export interface IdentityTenant {
  id: string // UUID
  name: string
  slug: string
  address_line_1: string
  address_line_2: string | null
  city: string
  phone: string
  logo_url: string | null
  subscription_tier: "trial" | "basic" | "premium"
  status: TenantStatus
  created_at: string // ISO 8601
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getAllTenants(pool: DbPool): Promise<IdentityTenant[]> {
  const result = await pool.query<IdentityTenant>(
    `SELECT * FROM tenants ORDER BY created_at DESC`,
  )
  return result.rows
}

export async function getTenantBySlug(
  pool: DbPool,
  slug: string,
): Promise<IdentityTenant | null> {
  const result = await pool.query<IdentityTenant>(
    `SELECT * FROM tenants WHERE slug = $1`,
    [slug],
  )
  return result.rows[0] ?? null
}

export async function getTenantById(
  pool: DbPool,
  tenantId: string,
): Promise<IdentityTenant | null> {
  const result = await pool.query<IdentityTenant>(
    `SELECT * FROM tenants WHERE id = $1`,
    [tenantId],
  )
  return result.rows[0] ?? null
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateTenantInput {
  name: string
  slug: string
  address_line_1: string
  city: string
  phone: string
  subscription_tier: "trial" | "basic" | "premium"
  address_line_2?: string
  logo_url?: string
}

export async function createTenant(
  pool: DbPool,
  input: CreateTenantInput,
): Promise<IdentityTenant> {
  const result = await pool.query<IdentityTenant>(
    `INSERT INTO tenants (
       name, slug, address_line_1, address_line_2, city, phone,
       subscription_tier, status, logo_url
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'provisioning', $8)
     RETURNING *`,
    [
      input.name,
      input.slug,
      input.address_line_1,
      input.address_line_2 ?? null,
      input.city,
      input.phone,
      input.subscription_tier,
      input.logo_url ?? null,
    ],
  )
  return result.rows[0]
}

// ---------------------------------------------------------------------------
// Update — status transitions
// ---------------------------------------------------------------------------

export type TenantStatusTransition = "activate" | "suspend" | "revoke"

export async function updateTenantStatus(
  pool: DbPool,
  tenantId: string,
  transition: TenantStatusTransition,
): Promise<IdentityTenant | null> {
  const statusMap: Record<TenantStatusTransition, TenantStatus> = {
    activate: "active",
    suspend: "suspended",
    revoke: "revoked",
  }
  const newStatus = statusMap[transition]

  const result = await pool.query<IdentityTenant>(
    `UPDATE tenants SET status = $2 WHERE id = $1 RETURNING *`,
    [tenantId, newStatus],
  )
  return result.rows[0] ?? null
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteTenant(
  pool: DbPool,
  tenantId: string,
): Promise<IdentityTenant | null> {
  const result = await pool.query<IdentityTenant>(
    `DELETE FROM tenants WHERE id = $1 RETURNING *`,
    [tenantId],
  )
  return result.rows[0] ?? null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Validates that a slug is URL-safe and not already taken.
 * Returns null if valid, or an error message string if invalid.
 */
export async function validateTenantSlug(
  pool: DbPool,
  slug: string,
): Promise<string | null> {
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) || slug.length < 3 || slug.length > 63) {
    return "Slug must be 3–63 lowercase alphanumeric characters or hyphens, cannot start or end with a hyphen."
  }
  const existing = await getTenantBySlug(pool, slug)
  if (existing) {
    return `A tenant with slug "${slug}" already exists.`
  }
  return null
}