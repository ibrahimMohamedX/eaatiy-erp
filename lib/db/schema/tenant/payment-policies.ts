// ============================================================================
// Tenant DB Schema — payment_policies table (singleton per tenant)
// ============================================================================
// The admin decides the clinic's payment rules:
//   - WHO is responsible for paying (patient / companion / organization)
//   - WHICH appointment statuses require payment (new consultation,
//     follow-up — each on its own toggle)
//   - default fees for each appointment type
// One row per tenant (UNIQUE tenant_id). Read by reception/booking flow.
// ============================================================================

import {
  pgTable,
  uuid,
  varchar,
  boolean,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core"

export const PAYER_TYPES = ["patient", "companion", "organization"] as const
export type PayerType = (typeof PAYER_TYPES)[number]

export const paymentPolicies = pgTable("payment_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull().unique(),
  payer_type: varchar("payer_type", { length: 30 })
    .notNull()
    .default("patient"),
  new_consultation_requires_payment: boolean(
    "new_consultation_requires_payment",
  )
    .notNull()
    .default(true),
  followup_requires_payment: boolean("followup_requires_payment").notNull()
    .default(false),
  new_consultation_fee: numeric("new_consultation_fee", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  followup_fee: numeric("followup_fee", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  updated_by: uuid("updated_by"), // Identity DB users.id — admin who last saved
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
