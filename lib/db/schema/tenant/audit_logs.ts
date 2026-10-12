// ============================================================================
// Tenant DB Schema — audit_logs table
// ============================================================================
// Immutable audit trail for every data mutation in a tenant's database.
// `changes` is a JSONB array of AuditChange objects capturing before/after diffs.
// ============================================================================

import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core"

export const audit_logs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  actor_id: uuid("actor_id").notNull(),
  action: varchar("action", { length: 20 }).notNull(),
  target_table: varchar("target_table", { length: 100 }).notNull(),
  target_row_id: varchar("target_row_id", { length: 255 }).notNull(),
  summary: varchar("summary", { length: 500 }).notNull(),
  changes: jsonb("changes"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})