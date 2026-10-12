// ============================================================================
// Tenant DB Schema — transaction_watermark table
// ============================================================================
// Append-only ledger for data integrity verification. Each row records the
// previous row's hash, forming a tamper-evident hash chain.
// Used by the license guard binary for anti-time-travel detection (Phase 3).
// ============================================================================

import { pgTable, bigserial, varchar, timestamp } from "drizzle-orm/pg-core"

export const transaction_watermark = pgTable("transaction_watermark", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  table_name: varchar("table_name", { length: 100 }).notNull(),
  record_id: varchar("record_id", { length: 255 }).notNull(),
  recorded_at: timestamp("recorded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  previous_watermark_hash: varchar("previous_watermark_hash", {
    length: 64, // SHA-256 hex
  }),
})