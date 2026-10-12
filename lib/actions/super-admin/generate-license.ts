"use server"

// ============================================================================
// Server Action: Generate License — Super Admin
// ============================================================================
// Generates an RS256 JWT license token for a tenant:
//   1. Reads installation_id and highest_issue_sequence from license_state
//   2. Increments issue_sequence atomically
//   3. Signs a JWT with claims: iss, sub(tenant_id), iat, exp, seq,
//      installation_id, tier, max_users, features, grace_days
//   4. Updates license_state with the token and new sequence
//
// The private key is read from the JWT_PRIVATE_KEY environment variable.
// ============================================================================

import { SignJWT } from "jose"
import { getIdentityPool } from "@/lib/db/connection"
import { getTenantById } from "@/lib/db/repositories/identity/tenants"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerateLicenseInput {
  tenantId: string
  expiryDays?: number // defaults to 365
  maxUsers?: number // defaults based on tier
  features?: string[] // e.g. ["pharmacy", "lab", "telemedicine"]
  graceDays?: number // defaults to 7
}

export interface LicenseClaims {
  iss: string // "meridian-clinic-cloud"
  sub: string // tenant UUID
  iat: number // epoch seconds
  exp: number // epoch seconds
  seq: number // issue sequence (monotonic counter)
  installation_id: string
  tier: string
  max_users: number
  features: string[]
  grace_days: number
}

export type GenerateLicenseResult =
  | { success: true; data: { licenseToken: string; claims: LicenseClaims } }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Defaults per tier
// ---------------------------------------------------------------------------

const TIER_DEFAULTS: Record<string, { maxUsers: number; features: string[] }> = {
  trial: { maxUsers: 3, features: ["core"] },
  basic: { maxUsers: 10, features: ["core", "pharmacy"] },
  premium: { maxUsers: 50, features: ["core", "pharmacy", "lab", "telemedicine", "api"] },
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function generateLicense(
  input: GenerateLicenseInput,
): Promise<GenerateLicenseResult> {
  try {
    const pool = getIdentityPool()

    // 1. Read tenant for tier info
    const tenant = await getTenantById(pool, input.tenantId)
    if (!tenant) {
      return { success: false, error: "Tenant not found" }
    }
    if (tenant.status !== "active") {
      return { success: false, error: "Cannot generate license for a non-active tenant" }
    }

    // 2. Read current license_state
    const stateResult = await pool.query<{
      installation_id: string
      highest_issue_sequence: number
    }>(
      `SELECT installation_id, highest_issue_sequence
       FROM license_state WHERE tenant_id = $1`,
      [input.tenantId],
    )

    if (stateResult.rows.length === 0) {
      return { success: false, error: "No license_state record found for this tenant" }
    }

    const { installation_id, highest_issue_sequence } = stateResult.rows[0]

    // 3. Increment sequence and compute claims
    const newSeq = highest_issue_sequence + 1
    const tierDefaults = TIER_DEFAULTS[tenant.subscription_tier] ?? TIER_DEFAULTS.basic
    const now = Math.floor(Date.now() / 1000)
    const expiryDays = input.expiryDays ?? 365

    const claims: LicenseClaims = {
      iss: "meridian-clinic-cloud",
      sub: input.tenantId,
      iat: now,
      exp: now + expiryDays * 86400,
      seq: newSeq,
      installation_id,
      tier: tenant.subscription_tier,
      max_users: input.maxUsers ?? tierDefaults.maxUsers,
      features: input.features ?? tierDefaults.features,
      grace_days: input.graceDays ?? 7,
    }

    // 4. Sign JWT
    const privateKeyPem = process.env.JWT_PRIVATE_KEY
    if (!privateKeyPem) {
      return { success: false, error: "JWT_PRIVATE_KEY environment variable is not set" }
    }

    const privateKey = await importPrivateKey(privateKeyPem)
    const licenseToken = await new SignJWT(claims as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt(claims.iat)
      .setExpirationTime(claims.exp)
      .sign(privateKey)

    // 5. Update license_state with the new token and sequence
    await pool.query(
      `UPDATE license_state
       SET license_token = $2, highest_issue_sequence = $3
       WHERE tenant_id = $1`,
      [input.tenantId, licenseToken, newSeq],
    )

    return {
      success: true,
      data: { licenseToken, claims },
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate license"
    console.error("generateLicense error:", message)
    return { success: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// Helper: import RS256 private key from PEM string
// ---------------------------------------------------------------------------

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Convert PEM to binary
  const pemHeader = "-----BEGIN PRIVATE KEY-----"
  const pemFooter = "-----END PRIVATE KEY-----"
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "")

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  )
}

// Helper: base64 decode (atob) for Node.js
function atob(data: string): string {
  return Buffer.from(data, "base64").toString("binary")
}