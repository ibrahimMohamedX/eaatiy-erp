// ============================================================================
// Tenant DB Schema — patients table
// ============================================================================
// Lives in each tenant's own database. `date_of_birth` is stored, but age is
// NEVER persisted — always derived at runtime via deriveAge().
// ============================================================================

import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
} from "drizzle-orm/pg-core"

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  date_of_birth: date("date_of_birth").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  emergency_contact_name: varchar("emergency_contact_name", { length: 255 }),
  emergency_contact_phone: varchar("emergency_contact_phone", {
    length: 50,
  }),
  blood_group: varchar("blood_group", { length: 5 }),
  allergies: text("allergies"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})