// ============================================================================
// Identity DB Schema — system_state table (singleton)
// ============================================================================
// Platform-wide state controlled by the super admin:
//   operational  — everything works normally
//   maintenance  — every tenant action is denied (read-only freeze)
//   locked       — full system lock, every tenant action is denied
// Enforced in getTenantContext() with a short-lived in-memory cache so the
// lock applies automatically and instantly to ALL server actions.
// ============================================================================

import {
  pgTable,
  integer,
  varchar,
  timestamp,
  check,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const SYSTEM_STATES = ["operational", "maintenance", "locked"] as const
export type SystemState = (typeof SYSTEM_STATES)[number]

export const systemState = pgTable(
  "system_state",
  {
    id: integer("id").primaryKey(), // CHECK(id = 1) — singleton
    state: varchar("state", { length: 20 }).notNull().default("operational"),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("system_state_singleton", sql`${table.id} = 1`),
    check(
      "system_state_values",
      sql`${table.state} IN ('operational', 'maintenance', 'locked')`,
    ),
  ],
)
