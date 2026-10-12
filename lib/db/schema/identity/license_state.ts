// ============================================================================
// Identity DB Schema — license_state table
// ============================================================================
// Singleton per tenant. Enforced by CHECK(id = 1) constraint.
// This table lives in the Identity DB and tracks license enforcement state
// for on-premise installations (Phase 3+).
// ============================================================================

import {
  pgTable,
  integer,
  uuid,
  text,
  timestamp,
  boolean,
  check,
} from "drizzle-orm/pg-core"
import { tenants } from "./tenants"

export const license_state = pgTable("license_state", {
  id: integer("id").primaryKey(), // CHECK(id = 1) — singleton
  tenant_id: uuid("tenant_id")
    .notNull()
    .unique()
    .references(() => tenants.id),
  installation_id: uuid("installation_id").notNull(),
  license_token: text("license_token"),
  highest_issue_sequence: integer("highest_issue_sequence").notNull().default(0),
  heartbeat_hash: text("heartbeat_hash"),
  heartbeat_at: timestamp("heartbeat_at", { withTimezone: true }),
  locked_out: boolean("locked_out").notNull().default(false),
  lockout_reason: text("lockout_reason"),
})