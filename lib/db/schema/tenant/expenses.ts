// ============================================================================
// Tenant DB Schema — expenses table
// ============================================================================
// Clinic operating expenses (rent, supplies, maintenance, …).
// Admin owns full CRUD; every row records who logged it.
// ============================================================================

import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core"

export const EXPENSE_CATEGORIES = [
  "rent",
  "supplies",
  "maintenance",
  "salaries",
  "utilities",
  "marketing",
  "equipment",
  "other",
] as const
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  category: varchar("category", { length: 30 }).notNull().default("other"),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  expense_date: date("expense_date").notNull(),
  recorded_by: uuid("recorded_by"), // Identity DB users.id — admin who logged it
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
