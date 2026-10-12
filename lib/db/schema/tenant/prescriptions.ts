// ============================================================================
// Tenant DB Schema — prescriptions table
// ============================================================================`
// items stored as JSONB array of PrescriptionItem objects.
// One prescription per medical record (optional — not every encounter spawns a script).
// ============================================================================

import { pgTable, uuid, jsonb, timestamp } from "drizzle-orm/pg-core"
import { medical_records } from "./medical_records"
import { patients } from "./patients"

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  medical_record_id: uuid("medical_record_id")
    .notNull()
    .references(() => medical_records.id),
  patient_id: uuid("patient_id")
    .notNull()
    .references(() => patients.id),
  doctor_id: uuid("doctor_id").notNull(),
  items: jsonb("items").notNull().default("[]"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})