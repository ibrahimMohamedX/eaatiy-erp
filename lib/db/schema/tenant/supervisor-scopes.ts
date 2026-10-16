// ============================================================================
// Tenant DB Schema — supervisor_scopes table
// ============================================================================
// Admin-defined access matrix for each supervisor (مشرف). One row per
// (supervisor user, clinic section). The admin picks which sections a
// supervisor can see (can_view) and edit (can_edit). user_id references the
// Identity DB users table (loose — no cross-DB FK).
// ============================================================================

import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core"

export const SUPERVISOR_SECTIONS = [
  "queue",
  "patients",
  "appointments",
  "expenses",
  "salaries",
  "staff",
  "shifts",
] as const
export type SupervisorSection = (typeof SUPERVISOR_SECTIONS)[number]

export const supervisorScopes = pgTable("supervisor_scopes", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  user_id: uuid("user_id").notNull(), // Identity DB users.id (role=supervisor)
  section: varchar("section", { length: 30 }).notNull(),
  can_view: boolean("can_view").notNull().default(true),
  can_edit: boolean("can_edit").notNull().default(false),
  assigned_by: uuid("assigned_by"), // Identity DB users.id — admin who set it
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
