// ============================================================================
// Tenant DB Schema — staff_members table
// ============================================================================
// Registry of every person working at the clinic: doctors, receptionists,
// supervisors and non-login staff (cleaners, security, …). Rows MAY link to
// an Identity DB user (user_id) when the person has a login account; the
// link is loose (no FK) because users live in the Identity DB, not here.
// Admin owns full CRUD on this table. Salaries and shifts hang off it.
// ============================================================================

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  date,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core"

export const STAFF_TYPES = [
  "doctor",
  "receptionist",
  "supervisor",
  "cleaner",
  "security",
  "other",
] as const

export type StaffType = (typeof STAFF_TYPES)[number]

export const staffMembers = pgTable("staff_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  user_id: uuid("user_id"), // Identity DB users.id — nullable (no FK: cross-DB)
  full_name: varchar("full_name", { length: 255 }).notNull(),
  staff_type: varchar("staff_type", { length: 30 }).notNull().default("other"),
  job_title: varchar("job_title", { length: 120 }),
  phone: varchar("phone", { length: 50 }),
  monthly_salary: numeric("monthly_salary", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  is_active: boolean("is_active").notNull().default(true),
  hired_at: date("hired_at"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
