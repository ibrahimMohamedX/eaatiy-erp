// ============================================================================
// JWT Utilities — Phase 2D
// ============================================================================
// Signs and verifies RS256 JWTs using:
//   - Private key from JWT_PRIVATE_KEY env var (for signing)
//   - Public key from lib/license/public-key.ts (for verification)
//
// Access tokens: 24-hour expiry, stored in httpOnly cookie
// Refresh tokens: 7-day expiry, validated against Identity DB
// ============================================================================

import { SignJWT, jwtVerify } from "jose"
import { PUBLIC_KEY } from "@/lib/license/public-key"
import type { AccessTokenPayload, Session } from "./types"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACCESS_TOKEN_EXPIRY = "24h"
const ISSUER = "meridian-clinic-cloud"

// ---------------------------------------------------------------------------
// Key import helpers
// ---------------------------------------------------------------------------

async function importPrivateKey(): Promise<CryptoKey> {
  const pem = process.env.JWT_PRIVATE_KEY
  if (!pem) {
    throw new Error("JWT_PRIVATE_KEY environment variable is not set")
  }
  // Support base64-encoded PEM in env vars (avoids multi-line issues)
  const raw = pem.startsWith("-----BEGIN") ? pem : Buffer.from(pem, "base64").toString("utf-8")
  return await importPrivateKeyFromPem(raw)
}

async function importPublicKey(): Promise<CryptoKey> {
  return await importPublicKeyFromPem(PUBLIC_KEY)
}

async function importPrivateKeyFromPem(pem: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PRIVATE KEY-----"
  const pemFooter = "-----END PRIVATE KEY-----"
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "")

  const binaryDer = Uint8Array.from(atobPem(pemContents), (c) => c.charCodeAt(0))

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  )
}

async function importPublicKeyFromPem(pem: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PUBLIC KEY-----"
  const pemFooter = "-----END PUBLIC KEY-----"
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "")

  const binaryDer = Uint8Array.from(atobPem(pemContents), (c) => c.charCodeAt(0))

  return await crypto.subtle.importKey(
    "spki",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  )
}

function atobPem(data: string): string {
  return Buffer.from(data, "base64").toString("binary")
}

// ---------------------------------------------------------------------------
// Signing
// ---------------------------------------------------------------------------

export async function signAccessToken(session: Session): Promise<string> {
  const privateKey = await importPrivateKey()
  const now = Math.floor(Date.now() / 1000)

  const payload: AccessTokenPayload = {
    sub: session.userId,
    tenant_id: session.tenantId,
    tenant_slug: session.tenantSlug,
    email: session.email,
    full_name: session.fullName,
    role: session.role,
    iat: now,
    exp: now + 24 * 3600, // 24 hours
  }

  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setIssuedAt(now)
    .setExpirationTime(payload.exp)
    .sign(privateKey)
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const publicKey = await importPublicKey()
  const { payload } = await jwtVerify<AccessTokenPayload>(token, publicKey, {
    issuer: ISSUER,
    algorithms: ["RS256"],
  })
  return payload
}

// ---------------------------------------------------------------------------
// Session extraction (used by proxy — no DB lookup needed)
// ---------------------------------------------------------------------------

export async function extractSession(token: string): Promise<Session | null> {
  try {
    const payload = await verifyAccessToken(token)
    return {
      userId: payload.sub,
      tenantId: payload.tenant_id,
      tenantSlug: payload.tenant_slug,
      email: payload.email,
      fullName: payload.full_name,
      role: payload.role,
    }
  } catch {
    return null
  }
}