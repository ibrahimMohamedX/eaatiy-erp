// ============================================================================
// Drizzle Kit Configuration — Phase 2A
// ============================================================================
// Points Drizzle Kit at our schema files for migration generation.
// Two separate configs required: one for Identity DB, one for Tenant template.
// This file covers the Identity DB schema.
//
// Usage:
//   npx drizzle-kit generate --config=drizzle.config.ts
//   npx drizzle-kit push   --config=drizzle.config.ts   # dev-only, skips migration files
// ============================================================================

import type { Config } from "drizzle-kit"

export default {
  schema: "./lib/db/schema/identity/*.ts",
  out: "./drizzle/identity",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.IDENTITY_DATABASE_URL ??
      "postgres://meridian:meridian_dev@localhost:5432/meridian_identity",
  },
} satisfies Config