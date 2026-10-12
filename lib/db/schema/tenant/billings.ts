// ============================================================================
// Tenant DB Schema — billings table
// ============================================================================
// One billing record per appointment (UNIQUE FK→appointments).
// ============================================================================

import {
  pgTable,
  uuid,
  decimal,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core"
import { appointments } from "./appointments"

export const billings = pgTable("billings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  appointment_id: uuid("appointment_id")
    .notNull()
    .unique()
    .references(() => appointments.id),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  payment_status: varchar("payment_status", { length: 20 })
    .notNull()
    .default("unpaid"),
  payment_method: varchar("payment_method", { length: 20 }),
  paid_at: timestamp("paid_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})