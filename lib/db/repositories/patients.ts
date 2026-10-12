// ============================================================================
// Repository: Patients
// ============================================================================
// Exports typed (pool: Pool, tenantId: string, ...args) => Promise<T> functions.
// Every query includes WHERE tenant_id = $tenantId — the P0 security invariant.
// ============================================================================

import type { DbPool } from "../db-client"
import type { Patient } from "@/lib/types"

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreatePatientInput {
  full_name: string
  date_of_birth: string // ISO 8601 date
  gender: "male" | "female" | "other"
  phone: string
  email?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  blood_group?: string
  allergies?: string
}

export async function createPatient(
  pool: DbPool,
  tenantId: string,
  input: CreatePatientInput,
): Promise<Patient> {
  const result = await pool.query<Patient>(
    `INSERT INTO patients (
       tenant_id, full_name, date_of_birth, gender, phone, email, address,
       emergency_contact_name, emergency_contact_phone, blood_group, allergies
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
     ) RETURNING *`,
    [
      tenantId,
      input.full_name,
      input.date_of_birth,
      input.gender,
      input.phone,
      input.email ?? null,
      input.address ?? null,
      input.emergency_contact_name ?? null,
      input.emergency_contact_phone ?? null,
      input.blood_group ?? null,
      input.allergies ?? null,
    ],
  )
  return result.rows[0]
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getPatientById(
  pool: DbPool,
  tenantId: string,
  patientId: string,
): Promise<Patient | null> {
  const result = await pool.query<Patient>(
    `SELECT * FROM patients WHERE id = $1 AND tenant_id = $2`,
    [patientId, tenantId],
  )
  return result.rows[0] ?? null
}

export async function searchPatients(
  pool: DbPool,
  tenantId: string,
  query: string,
): Promise<Patient[]> {
  // Fuzzy search by name or phone — minimum 2 characters enforced at caller level
  if (!query || query.length < 2) return []
  const pattern = `%${query}%`
  const result = await pool.query<Patient>(
    `SELECT * FROM patients
     WHERE tenant_id = $1
       AND (full_name ILIKE $2 OR phone ILIKE $3)
     ORDER BY full_name
     LIMIT 50`,
    [tenantId, pattern, pattern],
  )
  return result.rows
}

export async function listPatients(
  pool: DbPool,
  tenantId: string,
  opts?: { limit?: number; offset?: number },
): Promise<Patient[]> {
  const limit = opts?.limit ?? 50
  const offset = opts?.offset ?? 0
  const result = await pool.query<Patient>(
    `SELECT * FROM patients WHERE tenant_id = $1 ORDER BY full_name LIMIT $2 OFFSET $3`,
    [tenantId, limit, offset],
  )
  return result.rows
}

export async function countPatients(
  pool: DbPool,
  tenantId: string,
): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM patients WHERE tenant_id = $1`,
    [tenantId],
  )
  return Number.parseInt(result.rows[0].count, 10)
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export interface UpdatePatientInput {
  full_name?: string
  date_of_birth?: string
  gender?: "male" | "female" | "other"
  phone?: string
  email?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  blood_group?: string
  allergies?: string
}

export async function updatePatient(
  pool: DbPool,
  tenantId: string,
  patientId: string,
  input: UpdatePatientInput,
): Promise<Patient | null> {
  // Build dynamic SET clause from non-undefined keys
  const fields = Object.entries(input).filter(
    ([, v]) => v !== undefined,
  ) as [keyof UpdatePatientInput, string][]
  if (fields.length === 0) return null

  const assignments = fields.map(([k], i) => `${k} = $${i + 3}`)
  const values = fields.map(([, v]) => v)

  const result = await pool.query<Patient>(
    `UPDATE patients
     SET ${assignments.join(", ")}, updated_at = NOW()
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [patientId, tenantId, ...values],
  )
  return result.rows[0] ?? null
}