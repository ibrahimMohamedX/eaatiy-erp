// ============================================================================
// Database Seed Script — Phase 2A
// ============================================================================
// Mirrors the data currently in lib/mock-data.ts. Run after migrations are
// applied to populate the Identity DB and the Northgate Clinic tenant database.
//
// Usage:
//   npx tsx scripts/seed.ts
//
// Requires environment variables:
//   IDENTITY_DATABASE_URL
//   TENANT_DATABASE_URL_PREFIX
// ============================================================================

import { randomUUID } from "node:crypto"
import { hashSync } from "bcryptjs"
import { Pool } from "pg"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const IDENTITY_DB_URL =
  process.env.IDENTITY_DATABASE_URL ??
  "postgres://meridian:meridian_dev@localhost:5432/meridian_identity"

const TENANT_DB_PREFIX =
  process.env.TENANT_DATABASE_URL_PREFIX ??
  "postgres://meridian:meridian_dev@localhost:5432"

const DEFAULT_PASSWORD = "password123"
const BCRYPT_ROUNDS = 12

// ---------------------------------------------------------------------------
// Identity DB — IDs
// ---------------------------------------------------------------------------

const TENANT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

const USER_IDS = {
  helena: "a1000001-0000-0000-0000-000000000001",
  sara: "a1000001-0000-0000-0000-000000000002",
  samuel: "a1000001-0000-0000-0000-000000000003",
  amir: "a1000001-0000-0000-0000-000000000004",
  lena: "a1000001-0000-0000-0000-000000000005",
  amelia: "a1000001-0000-0000-0000-000000000006",
}

// ---------------------------------------------------------------------------
// Tenant DB — IDs (match mock-data for component compatibility)
// ---------------------------------------------------------------------------

const PATIENT_IDS = {
  p_01: "a2000001-0000-0000-0000-000000000001",
  p_02: "a2000001-0000-0000-0000-000000000002",
  p_03: "a2000001-0000-0000-0000-000000000003",
  p_04: "a2000001-0000-0000-0000-000000000004",
  p_05: "a2000001-0000-0000-0000-000000000005",
  p_06: "a2000001-0000-0000-0000-000000000006",
  p_07: "a2000001-0000-0000-0000-000000000007",
  p_08: "a2000001-0000-0000-0000-000000000008",
}

const APPOINTMENT_IDS = {
  apt_01: "a3000001-0000-0000-0000-000000000001",
  apt_02: "a3000001-0000-0000-0000-000000000002",
  apt_03: "a3000001-0000-0000-0000-000000000003",
  apt_04: "a3000001-0000-0000-0000-000000000004",
  apt_05: "a3000001-0000-0000-0000-000000000005",
  apt_06: "a3000001-0000-0000-0000-000000000006",
  apt_07: "a3000001-0000-0000-0000-000000000007",
  apt_08: "a3000001-0000-0000-0000-000000000008",
}

const MR_IDS = {
  mr_01: "a4000001-0000-0000-0000-000000000001",
  mr_02: "a4000001-0000-0000-0000-000000000002",
}

const RX_IDS = {
  rx_01: "a5000001-0000-0000-0000-000000000001",
  rx_02: "a5000001-0000-0000-0000-000000000002",
}

const BILLING_IDS = {
  bill_01: "a6000001-0000-0000-0000-000000000001",
  bill_02: "a6000001-0000-0000-0000-000000000002",
  bill_03: "a6000001-0000-0000-0000-000000000003",
}

const AUDIT_IDS = {
  audit_01: "a7000001-0000-0000-0000-000000000001",
  audit_02: "a7000001-0000-0000-0000-000000000002",
  audit_03: "a7000001-0000-0000-0000-000000000003",
  audit_04: "a7000001-0000-0000-0000-000000000004",
}

const passwordHash = hashSync(DEFAULT_PASSWORD, BCRYPT_ROUNDS)

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Seeding Identity DB...")
  const identityPool = new Pool({ connectionString: IDENTITY_DB_URL })

  // -----------------------------------------------------------------------
  // Identity DB — tenants
  // -----------------------------------------------------------------------
  await identityPool.query(`
    INSERT INTO tenants (id, name, slug, address_line_1, city, phone, subscription_tier, status)
    VALUES (
      '${TENANT_ID}',
      'Northgate Clinic',
      'northgate',
      '142 Elm Street, Suite 5',
      'San Francisco, CA 94102',
      '(555) 018-2245',
      'premium',
      'active'
    )
  `)
  console.log("  ✅ tenants — Northgate Clinic")

  // -----------------------------------------------------------------------
  // Identity DB — users (6 staff)
  // -----------------------------------------------------------------------
  const userRows = [
    {
      id: USER_IDS.helena,
      email: "helena.marsh@northgate.com",
      name: "Helena Marsh",
      role: "receptionist",
    },
    {
      id: USER_IDS.sara,
      email: "sara.reyes@northgate.com",
      name: "Dr. Sara Reyes",
      role: "doctor",
    },
    {
      id: USER_IDS.samuel,
      email: "samuel.mensah@northgate.com",
      name: "Dr. Samuel Mensah",
      role: "doctor",
    },
    {
      id: USER_IDS.amir,
      email: "amir.khan@northgate.com",
      name: "Dr. Amir Khan",
      role: "doctor",
    },
    {
      id: USER_IDS.lena,
      email: "lena.osei@northgate.com",
      name: "Dr. Lena Osei",
      role: "doctor",
    },
    {
      id: USER_IDS.amelia,
      email: "amelia.monroe@northgate.com",
      name: "Amelia Monroe",
      role: "admin",
    },
  ]

  for (const u of userRows) {
    await identityPool.query(`
      INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
      VALUES ('${u.id}', '${TENANT_ID}', '${u.email}', '${passwordHash}', '${u.name}', '${u.role}')
    `)
  }
  console.log("  ✅ users — 6 staff members with bcrypt-hashed passwords")

  // -----------------------------------------------------------------------
  // Identity DB — rbac_roles
  // -----------------------------------------------------------------------
  for (const u of userRows) {
    await identityPool.query(`
      INSERT INTO rbac_roles (id, user_id, tenant_id, role)
      VALUES ('${randomUUID()}', '${u.id}', '${TENANT_ID}', '${u.role}')
    `)
  }
  console.log("  ✅ rbac_roles — 6 role assignments")

  // -----------------------------------------------------------------------
  // Identity DB — license_state (singleton for Northgate)
  // -----------------------------------------------------------------------
  await identityPool.query(`
    INSERT INTO license_state (id, tenant_id, installation_id, highest_issue_sequence)
    VALUES (1, '${TENANT_ID}', '${randomUUID()}', 0)
  `)
  console.log("  ✅ license_state — singleton row for Northgate")

  await identityPool.end()

  // -----------------------------------------------------------------------
  // Tenant DB — Northgate
  // -----------------------------------------------------------------------
  console.log("🌱 Seeding Tenant DB (Northgate)...")
  const tenantDbUrl = `${TENANT_DB_PREFIX}/tenant_northgate`
  const tenantPool = new Pool({ connectionString: tenantDbUrl })

  // -----------------------------------------------------------------------
  // patients (8)
  // -----------------------------------------------------------------------
  const patientRows = [
    {
      id: PATIENT_IDS.p_01,
      name: "Amara Okafor",
      dob: "1991-04-22",
      gender: "female",
      phone: "+1 (415) 555-0182",
      email: "amara.okafor@email.com",
      blood_group: "O+",
      allergies: "Penicillin",
    },
    {
      id: PATIENT_IDS.p_02,
      name: "Daniel Whitmore",
      dob: "1978-11-03",
      gender: "male",
      phone: "+1 (415) 555-0143",
      email: "daniel.whitmore@email.com",
      blood_group: "A+",
      allergies: "",
    },
    {
      id: PATIENT_IDS.p_03,
      name: "Priya Nair",
      dob: "1996-09-14",
      gender: "female",
      phone: "+1 (628) 555-0117",
      email: "priya.nair@email.com",
      blood_group: "B+",
      allergies: "Sulfa",
    },
    {
      id: PATIENT_IDS.p_04,
      name: "Marcus Delgado",
      dob: "1985-07-30",
      gender: "male",
      phone: "+1 (510) 555-0198",
      email: "marcus.delgado@email.com",
      blood_group: "AB+",
      allergies: "",
    },
    {
      id: PATIENT_IDS.p_05,
      name: "Jasmine Carter",
      dob: "1992-02-14",
      gender: "female",
      phone: "+1 (415) 555-0176",
      email: "jasmine.carter@email.com",
      blood_group: "O-",
      allergies: "Latex",
    },
    {
      id: PATIENT_IDS.p_06,
      name: "Jasper Bhatt",
      dob: "1985-06-01",
      gender: "male",
      phone: "+1 (628) 555-0130",
      email: "jasper.bhatt@email.com",
      blood_group: "A-",
      allergies: "",
    },
    {
      id: PATIENT_IDS.p_07,
      name: "Aaliyah Jaswal",
      dob: "1999-03-18",
      gender: "female",
      phone: "+1 (510) 555-0159",
      email: "aaliyah.jaswal@email.com",
      blood_group: "B-",
      allergies: "Shellfish",
    },
    {
      id: PATIENT_IDS.p_08,
      name: "Robert Chen",
      dob: "1965-12-08",
      gender: "male",
      phone: "+1 (628) 555-0221",
      email: "robert.chen@email.com",
      blood_group: "O+",
      allergies: "Aspirin",
    },
  ]

  for (const p of patientRows) {
    await tenantPool.query(`
      INSERT INTO patients (id, tenant_id, full_name, date_of_birth, gender, phone, email, blood_group, allergies)
      VALUES ('${p.id}', '${TENANT_ID}', '${p.name}', '${p.dob}', '${p.gender}', '${p.phone}', '${p.email}', '${p.blood_group}', '${p.allergies}')
    `)
  }
  console.log("  ✅ patients — 8 records")

  // -----------------------------------------------------------------------
  // appointments (8)
  // -----------------------------------------------------------------------
  await tenantPool.query(`
    INSERT INTO appointments (id, tenant_id, patient_id, doctor_id, queue_number, type, status, scheduled_start, actual_start, completed_at, cancelled_at, cancellation_reason)
    VALUES
      ('${APPOINTMENT_IDS.apt_01}', '${TENANT_ID}', '${PATIENT_IDS.p_01}', '${USER_IDS.sara}', 1, 'new', 'in_consultation', '2026-07-12T09:15:00Z', '2026-07-12T09:18:00Z', NULL, NULL, NULL),
      ('${APPOINTMENT_IDS.apt_02}', '${TENANT_ID}', '${PATIENT_IDS.p_02}', '${USER_IDS.sara}', 2, 'follow_up', 'waiting', '2026-07-12T09:30:00Z', NULL, NULL, NULL, NULL),
      ('${APPOINTMENT_IDS.apt_03}', '${TENANT_ID}', '${PATIENT_IDS.p_03}', '${USER_IDS.samuel}', 1, 'new', 'waiting', '2026-07-12T09:45:00Z', NULL, NULL, NULL, NULL),
      ('${APPOINTMENT_IDS.apt_04}', '${TENANT_ID}', '${PATIENT_IDS.p_04}', '${USER_IDS.samuel}', 2, 'follow_up', 'waiting', '2026-07-12T10:15:00Z', NULL, NULL, NULL, NULL),
      ('${APPOINTMENT_IDS.apt_05}', '${TENANT_ID}', '${PATIENT_IDS.p_05}', '${USER_IDS.sara}', 3, 'follow_up', 'completed', '2026-07-12T08:00:00Z', '2026-07-12T08:05:00Z', '2026-07-12T08:35:00Z', NULL, NULL),
      ('${APPOINTMENT_IDS.apt_06}', '${TENANT_ID}', '${PATIENT_IDS.p_06}', '${USER_IDS.sara}', 4, 'new', 'completed', '2026-07-12T08:30:00Z', '2026-07-12T08:32:00Z', '2026-07-12T09:05:00Z', NULL, NULL),
      ('${APPOINTMENT_IDS.apt_07}', '${TENANT_ID}', '${PATIENT_IDS.p_07}', '${USER_IDS.samuel}', 3, 'new', 'cancelled', '2026-07-12T11:00:00Z', NULL, NULL, '2026-07-12T07:45:00Z', 'Patient called to reschedule'),
      ('${APPOINTMENT_IDS.apt_08}', '${TENANT_ID}', '${PATIENT_IDS.p_08}', '${USER_IDS.sara}', 5, 'new', 'waiting', '2026-07-12T10:00:00Z', NULL, NULL, NULL, NULL)
  `)
  console.log("  ✅ appointments — 8 records")

  // -----------------------------------------------------------------------
  // medical_records (2 — only for completed appointments)
  // -----------------------------------------------------------------------
  await tenantPool.query(`
    INSERT INTO medical_records (id, tenant_id, appointment_id, patient_id, doctor_id, chief_complaint, diagnosis, notes, vitals, is_draft)
    VALUES (
      '${MR_IDS.mr_01}', '${TENANT_ID}', '${APPOINTMENT_IDS.apt_05}', '${PATIENT_IDS.p_05}', '${USER_IDS.sara}',
      'Persistent dry cough and intermittent low-grade fever for the past 5 days. Reports mild shortness of breath on exertion.',
      'Acute bronchitis, likely viral in origin. No signs of bacterial superinfection on examination. Chest clear to auscultation bilaterally with no focal crackles or wheeze. Vitals within acceptable range aside from mildly elevated temperature.',
      'Patient advised on supportive care: adequate hydration, rest, and antipyretics as needed. Prescribed a short course of symptomatic relief and reviewed warning signs warranting immediate return — worsening dyspnea, chest pain, or fever above 39°C.\n\nDiscussed smoking cessation given the patient''s history; provided counseling materials. Follow-up scheduled in 7 days if symptoms do not resolve. No red flags noted at this visit.',
      '{"systolic_bp":128,"diastolic_bp":82,"temperature":37.8,"weight":71.2,"blood_sugar":104}'::jsonb,
      false
    )
  `)

  await tenantPool.query(`
    INSERT INTO medical_records (id, tenant_id, appointment_id, patient_id, doctor_id, chief_complaint, diagnosis, notes, vitals, is_draft)
    VALUES (
      '${MR_IDS.mr_02}', '${TENANT_ID}', '${APPOINTMENT_IDS.apt_06}', '${PATIENT_IDS.p_06}', '${USER_IDS.sara}',
      'Routine follow-up for hypertension management. Patient reports good medication adherence. Occasional mild headaches in the morning.',
      'Stage 1 hypertension, well-controlled on current regimen. Blood pressure readings consistent with target range. No evidence of end-organ involvement.',
      'Continue current antihypertensive therapy. Reinforced low-sodium dietary recommendations. Ordered annual labs (CBC, CMP, lipid panel, HbA1c). Scheduled follow-up in 3 months. Patient advised to maintain home BP log.',
      '{"systolic_bp":134,"diastolic_bp":86,"temperature":36.8,"weight":84.5,"blood_sugar":112}'::jsonb,
      false
    )
  `)
  console.log("  ✅ medical_records — 2 records")

  // -----------------------------------------------------------------------
  // prescriptions (2)
  // -----------------------------------------------------------------------
  await tenantPool.query(`
    INSERT INTO prescriptions (id, tenant_id, medical_record_id, patient_id, doctor_id, items)
    VALUES (
      '${RX_IDS.rx_01}', '${TENANT_ID}', '${MR_IDS.mr_01}', '${PATIENT_IDS.p_05}', '${USER_IDS.sara}',
      '[{"medicine_name":"Amoxicillin 500mg","dosage":"500mg","frequency":"Twice daily","duration":7,"duration_unit":"days"},{"medicine_name":"Paracetamol 650mg","dosage":"650mg","frequency":"Every 8 hours","duration":5,"duration_unit":"days"}]'::jsonb
    )
  `)

  await tenantPool.query(`
    INSERT INTO prescriptions (id, tenant_id, medical_record_id, patient_id, doctor_id, items)
    VALUES (
      '${RX_IDS.rx_02}', '${TENANT_ID}', '${MR_IDS.mr_02}', '${PATIENT_IDS.p_06}', '${USER_IDS.sara}',
      '[{"medicine_name":"Lisinopril 10mg","dosage":"10mg","frequency":"Once daily","duration":90,"duration_unit":"days"}]'::jsonb
    )
  `)
  console.log("  ✅ prescriptions — 2 records")

  // -----------------------------------------------------------------------
  // billings (3)
  // -----------------------------------------------------------------------
  await tenantPool.query(`
    INSERT INTO billings (id, tenant_id, appointment_id, total_amount, payment_status, payment_method, paid_at)
    VALUES
      ('${BILLING_IDS.bill_01}', '${TENANT_ID}', '${APPOINTMENT_IDS.apt_05}', 150.00, 'paid', 'card', '2026-07-12T08:40:00Z'),
      ('${BILLING_IDS.bill_02}', '${TENANT_ID}', '${APPOINTMENT_IDS.apt_06}', 120.00, 'unpaid', NULL, NULL),
      ('${BILLING_IDS.bill_03}', '${TENANT_ID}', '${APPOINTMENT_IDS.apt_01}', 200.00, 'unpaid', NULL, NULL)
  `)
  console.log("  ✅ billings — 3 records")

  // -----------------------------------------------------------------------
  // audit_logs (4)
  // -----------------------------------------------------------------------
  await tenantPool.query(`
    INSERT INTO audit_logs (id, tenant_id, actor_id, action, target_table, target_row_id, summary, changes)
    VALUES
      (
        '${AUDIT_IDS.audit_01}', '${TENANT_ID}', '${USER_IDS.sara}', 'update', 'billings', '${BILLING_IDS.bill_01}',
        'Updated a Billing record',
        '[{"field":"payment_status","before":"unpaid","after":"paid"},{"field":"payment_method","before":"","after":"card"},{"field":"paid_at","before":"","after":"2026-07-12T08:40:00Z"}]'::jsonb
      ),
      (
        '${AUDIT_IDS.audit_02}', '${TENANT_ID}', '${USER_IDS.helena}', 'insert', 'patients', '${PATIENT_IDS.p_08}',
        'Registered a new Patient record',
        NULL
      ),
      (
        '${AUDIT_IDS.audit_03}', '${TENANT_ID}', '${USER_IDS.amelia}', 'delete', 'appointments', 'apt_old_99',
        'Deleted a duplicate Appointment record',
        NULL
      ),
      (
        '${AUDIT_IDS.audit_04}', '${TENANT_ID}', '${USER_IDS.sara}', 'update', 'prescriptions', '${RX_IDS.rx_01}',
        'Updated a Prescription record',
        '[{"field":"items[0].duration","before":"5","after":"7"},{"field":"items[1].dosage","before":"500mg","after":"650mg"}]'::jsonb
      )
  `)
  console.log("  ✅ audit_logs — 4 records")

  await tenantPool.end()

  console.log("\n🎉 Seed complete!")
  console.log("   Identity DB: 1 tenant, 6 users, 6 role assignments, 1 license state")
  console.log("   Tenant DB (Northgate): 8 patients, 8 appointments, 2 medical records, 2 prescriptions, 3 billings, 4 audit logs")
  console.log(`\n   Default password for all users: ${DEFAULT_PASSWORD}`)
}

main().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})