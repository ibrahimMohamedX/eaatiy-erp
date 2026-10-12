// ============================================================================
// Tenant DB Schema — medical_records table
// ============================================================================
// One record per completed appointment (enforced by UNIQUE FK→appointments).
// Vitals stored as JSONB for schema flexibility.
// ============================================================================

import {
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { appointments } from "./appointments"
import { patients } from "./patients"

export const medical_records = pgTable("medical_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  appointment_id: uuid("appointment_id")
    .notNull()
    .unique()
    .references(() => appointments.id),
  patient_id: uuid("patient_id")
    .notNull()
    .references(() => patients.id),
  doctor_id: uuid("doctor_id").notNull(),
  chief_complaint: text("chief_complaint").notNull(),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes"),
  vitals: jsonb("vitals").notNull().default("{}"),
  is_draft: boolean("is_draft").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})