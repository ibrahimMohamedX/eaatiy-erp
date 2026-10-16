// ============================================================================
// Tenant DB Schema — salaries table
// ============================================================================
// Monthly payroll record per staff member. Admin sets base/bonuses/
// deductions and drives the lifecycle: draft → approved → paid.
// period_month is stored as the FIRST day of the month (e.g. 2026-10-01).
// ============================================================================

import {
  pgTable,
  uuid,
  varchar,
  date,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core"
import { staffMembers } from "./staff-members"

export const SALARY_STATUSES = ["draft", "approved", "paid"] as const
export type SalaryStatus = (typeof SALARY_STATUSES)[number]

export const salaries = pgTable("salaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  staff_member_id: uuid("staff_member_id")
    .notNull()
    .references(() => staffMembers.id),
  period_month: date("period_month").notNull(), // first day of month
  base_amount: numeric("base_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  bonuses: numeric("bonuses", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  deductions: numeric("deductions", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  paid_at: timestamp("paid_at", { withTimezone: true }),
  notes: varchar("notes", { length: 500 }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
