// ============================================================================
// Clinic Management System — Shared Domain Types
// ============================================================================
// Every entity is scoped to a single tenant via `tenant_id`.
// Age is NEVER stored; it is always derived at runtime from `date_of_birth`.
// ============================================================================

// ---------------------------------------------------------------------------
// Core Enums
// ---------------------------------------------------------------------------

export type UserRole = "admin" | "doctor" | "receptionist" | "supervisor"

export type AppointmentStatus =
  | "waiting"
  | "called"
  | "in_consultation"
  | "completed"
  | "cancelled"

export type AppointmentType = "new" | "follow_up"

export type PaymentStatus = "paid" | "unpaid"

export type PaymentMethod = "cash" | "card"

export type AuditAction = "insert" | "update" | "delete"

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------

export interface Tenant {
  id: string // UUID
  name: string // e.g. "Northgate Clinic"
  slug: string // URL-safe identifier
  address_line_1: string
  address_line_2?: string
  city: string
  phone: string
  logo_url?: string
  subscription_tier: "trial" | "basic" | "premium"
  created_at: string // ISO 8601
}

// ---------------------------------------------------------------------------
// Users (Staff)
// ---------------------------------------------------------------------------

export interface User {
  id: string // UUID
  tenant_id: string // FK → tenants.id
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole // strictly ONE role per user
  is_active: boolean
  created_at: string // ISO 8601
}

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export interface Patient {
  id: string // UUID
  tenant_id: string // FK → tenants.id
  full_name: string
  date_of_birth: string // ISO 8601 date-only — age derived dynamically, NEVER stored
  gender: "male" | "female" | "other"
  phone: string
  email?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  blood_group?: string
  allergies?: string
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export interface Appointment {
  id: string // UUID
  tenant_id: string // FK → tenants.id
  patient_id: string // FK → patients.id
  doctor_id: string // FK → users.id (must have role = "doctor")
  queue_number: number // daily position per doctor, resets daily
  type: AppointmentType
  status: AppointmentStatus
  scheduled_start: string // ISO 8601 timestamp
  last_called_at?: string // ISO 8601 — set when status → called; cleared on in_consultation
  actual_start?: string // ISO 8601 — set when status → in_consultation
  completed_at?: string // ISO 8601 — set when status → completed
  cancelled_at?: string // ISO 8601
  cancellation_reason?: string
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
}

// ---------------------------------------------------------------------------
// Medical Records
// ---------------------------------------------------------------------------

export interface Vitals {
  systolic_bp?: number // mmHg
  diastolic_bp?: number // mmHg
  temperature?: number // °C
  weight?: number // kg
  blood_sugar?: number // mg/dL
}

export interface MedicalRecord {
  id: string // UUID
  tenant_id: string // FK → tenants.id
  appointment_id: string // FK → appointments.id (one record per completed appointment)
  patient_id: string // FK → patients.id (denormalized for query convenience)
  doctor_id: string // FK → users.id
  chief_complaint: string
  diagnosis: string
  notes?: string
  vitals: Vitals
  created_at: string // ISO 8601
}

// ---------------------------------------------------------------------------
// Prescriptions
// ---------------------------------------------------------------------------

export interface PrescriptionItem {
  medicine_name: string
  dosage: string // e.g. "500mg", "10ml"
  frequency: string // e.g. "Twice daily", "Every 8 hours"
  duration: number // numeric value
  duration_unit: "days" | "weeks"
  instructions?: string // free-text additional instructions
}

export interface Prescription {
  id: string // UUID
  tenant_id: string // FK → tenants.id
  medical_record_id: string // FK → medical_records.id
  patient_id: string // FK → patients.id (denormalized)
  doctor_id: string // FK → users.id
  items: PrescriptionItem[] // one-to-many line items
  created_at: string // ISO 8601
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export interface Billing {
  id: string // UUID
  tenant_id: string // FK → tenants.id
  appointment_id: string // FK → appointments.id
  total_amount: number // in minor currency unit (e.g. cents), or decimal
  payment_status: PaymentStatus
  payment_method?: PaymentMethod // set only when paid
  paid_at?: string // ISO 8601
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
}

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------

export interface AuditChange {
  field: string // column name that changed
  before: string // serialized previous value
  after: string // serialized new value
}

export interface AuditLog {
  id: string // UUID
  tenant_id: string // FK → tenants.id
  actor_id: string // FK → users.id — who performed the action
  action: AuditAction
  target_table: string // e.g. "patients", "appointments"
  target_row_id: string // the PK of the affected row
  summary: string // human-readable description of the change
  changes?: AuditChange[] // structured before/after diff
  created_at: string // ISO 8601 — immutable
}

// ---------------------------------------------------------------------------
// Utility Types
// ---------------------------------------------------------------------------

/** Status metadata for rendering pills/badges */
export interface StatusMeta {
  labelKey: string // dictionary dot-path key (e.g. "status.waiting") — resolved via useT()
  label: string // DEPRECATED: hardcoded English fallback, still used by non-i18n consumers
  color: string // hex color for text + dot
}

/** Mapping from AppointmentStatus to display metadata (Archai semantic palette) */
export const APPOINTMENT_STATUS_META: Record<AppointmentStatus, StatusMeta> = {
  waiting: { labelKey: "status.waiting", label: "Waiting", color: "#E9A24F" },
  called: { labelKey: "status.called", label: "Called", color: "#2ED2FF" },
  in_consultation: { labelKey: "status.inConsultation", label: "In Consultation", color: "#1BB0E3" },
  completed: { labelKey: "status.completed", label: "Completed", color: "#3DDC97" },
  cancelled: { labelKey: "status.cancelled", label: "Cancelled", color: "#FF6B7A" },
}

/** Mapping from AuditAction to display metadata (Archai semantic palette) */
export const AUDIT_ACTION_META: Record<AuditAction, StatusMeta> = {
  insert: { labelKey: "status.insert", label: "Insert", color: "#3DDC97" },
  update: { labelKey: "status.update", label: "Update", color: "#2ED2FF" },
  delete: { labelKey: "status.delete", label: "Delete", color: "#FF6B7A" },
}

/** Mapping from PaymentStatus to display metadata (Archai semantic palette) */
export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  paid: { labelKey: "status.paid", label: "Paid", color: "#3DDC97" },
  unpaid: { labelKey: "status.unpaid", label: "Unpaid", color: "#E9A24F" },
}

// ---------------------------------------------------------------------------
// Helper: derive age from date_of_birth (runtime only — never stored)
// ---------------------------------------------------------------------------

/**
 * Computes a patient's age in full years from their date of birth.
 * Age is NEVER persisted to the database — this is the single source of truth.
 */
export function deriveAge(dateOfBirth: string, now?: Date): number {
  const birth = new Date(dateOfBirth)
  const today = now ?? new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}