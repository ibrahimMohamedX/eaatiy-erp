"use server"

// ============================================================================
// Doctor Action: getPatientData — Phase 2E
// ============================================================================
// Fetches enriched patient context: patient + appointment + medical record +
// billing + past encounters + prescriptions. Called when doctor selects a
// queue item.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { getPatientById } from "@/lib/db/repositories/patients"
import { getAppointmentById, getPatientHistory } from "@/lib/db/repositories/appointments"
import { getMedicalRecordByAppointment } from "@/lib/db/repositories/medical-records"
import { getBillingByAppointment } from "@/lib/db/repositories/billings"
import { getPrescriptionByMedicalRecord } from "@/lib/db/repositories/prescriptions"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Patient, Appointment, MedicalRecord, Billing, Prescription } from "@/lib/types"

export interface PatientData {
  patient: Patient
  appointment: Appointment
  medicalRecord: MedicalRecord | null
  billing: Billing | null
  prescription: Prescription | null
  history: Appointment[]
}

export async function getPatientData(
  appointmentId: string,
): Promise<{ success: true; data: PatientData } | { success: false; error: string }> {
  try {
    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    const pool = getTenantPool(ctx.tenantSlug)

    // 1. Get the appointment
    const appointment = await getAppointmentById(pool, ctx.tenantId, appointmentId)
    if (!appointment) {
      return { success: false, error: "Appointment not found" }
    }

    // 2. Get the patient (depends on appointment.patient_id)
    const patient = await getPatientById(pool, ctx.tenantId, appointment.patient_id)
    if (!patient) {
      return { success: false, error: "Patient not found" }
    }

    // 3+4+6. Run medical record, billing, and history in parallel (all independent)
    const [medicalRecord, billing, history] = await Promise.all([
      getMedicalRecordByAppointment(pool, ctx.tenantId, appointmentId),
      getBillingByAppointment(pool, ctx.tenantId, appointmentId),
      getPatientHistory(pool, ctx.tenantId, patient.id),
    ])

    // 5. Get prescription — depends on medicalRecord being present
    let prescription: Prescription | null = null
    if (medicalRecord) {
      prescription = await getPrescriptionByMedicalRecord(pool, ctx.tenantId, medicalRecord.id)
    }

    return {
      success: true,
      data: { patient, appointment, medicalRecord, billing, prescription, history },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch patient data",
    }
  }
}