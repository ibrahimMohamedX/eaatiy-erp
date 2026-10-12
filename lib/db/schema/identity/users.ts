// ============================================================================
// Identity DB Schema — users table
// ============================================================================
// Users belong to a tenant (FK → tenants.id). A single user can have multiple
// rbac_roles rows if they need access across multiple tenants.
// ============================================================================

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core"
import { tenants } from "./tenants"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: text("password_hash").notNull(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  avatar_url: varchar("avatar_url", { length: 500 }),
  role: varchar("role", { length: 50 }).notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})