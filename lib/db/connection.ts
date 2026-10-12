// ============================================================================
// Database Connection Manager — Phase 2A
// ============================================================================
// Manages connection pools for:
//   - Identity DB: single shared pool, always connected
//   - Tenant DBs: lazy pool-per-tenant via Map<string, Pool>, 15-min idle eviction
//
// Environment variables:
//   IDENTITY_DATABASE_URL — for the shared Identity DB
//   TENANT_DATABASE_URL_PREFIX — prefix used to build per-tenant URLs
//     e.g. "postgres://meridian:pass@localhost:5432" — tenant slug is appended as DB name
// ============================================================================

import { Pool } from "pg"

// ---------------------------------------------------------------------------
// Identity DB pool (singleton)
// ---------------------------------------------------------------------------

let identityPool: Pool | null = null

export function getIdentityPool(): Pool {
  if (!identityPool) {
    const url = process.env.IDENTITY_DATABASE_URL
    if (!url) {
      throw new Error(
        "IDENTITY_DATABASE_URL environment variable is not set. " +
          "Example: postgres://meridian:meridian_dev@localhost:5432/meridian_identity",
      )
    }
    identityPool = new Pool({
      connectionString: url,
      max: 10,
      idleTimeoutMillis: 30_000,
    })
  }
  return identityPool
}

// ---------------------------------------------------------------------------
// Tenant Pool Registry (lazy, with idle eviction)
// ---------------------------------------------------------------------------

interface TenantPoolEntry {
  pool: Pool
  lastUsed: number
}

const tenantPools = new Map<string, TenantPoolEntry>()
const TENANT_POOL_IDLE_EVICTION_MS = 15 * 60 * 1000 // 15 minutes

export function getTenantPool(tenantSlug: string): Pool {
  const now = Date.now()
  const existing = tenantPools.get(tenantSlug)
  if (existing) {
    existing.lastUsed = now
    return existing.pool
  }

  const prefix = process.env.TENANT_DATABASE_URL_PREFIX
  if (!prefix) {
    throw new Error(
      "TENANT_DATABASE_URL_PREFIX environment variable is not set. " +
        "Example: postgres://meridian:meridian_dev@localhost:5432",
    )
  }

  const pool = new Pool({
    connectionString: `${prefix}/tenant_${tenantSlug}`,
    max: 5,
    idleTimeoutMillis: 30_000,
  })

  tenantPools.set(tenantSlug, { pool, lastUsed: now })
  return pool
}

// ---------------------------------------------------------------------------
// Idle Eviction
// ---------------------------------------------------------------------------

let evictionTimer: ReturnType<typeof setInterval> | null = null

export function evictIdlePools(): void {
  const now = Date.now()
  for (const [slug, entry] of tenantPools) {
    if (now - entry.lastUsed > TENANT_POOL_IDLE_EVICTION_MS) {
      void entry.pool.end()
      tenantPools.delete(slug)
    }
  }
}

export function startEvictionTimer(): void {
  if (evictionTimer) return
  // Run eviction every 5 minutes
  evictionTimer = setInterval(evictIdlePools, 5 * 60 * 1000)
}

export function stopEvictionTimer(): void {
  if (evictionTimer) {
    clearInterval(evictionTimer)
    evictionTimer = null
  }
}

// ---------------------------------------------------------------------------
// Graceful Shutdown
// ---------------------------------------------------------------------------

export async function closeAllPools(): Promise<void> {
  if (evictionTimer) {
    clearInterval(evictionTimer)
    evictionTimer = null
  }
  const promises: Promise<void>[] = []
  if (identityPool) {
    promises.push(identityPool.end())
    identityPool = null
  }
  for (const [, entry] of tenantPools) {
    promises.push(entry.pool.end())
  }
  tenantPools.clear()
  await Promise.all(promises)
}