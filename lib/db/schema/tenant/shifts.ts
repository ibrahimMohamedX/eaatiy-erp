// ============================================================================
// Tenant DB Schema — shifts table
// ============================================================================
// Weekly shift template per staff member. Admin defines which days/hours
// each staff member works (doctors, receptionists, supervisors and others).
// day_of_week: 0 = Sunday … 6 = Saturday (matches JS Date.getDay()).
// start_time/end_time are plain times inside the clinic's local day.
// ============================================================================

import {
  pgTable,
  uuid,
  integer,
  time,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core"
import { staffMembers } from "./staff-members"

export const shifts = pgTable("shifts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").notNull(),
  staff_member_id: uuid("staff_member_id")
    .notNull()
    .references(() => staffMembers.id),
  day_of_week: integer("day_of_week").notNull(), // 0=Sunday … 6=Saturday
  start_time: time("start_time").notNull(),
  end_time: time("end_time").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
