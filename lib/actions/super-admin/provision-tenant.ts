"use server"

// ============================================================================
// Server Action: Provision Tenant — Super Admin
// ============================================================================
// Provisions a new clinic tenant:
//   1. Validates slug uniqueness in Identity DB
//   2. Inserts tenant row (status = provisioning)
//   3. Creates a PostgreSQL database: tenant_{slug}
//   4. Runs tenant schema migration (drizzle-kit push equivalent)
//   5. Seeds the admin user
//   6. Inserts license_state singleton
//   7. Updates tenant status to active
//   8. Logs the provisioning action
//
// The caller receives the tenant + admin credentials.
// ============================================================================

import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { hashSync } from "bcryptjs"
import { getIdentityPool } from "@/lib/db/connection"
import {
  createTenant,
  updateTenantStatus,
  validateTenantSlug,
  type IdentityTenant,
} from "@/lib/db/repositories/identity/tenants"
import { createUser, type CreateIdentityUserInput } from "@/lib/db/repositories/identity/users"
import { insertSuperAdminAudit } from "@/lib/db/repositories/identity/superadmin-audit"
import { isSuperAdminAuthed } from "@/lib/auth/super-admin"

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface ProvisionTenantInput {
  clinicName: string
  clinicSlug: string
  addressLine1: string
  city: string
  phone: string
  subscriptionTier: "trial" | "basic" | "premium"
  addressLine2?: string
  adminEmail: string
  adminFullName: string
  adminPassword: string
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

export interface ProvisionTenantSuccess {
  tenant: IdentityTenant
  adminUserId: string
  adminEmail: string
  installationId: string
}

export type ProvisionTenantResult =
  | { success: true; data: ProvisionTenantSuccess }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Tenant DDL — applied to each new tenant database
// ---------------------------------------------------------------------------

const TENANT_DDL = `
-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  blood_group VARCHAR(10),
  allergies TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL,
  queue_number INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  scheduled_start TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  last_called_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Medical Records
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  chief_complaint TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  notes TEXT,
  vitals JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  medical_record_id UUID NOT NULL REFERENCES medical_records(id),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Billings
CREATE TABLE IF NOT EXISTS billings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  payment_method VARCHAR(20),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  target_table VARCHAR(50) NOT NULL,
  target_row_id VARCHAR(100) NOT NULL,
  summary TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
` as const

// ---------------------------------------------------------------------------
// BCRYPT rounds for admin password
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 12

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function provisionTenant(
  input: ProvisionTenantInput,
): Promise<ProvisionTenantResult> {
  if (!(await isSuperAdminAuthed())) {
    return { success: false, error: "Unauthorized" }
  }
  const identityPool = getIdentityPool()

  // 1. Validate slug
  const slugError = await validateTenantSlug(identityPool, input.clinicSlug)
  if (slugError) {
    return { success: false, error: slugError }
  }

  // Generate IDs upfront
  const tenantId = randomUUID()
  const adminUserId = randomUUID()
  const installationId = randomUUID()

  try {
    // 2. Insert tenant row (status = provisioning)
    // We bypass createTenant's defaultRandom since we generate the ID ourselves
    await identityPool.query(
      `INSERT INTO tenants (id, name, slug, address_line_1, address_line_2, city, phone, subscription_tier, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'provisioning')`,
      [
        tenantId,
        input.clinicName,
        input.clinicSlug,
        input.addressLine1,
        input.addressLine2 ?? null,
        input.city,
        input.phone,
        input.subscriptionTier,
      ],
    )

    // 3. Create the tenant database
    const prefix = process.env.TENANT_DATABASE_URL_PREFIX
    if (!prefix) {
      return { success: false, error: "TENANT_DATABASE_URL_PREFIX is not set" }
    }

    const dbName = `tenant_${input.clinicSlug}`

    // Connect to the default postgres database to run CREATE DATABASE
    const serverPool = new Pool({
      connectionString: `${prefix}/postgres`,
      max: 1,
      idleTimeoutMillis: 10_000,
    })

    try {
      // Check if database already exists
      const exists = await serverPool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName],
      )
      if (exists.rows.length > 0) {
        // DB exists already — drop and recreate (shouldn't happen with proper slug validation)
        await serverPool.query(`DROP DATABASE IF EXISTS ${safeIdent(dbName)}`)
      }
      await serverPool.query(`CREATE DATABASE ${safeIdent(dbName)}`)
    } finally {
      await serverPool.end()
    }

    // 4. Apply tenant DDL to the new database
    const tenantPool = new Pool({
      connectionString: `${prefix}/${dbName}`,
      max: 3,
      idleTimeoutMillis: 30_000,
    })

    try {
      await tenantPool.query(TENANT_DDL)

      // 5. Seed the admin user (in Identity DB's users table, referencing this tenant)
      const passwordHash = hashSync(input.adminPassword, BCRYPT_ROUNDS)
      await createUser(identityPool, {
        tenant_id: tenantId,
        email: input.adminEmail,
        password_hash: passwordHash,
        full_name: input.adminFullName,
        role: "admin",
      })

      // Also insert rbac_roles row
      await identityPool.query(
        `INSERT INTO rbac_roles (id, user_id, tenant_id, role)
         VALUES ($1, $2, $3, 'admin')`,
        [randomUUID(), adminUserId, tenantId],
      )

      // 6. Insert license_state singleton
      await identityPool.query(
        `INSERT INTO license_state (id, tenant_id, installation_id, highest_issue_sequence)
         VALUES (1, $1, $2, 0)`,
        [tenantId, installationId],
      )

      // 7. Update tenant status to active
      await updateTenantStatus(identityPool, tenantId, "activate")

      // 8. Platform audit trail (never blocks the provisioning)
      try {
        await insertSuperAdminAudit(identityPool, {
          action: "insert",
          tenantId,
          targetTable: "tenants",
          targetRowId: tenantId,
          summary: `Provisioned tenant "${input.clinicName}" (${input.clinicSlug}) · admin ${input.adminEmail}`,
        })
      } catch (auditErr) {
        console.error("super-admin audit write failed:", auditErr)
      }
    } finally {
      await tenantPool.end()
    }

    // Fetch the final tenant record
    const tenantResult = await identityPool.query<IdentityTenant>(
      `SELECT * FROM tenants WHERE id = $1`,
      [tenantId],
    )

    return {
      success: true,
      data: {
        tenant: tenantResult.rows[0],
        adminUserId,
        adminEmail: input.adminEmail,
        installationId,
      },
    }
  } catch (error) {
    // On failure, attempt to clean up: set status to revoked so the tenant can be deleted
    try {
      await identityPool.query(
        `UPDATE tenants SET status = 'revoked' WHERE id = $1`,
        [tenantId],
      )
    } catch {
      // Best effort cleanup
    }

    const message =
      error instanceof Error ? error.message : "Failed to provision tenant"
    console.error("provisionTenant error:", message)
    return { success: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// SQL identifier sanitizer — prevents injection in CREATE DATABASE
// ---------------------------------------------------------------------------

/**
 * Sanitizes a PostgreSQL identifier (database name, table name, column name)
 * by wrapping it in double quotes and escaping embedded double quotes.
 * EXTREMELY important for CREATE DATABASE where parameterized queries don't work.
 */
function safeIdent(raw: string): string {
  // Only allow alphanumeric, underscore, and hyphen characters
  if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
    throw new Error(`Unsafe SQL identifier: ${JSON.stringify(raw)}`)
  }
  return `"${raw}"` // No escaping needed — regex guarantees no double-quotes
}