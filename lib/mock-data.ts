// ============================================================================
// Centralized Mock Data Store — Single Source of Truth
// ============================================================================
// All mock data keyed by tenant_id. In production this data comes from
// Supabase/PostgreSQL with RLS-enforced tenant isolation.
// ============================================================================

import type {
  Tenant,
  User,
  Patient,
  Appointment,
  MedicalRecord,
  Prescription,
  Billing,
  AuditLog,
} from "./types"

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------

const TENANT_ID = "t_northgate_01"

export const tenant: Tenant = {
  id: TENANT_ID,
  name: "Northgate Clinic",
  slug: "northgate",
  address_line_1: "142 Elm Street, Suite 5",
  city: "San Francisco, CA 94102",
  phone: "(555) 018-2245",
  subscription_tier: "premium",
  created_at: "2024-01-15T00:00:00Z",
}

// ---------------------------------------------------------------------------
// Users (Staff)
// ---------------------------------------------------------------------------

export const users: User[] = [
  {
    id: "u_receptionist_01",
    tenant_id: TENANT_ID,
    email: "helena.marsh@northgate.com",
    full_name: "Helena Marsh",
    role: "receptionist",
    is_active: true,
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "u_doctor_01",
    tenant_id: TENANT_ID,
    email: "sara.reyes@northgate.com",
    full_name: "Dr. Sara Reyes",
    role: "doctor",
    is_active: true,
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "u_doctor_02",
    tenant_id: TENANT_ID,
    email: "samuel.mensah@northgate.com",
    full_name: "Dr. Samuel Mensah",
    role: "doctor",
    is_active: true,
    created_at: "2024-02-15T00:00:00Z",
  },
  {
    id: "u_doctor_03",
    tenant_id: TENANT_ID,
    email: "amir.khan@northgate.com",
    full_name: "Dr. Amir Khan",
    role: "doctor",
    is_active: true,
    created_at: "2024-03-01T00:00:00Z",
  },
  {
    id: "u_doctor_04",
    tenant_id: TENANT_ID,
    email: "lena.osei@northgate.com",
    full_name: "Dr. Lena Osei",
    role: "doctor",
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    id: "u_admin_01",
    tenant_id: TENANT_ID,
    email: "amelia.monroe@northgate.com",
    full_name: "Amelia Monroe",
    role: "admin",
    is_active: true,
    created_at: "2024-01-15T00:00:00Z",
  },
]

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export const patients: Patient[] = [
  {
    id: "p_01",
    tenant_id: TENANT_ID,
    full_name: "Amara Okafor",
    date_of_birth: "1991-04-22",
    gender: "female",
    phone: "+1 (415) 555-0182",
    email: "amara.okafor@email.com",
    blood_group: "O+",
    allergies: "Penicillin",
    created_at: "2025-01-10T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "p_02",
    tenant_id: TENANT_ID,
    full_name: "Daniel Whitmore",
    date_of_birth: "1978-11-03",
    gender: "male",
    phone: "+1 (415) 555-0143",
    email: "daniel.whitmore@email.com",
    blood_group: "A+",
    allergies: "",
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2026-05-20T00:00:00Z",
  },
  {
    id: "p_03",
    tenant_id: TENANT_ID,
    full_name: "Priya Nair",
    date_of_birth: "1996-09-14",
    gender: "female",
    phone: "+1 (628) 555-0117",
    email: "priya.nair@email.com",
    blood_group: "B+",
    allergies: "Sulfa",
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2026-06-10T00:00:00Z",
  },
  {
    id: "p_04",
    tenant_id: TENANT_ID,
    full_name: "Marcus Delgado",
    date_of_birth: "1985-07-30",
    gender: "male",
    phone: "+1 (510) 555-0198",
    email: "marcus.delgado@email.com",
    blood_group: "AB+",
    allergies: "",
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  },
  {
    id: "p_05",
    tenant_id: TENANT_ID,
    full_name: "Jasmine Carter",
    date_of_birth: "1992-02-14",
    gender: "female",
    phone: "+1 (415) 555-0176",
    email: "jasmine.carter@email.com",
    blood_group: "O-",
    allergies: "Latex",
    created_at: "2025-03-10T00:00:00Z",
    updated_at: "2026-04-15T00:00:00Z",
  },
  {
    id: "p_06",
    tenant_id: TENANT_ID,
    full_name: "Jasper Bhatt",
    date_of_birth: "1985-06-01",
    gender: "male",
    phone: "+1 (628) 555-0130",
    email: "jasper.bhatt@email.com",
    blood_group: "A-",
    allergies: "",
    created_at: "2025-04-01T00:00:00Z",
    updated_at: "2026-01-18T00:00:00Z",
  },
  {
    id: "p_07",
    tenant_id: TENANT_ID,
    full_name: "Aaliyah Jaswal",
    date_of_birth: "1999-03-18",
    gender: "female",
    phone: "+1 (510) 555-0159",
    email: "aaliyah.jaswal@email.com",
    blood_group: "B-",
    allergies: "Shellfish",
    created_at: "2025-05-01T00:00:00Z",
    updated_at: "2026-02-24T00:00:00Z",
  },
  {
    id: "p_08",
    tenant_id: TENANT_ID,
    full_name: "Robert Chen",
    date_of_birth: "1965-12-08",
    gender: "male",
    phone: "+1 (628) 555-0221",
    email: "robert.chen@email.com",
    blood_group: "O+",
    allergies: "Aspirin",
    created_at: "2025-06-01T00:00:00Z",
    updated_at: "2026-07-05T00:00:00Z",
  },
]

// ---------------------------------------------------------------------------
// Appointments (Today: 2026-07-12)
// ---------------------------------------------------------------------------

export const appointments: Appointment[] = [
  // --- Dr. Sara Reyes queue ---
  {
    id: "apt_01",
    tenant_id: TENANT_ID,
    patient_id: "p_01",
    doctor_id: "u_doctor_01",
    queue_number: 1,
    type: "new",
    status: "in_consultation",
    scheduled_start: "2026-07-12T09:15:00Z",
    actual_start: "2026-07-12T09:18:00Z",
    created_at: "2026-07-11T14:00:00Z",
    updated_at: "2026-07-12T09:18:00Z",
  },
  {
    id: "apt_02",
    tenant_id: TENANT_ID,
    patient_id: "p_02",
    doctor_id: "u_doctor_01",
    queue_number: 2,
    type: "follow_up",
    status: "waiting",
    scheduled_start: "2026-07-12T09:30:00Z",
    created_at: "2026-07-11T14:00:00Z",
    updated_at: "2026-07-11T14:00:00Z",
  },
  // --- Dr. Samuel Mensah queue ---
  {
    id: "apt_03",
    tenant_id: TENANT_ID,
    patient_id: "p_03",
    doctor_id: "u_doctor_02",
    queue_number: 1,
    type: "new",
    status: "waiting",
    scheduled_start: "2026-07-12T09:45:00Z",
    created_at: "2026-07-11T15:00:00Z",
    updated_at: "2026-07-11T15:00:00Z",
  },
  {
    id: "apt_04",
    tenant_id: TENANT_ID,
    patient_id: "p_04",
    doctor_id: "u_doctor_02",
    queue_number: 2,
    type: "follow_up",
    status: "waiting",
    scheduled_start: "2026-07-12T10:15:00Z",
    created_at: "2026-07-11T16:00:00Z",
    updated_at: "2026-07-11T16:00:00Z",
  },
  // --- Completed ---
  {
    id: "apt_05",
    tenant_id: TENANT_ID,
    patient_id: "p_05",
    doctor_id: "u_doctor_01",
    queue_number: 3,
    type: "follow_up",
    status: "completed",
    scheduled_start: "2026-07-12T08:00:00Z",
    actual_start: "2026-07-12T08:05:00Z",
    completed_at: "2026-07-12T08:35:00Z",
    created_at: "2026-07-10T10:00:00Z",
    updated_at: "2026-07-12T08:35:00Z",
  },
  {
    id: "apt_06",
    tenant_id: TENANT_ID,
    patient_id: "p_06",
    doctor_id: "u_doctor_01",
    queue_number: 4,
    type: "new",
    status: "completed",
    scheduled_start: "2026-07-12T08:30:00Z",
    actual_start: "2026-07-12T08:32:00Z",
    completed_at: "2026-07-12T09:05:00Z",
    created_at: "2026-07-10T11:00:00Z",
    updated_at: "2026-07-12T09:05:00Z",
  },
  // --- Cancelled ---
  {
    id: "apt_07",
    tenant_id: TENANT_ID,
    patient_id: "p_07",
    doctor_id: "u_doctor_02",
    queue_number: 3,
    type: "new",
    status: "cancelled",
    scheduled_start: "2026-07-12T11:00:00Z",
    cancelled_at: "2026-07-12T07:45:00Z",
    cancellation_reason: "Patient called to reschedule",
    created_at: "2026-07-10T14:00:00Z",
    updated_at: "2026-07-12T07:45:00Z",
  },
  // --- Additional waiting patients for receptionist view ---
  {
    id: "apt_08",
    tenant_id: TENANT_ID,
    patient_id: "p_08",
    doctor_id: "u_doctor_01",
    queue_number: 5,
    type: "new",
    status: "waiting",
    scheduled_start: "2026-07-12T10:00:00Z",
    created_at: "2026-07-11T09:00:00Z",
    updated_at: "2026-07-11T09:00:00Z",
  },
]

// ---------------------------------------------------------------------------
// Medical Records (only for completed appointments)
// ---------------------------------------------------------------------------

export const medicalRecords: MedicalRecord[] = [
  {
    id: "mr_01",
    tenant_id: TENANT_ID,
    appointment_id: "apt_05",
    patient_id: "p_05",
    doctor_id: "u_doctor_01",
    chief_complaint:
      "Persistent dry cough and intermittent low-grade fever for the past 5 days. Reports mild shortness of breath on exertion.",
    diagnosis:
      "Acute bronchitis, likely viral in origin. No signs of bacterial superinfection on examination. Chest clear to auscultation bilaterally with no focal crackles or wheeze. Vitals within acceptable range aside from mildly elevated temperature.",
    notes:
      "Patient advised on supportive care: adequate hydration, rest, and antipyretics as needed. Prescribed a short course of symptomatic relief and reviewed warning signs warranting immediate return — worsening dyspnea, chest pain, or fever above 39°C.\n\nDiscussed smoking cessation given the patient's history; provided counseling materials. Follow-up scheduled in 7 days if symptoms do not resolve. No red flags noted at this visit.",
    vitals: {
      systolic_bp: 128,
      diastolic_bp: 82,
      temperature: 37.8,
      weight: 71.2,
      blood_sugar: 104,
    },
    created_at: "2026-07-12T08:35:00Z",
  },
  {
    id: "mr_02",
    tenant_id: TENANT_ID,
    appointment_id: "apt_06",
    patient_id: "p_06",
    doctor_id: "u_doctor_01",
    chief_complaint:
      "Routine follow-up for hypertension management. Patient reports good medication adherence. Occasional mild headaches in the morning.",
    diagnosis:
      "Stage 1 hypertension, well-controlled on current regimen. Blood pressure readings consistent with target range. No evidence of end-organ involvement.",
    notes:
      "Continue current antihypertensive therapy. Reinforced low-sodium dietary recommendations. Ordered annual labs (CBC, CMP, lipid panel, HbA1c). Scheduled follow-up in 3 months. Patient advised to maintain home BP log.",
    vitals: {
      systolic_bp: 134,
      diastolic_bp: 86,
      temperature: 36.8,
      weight: 84.5,
      blood_sugar: 112,
    },
    created_at: "2026-07-12T09:05:00Z",
  },
]

// ---------------------------------------------------------------------------
// Prescriptions (linked to medical records)
// ---------------------------------------------------------------------------

export const prescriptions: Prescription[] = [
  {
    id: "rx_01",
    tenant_id: TENANT_ID,
    medical_record_id: "mr_01",
    patient_id: "p_05",
    doctor_id: "u_doctor_01",
    items: [
      {
        medicine_name: "Amoxicillin 500mg",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: 7,
        duration_unit: "days",
      },
      {
        medicine_name: "Paracetamol 650mg",
        dosage: "650mg",
        frequency: "Every 8 hours",
        duration: 5,
        duration_unit: "days",
      },
    ],
    created_at: "2026-07-12T08:35:00Z",
  },
  {
    id: "rx_02",
    tenant_id: TENANT_ID,
    medical_record_id: "mr_02",
    patient_id: "p_06",
    doctor_id: "u_doctor_01",
    items: [
      {
        medicine_name: "Lisinopril 10mg",
        dosage: "10mg",
        frequency: "Once daily",
        duration: 90,
        duration_unit: "days",
      },
    ],
    created_at: "2026-07-12T09:05:00Z",
  },
]

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export const billings: Billing[] = [
  {
    id: "bill_01",
    tenant_id: TENANT_ID,
    appointment_id: "apt_05",
    total_amount: 150.0,
    payment_status: "paid",
    payment_method: "card",
    paid_at: "2026-07-12T08:40:00Z",
    created_at: "2026-07-12T08:35:00Z",
    updated_at: "2026-07-12T08:40:00Z",
  },
  {
    id: "bill_02",
    tenant_id: TENANT_ID,
    appointment_id: "apt_06",
    total_amount: 120.0,
    payment_status: "unpaid",
    created_at: "2026-07-12T09:05:00Z",
    updated_at: "2026-07-12T09:05:00Z",
  },
  {
    id: "bill_03",
    tenant_id: TENANT_ID,
    appointment_id: "apt_01",
    total_amount: 200.0,
    payment_status: "unpaid",
    created_at: "2026-07-12T09:18:00Z",
    updated_at: "2026-07-12T09:18:00Z",
  },
]

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------

export const auditLogs: AuditLog[] = [
  {
    id: "audit_01",
    tenant_id: TENANT_ID,
    actor_id: "u_doctor_01",
    action: "update",
    target_table: "billings",
    target_row_id: "bill_01",
    summary: "Updated a Billing record",
    changes: [
      { field: "payment_status", before: "unpaid", after: "paid" },
      { field: "payment_method", before: "", after: "card" },
      { field: "paid_at", before: "", after: "2026-07-12T08:40:00Z" },
    ],
    created_at: "2026-07-12T08:40:00Z",
  },
  {
    id: "audit_02",
    tenant_id: TENANT_ID,
    actor_id: "u_receptionist_01",
    action: "insert",
    target_table: "patients",
    target_row_id: "p_08",
    summary: "Registered a new Patient record",
    created_at: "2026-07-11T09:00:00Z",
  },
  {
    id: "audit_03",
    tenant_id: TENANT_ID,
    actor_id: "u_admin_01",
    action: "delete",
    target_table: "appointments",
    target_row_id: "apt_old_99",
    summary: "Deleted a duplicate Appointment record",
    created_at: "2026-07-11T10:30:00Z",
  },
  {
    id: "audit_04",
    tenant_id: TENANT_ID,
    actor_id: "u_doctor_01",
    action: "update",
    target_table: "prescriptions",
    target_row_id: "rx_01",
    summary: "Updated a Prescription record",
    changes: [
      { field: "items[0].duration", before: "5", after: "7" },
      { field: "items[1].dosage", before: "500mg", after: "650mg" },
    ],
    created_at: "2026-07-12T08:38:00Z",
  },
]

// ---------------------------------------------------------------------------
// Derived Lookup Helpers
// ---------------------------------------------------------------------------

/** Get a patient by ID */
export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id)
}

/** Get a user by ID */
export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

/** Get today's appointments (2026-07-12), optionally filtered by doctor */
export function getTodayAppointments(doctorId?: string): Appointment[] {
  const today = appointments.filter((a) =>
    a.scheduled_start.startsWith("2026-07-12"),
  )
  return doctorId ? today.filter((a) => a.doctor_id === doctorId) : today
}

/** Get a doctor's initials (e.g. "SR" from "Dr. Sara Reyes") */
export function getDoctorInitials(user: User): string {
  const name = user.full_name.replace(/^Dr\.\s*/i, "")
  const parts = name.split(" ")
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

/** Fuzzy search patients by name or phone */
export function searchPatients(query: string): Patient[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(q) || p.phone.includes(query),
  )
}

/** Counts for receptionist KPI row */
export function getReceptionistKpis() {
  const today = getTodayAppointments()
  return {
    waiting: today.filter((a) => a.status === "waiting").length,
    inConsultation: today.filter((a) => a.status === "in_consultation").length,
    completedToday: today.filter((a) => a.status === "completed").length,
    cancelledToday: today.filter((a) => a.status === "cancelled").length,
    unpaidBills: billings.filter((b) => b.payment_status === "unpaid").length,
  }
}

/** Admin KPI aggregates */
export function getAdminKpis() {
  const totalRevenue = billings
    .filter((b) => b.payment_status === "paid")
    .reduce((s, b) => s + b.total_amount, 0)
  const outstandingBalance = billings
    .filter((b) => b.payment_status === "unpaid")
    .reduce((s, b) => s + b.total_amount, 0)
  const totalAppointments = appointments.length
  const uniquePatients = new Set(patients.map((p) => p.id)).size
  const completedToday = appointments.filter(
    (a) => a.status === "completed",
  ).length
  const cancelledToday = appointments.filter(
    (a) => a.status === "cancelled",
  ).length
  const totalToday = appointments.filter((a) =>
    a.scheduled_start.startsWith("2026-07-12"),
  ).length

  return {
    totalRevenue,
    outstandingBalance,
    totalAppointments,
    newPatients: uniquePatients,
    completionRate:
      totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
    cancellationRate:
      totalToday > 0 ? Math.round((cancelledToday / totalToday) * 100) : 0,
  }
}

/** Appointments per doctor (for admin chart) */
export function getAppointmentsPerDoctor() {
  const counts = new Map<string, { name: string; count: number }>()
  for (const a of appointments) {
    const dr = getUser(a.doctor_id)
    if (!dr) continue
    const entry = counts.get(dr.id) || { name: dr.full_name, count: 0 }
    entry.count++
    counts.set(dr.id, entry)
  }
  return Array.from(counts.values())
}

/** Get medical record for a patient by appointment */
export function getMedicalRecordForAppointment(
  appointmentId: string,
): MedicalRecord | undefined {
  return medicalRecords.find((mr) => mr.appointment_id === appointmentId)
}

/** Get prescriptions for a medical record */
export function getPrescriptionsForRecord(
  medicalRecordId: string,
): Prescription | undefined {
  return prescriptions.find((rx) => rx.medical_record_id === medicalRecordId)
}

/** Get billing for an appointment */
export function getBillingForAppointment(appointmentId: string): Billing | undefined {
  return billings.find((b) => b.appointment_id === appointmentId)
}

/** Get patient's past appointments (all non-cancelled completed visits before today) */
export function getPatientHistory(patientId: string): Appointment[] {
  return appointments.filter(
    (a) =>
      a.patient_id === patientId &&
      a.status === "completed",
  )
}