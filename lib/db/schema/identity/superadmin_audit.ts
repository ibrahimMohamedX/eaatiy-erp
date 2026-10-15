// ============================================================================
// Identity DB Schema — super_admin_audit table
// ============================================================================
// Records every Super Admin action (provision, suspend/activate/revoke,
// license generation/revocation, portal login) at the platform level.
// Tenant DBs record their own audit_logs; this table is the control-room log.
// ============================================================================

import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core"

export const superAdminAudit = pgTable("super_admin_audit", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Fixed sentinel UUID — the portal auth is a shared key, not a user row */
  actor_id: uuid("actor_id").notNull(),
  /** The tenant the action affected (provision/suspend/license targets) */
  tenant_id: uuid("tenant_id").notNull(),
  /** insert | update | delete (mirrors the tenant audit_logs action enum) */
  action: varchar("action", { length: 20 }).notNull(),
  target_table: varchar("target_table", { length: 50 }).notNull(),
  target_row_id: varchar("target_row_id", { length: 100 }).notNull(),
  summary: text("summary").notNull(),
  changes: jsonb("changes"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
