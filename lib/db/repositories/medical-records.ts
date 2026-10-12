// ============================================================================
// Repository: Medical Records
// ============================================================================
// One record per appointment. Vitals stored as a jsonb column.
// Supports draft/save flow via the `is_draft` flag.
// ============================================================================

import type { DbPool } from "../db-client"
import type { MedicalRecord, Vitals } from "@/lib/types"

// ---------------------------------------------------------------------------
// Create / Upsert
// ---------------------------------------------------------------------------

export interface CreateMedicalRecordInput {
  appointment_id: string
  patient_id: string
  doctor_id: string
  chief_complaint: string
  diagnosis: string
  notes?: string
  vitals?: Vitals
  is_draft?: boolean
}

export async function createMedicalRecord(
  pool: DbPool,
  tenantId: string,
  input: CreateMedicalRecordInput,
): Promise<MedicalRecord> {
  const result = await pool.query<MedicalRecord>(
    `INSERT INTO medical_records (
       tenant_id, appointment_id, patient_id, doctor_id,
       chief_complaint, diagnosis, notes, vitals, is_draft
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
     RETURNING *`,
    [
      tenantId,
      input.appointment_id,
      input.patient_id,
      input.doctor_id,
      input.chief_complaint,
      input.diagnosis,
      input.notes ?? null,
      JSON.stringify(input.vitals ?? {}),
      input.is_draft ?? false,
    ],
  )
  return result.rows[0]
}

export async function upsertMedicalRecord(
  pool: DbPool,
  tenantId: string,
  input: CreateMedicalRecordInput,
): Promise<MedicalRecord> {
  const result = await pool.query<MedicalRecord>(
    `INSERT INTO medical_records (
       tenant_id, appointment_id, patient_id, doctor_id,
       chief_complaint, diagnosis, notes, vitals, is_draft
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
     ON CONFLICT (appointment_id) DO UPDATE SET
       chief_complaint = EXCLUDED.chief_complaint,
       diagnosis = EXCLUDED.diagnosis,
       notes = EXCLUDED.notes,
       vitals = EXCLUDED.vitals,
       is_draft = EXCLUDED.is_draft
     RETURNING *`,
    [
      tenantId,
      input.appointment_id,
      input.patient_id,
      input.doctor_id,
      input.chief_complaint,
      input.diagnosis,
      input.notes ?? null,
      JSON.stringify(input.vitals ?? {}),
      input.is_draft ?? false,
    ],
  )
  return result.rows[0]
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getMedicalRecordByAppointment(
  pool: DbPool,
  tenantId: string,
  appointmentId: string,
): Promise<MedicalRecord | null> {
  const result = await pool.query<MedicalRecord>(
    `SELECT * FROM medical_records
     WHERE appointment_id = $1 AND tenant_id = $2`,
    [appointmentId, tenantId],
  )
  return result.rows[0] ?? null
}

export async function getMedicalRecordById(
  pool: DbPool,
  tenantId: string,
  recordId: string,
): Promise<MedicalRecord | null> {
  const result = await pool.query<MedicalRecord>(
    `SELECT * FROM medical_records WHERE id = $1 AND tenant_id = $2`,
    [recordId, tenantId],
  )
  return result.rows[0] ?? null
}

export async function getPatientMedicalRecords(
  pool: DbPool,
  tenantId: string,
  patientId: string,
): Promise<MedicalRecord[]> {
  const result = await pool.query<MedicalRecord>(
    `SELECT * FROM medical_records
     WHERE patient_id = $1 AND tenant_id = $2
     ORDER BY created_at DESC`,
    [patientId, tenantId],
  )
  return result.rows
}

// ---------------------------------------------------------------------------
// Update (finalize draft)
// ---------------------------------------------------------------------------

export async function finalizeMedicalRecord(
  pool: DbPool,
  tenantId: string,
  recordId: string,
): Promise<MedicalRecord | null> {
  const result = await pool.query<MedicalRecord>(
    `UPDATE medical_records
     SET is_draft = false
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [recordId, tenantId],
  )
  return result.rows[0] ?? null
}