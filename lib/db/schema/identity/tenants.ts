// ============================================================================
// Identity DB Schema — tenants table
// ============================================================================
// The tenants table lives in the shared Identity DB, not in tenant databases.
// It is the single source of truth for tenant lifecycle management.
// ============================================================================

import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core"

/** Subscription tiers — runtime const lives here (NOT in "use server" files,
 *  which may only export async functions). */
export const SUBSCRIPTION_TIERS = ["trial", "basic", "premium"] as const
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  address_line_1: varchar("address_line_1", { length: 255 }).notNull(),
  address_line_2: varchar("address_line_2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  logo_url: varchar("logo_url", { length: 500 }),
  subscription_tier: varchar("subscription_tier", {
    length: 20,
  })
    .notNull()
    .default("trial"),
  status: varchar("status", {
    length: 20,
  })
    .notNull()
    .default("provisioning"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})