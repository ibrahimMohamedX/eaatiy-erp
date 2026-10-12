// ============================================================================
// Tenant DB Schema — appointments table
// ============================================================================
// Operational backbone. queue_number resets daily per doctor (enforced by
// application logic, not a DB constraint). Status follows strict lifecycle:
// waiting → in_consultation → completed (or cancelled at any point).
// ============================================================================

import {
  pgTable,
  uuid,
  integer,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { patients } from "./patients"

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  patient_id: uuid("patient_id")
    .notNull()
    .references(() => patients.id),
  doctor_id: uuid("doctor_id").notNull(),
  queue_number: integer("queue_number").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("new"),
  status: varchar("status", { length: 20 }).notNull().default("waiting"),
  scheduled_start: timestamp("scheduled_start", {
    withTimezone: true,
  }).notNull(),
  last_called_at: timestamp("last_called_at", { withTimezone: true }),
  actual_start: timestamp("actual_start", { withTimezone: true }),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  cancelled_at: timestamp("cancelled_at", { withTimezone: true }),
  cancellation_reason: text("cancellation_reason"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})