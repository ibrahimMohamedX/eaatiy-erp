// ============================================================================
// Repository: Prescriptions
// ============================================================================
// Items stored as jsonb — an array of PrescriptionItem objects.
// ============================================================================

import type { DbPool } from "../db-client"
import type { Prescription, PrescriptionItem } from "@/lib/types"

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreatePrescriptionInput {
  medical_record_id: string
  patient_id: string
  doctor_id: string
  items: PrescriptionItem[]
}

export async function createPrescription(
  pool: DbPool,
  tenantId: string,
  input: CreatePrescriptionInput,
): Promise<Prescription> {
  const result = await pool.query<Prescription>(
    `INSERT INTO prescriptions (
       tenant_id, medical_record_id, patient_id, doctor_id, items
     ) VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING *`,
    [
      tenantId,
      input.medical_record_id,
      input.patient_id,
      input.doctor_id,
      JSON.stringify(input.items),
    ],
  )
  return result.rows[0]
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getPrescriptionByMedicalRecord(
  pool: DbPool,
  tenantId: string,
  medicalRecordId: string,
): Promise<Prescription | null> {
  const result = await pool.query<Prescription>(
    `SELECT * FROM prescriptions
     WHERE medical_record_id = $1 AND tenant_id = $2`,
    [medicalRecordId, tenantId],
  )
  return result.rows[0] ?? null
}

export async function getPrescriptionById(
  pool: DbPool,
  tenantId: string,
  prescriptionId: string,
): Promise<Prescription | null> {
  const result = await pool.query<Prescription>(
    `SELECT * FROM prescriptions WHERE id = $1 AND tenant_id = $2`,
    [prescriptionId, tenantId],
  )
  return result.rows[0] ?? null
}

export async function getPatientPrescriptions(
  pool: DbPool,
  tenantId: string,
  patientId: string,
): Promise<Prescription[]> {
  const result = await pool.query<Prescription>(
    `SELECT * FROM prescriptions
     WHERE patient_id = $1 AND tenant_id = $2
     ORDER BY created_at DESC`,
    [patientId, tenantId],
  )
  return result.rows
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updatePrescriptionItems(
  pool: DbPool,
  tenantId: string,
  prescriptionId: string,
  items: PrescriptionItem[],
): Promise<Prescription | null> {
  const result = await pool.query<Prescription>(
    `UPDATE prescriptions
     SET items = $3::jsonb
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [prescriptionId, tenantId, JSON.stringify(items)],
  )
  return result.rows[0] ?? null
}