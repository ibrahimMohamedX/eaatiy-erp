// ============================================================================
// Identity DB Schema — rbac_roles table
// ============================================================================
// Allows one user to have different roles across different tenants.
// Example: a user could be "admin" for tenant A and "doctor" for tenant B.
// ============================================================================

import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { tenants } from "./tenants"
import { users } from "./users"

export const rbac_roles = pgTable("rbac_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  tenant_id: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  role: varchar("role", { length: 50 }).notNull(),
})