-- ============================================================================
-- Migration: 0002_performance_indexes
-- ============================================================================
-- Adds indexes to avoid full table scans on hot queries used by the
-- reception desk, doctor queue, and admin analytics.
-- ============================================================================

-- Index 1: Today's queue lookup (filters on tenant_id + scheduled_start)
-- The range query uses scheduled_start >= $dayStart AND scheduled_start < $dayEnd
-- This index avoids a full sequential scan every 15s polling tick.
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_scheduled
  ON appointments (tenant_id, scheduled_start DESC);

-- Index 2: Doctor's personal queue (today's patients for one doctor)
-- Used by getMyQueue() on every doctor page load / poll.
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_day
  ON appointments (tenant_id, doctor_id, scheduled_start DESC);

-- Index 3: Status + tenant filter (used by getTodayCounts GROUP BY status)
-- Covers the polling aggregate that powers the KPI row.
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_status
  ON appointments (tenant_id, status);

-- Index 4: Patient history lookup (completed appointments for a patient)
-- Used by getPatientHistory() when the doctor selects a patient.
CREATE INDEX IF NOT EXISTS idx_appointments_patient_status
  ON appointments (tenant_id, patient_id, status);

-- Index 5: Medical records by appointment (used every time a patient is selected)
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment
  ON medical_records (tenant_id, appointment_id);

-- Index 6: Billings by appointment (used every time a patient is selected)
CREATE INDEX IF NOT EXISTS idx_billings_appointment
  ON billings (tenant_id, appointment_id);

-- Index 7: Prescriptions by medical record (used when loading patient data)
CREATE INDEX IF NOT EXISTS idx_prescriptions_medical_record
  ON prescriptions (tenant_id, medical_record_id);