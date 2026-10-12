// ============================================================================
// Drizzle Kit Configuration — Tenant DB Template
// ============================================================================
// Separate config for tenant schema migrations. This is run once per new
// tenant database at provision time (Phase 2C Super Admin flow).
//
// Usage:
// npx drizzle-kit generate --config=drizzle.tenant.config.ts
// npx drizzle-kit push    --config=drizzle.tenant.config.ts  # for seed/dev
// ============================================================================

import type { Config } from "drizzle-kit"

export default {
  schema: "./lib/db/schema/tenant/*.ts",
  out: "./drizzle/tenant",
  dialect: "postgresql",
  dbCredentials: {
    // Override via TENANT_DATABASE_URL env var to target a specific tenant DB
    url: process.env.TENANT_DATABASE_URL ??
      "postgres://meridian:meridian_dev@localhost:5432/tenant_northgate",
  },
} satisfies Config