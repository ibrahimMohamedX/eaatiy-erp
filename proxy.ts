// ============================================================================
// Proxy — JWT Enforcement & Role Routing (Next 16 `proxy` convention)
// ============================================================================
// Runs on every request except static assets, /login, /api/auth, /super-admin.
//
// Flow:
//   1. Extract JWT from meridian_access_token cookie
//   2. Verify RS256 signature using public key
//   3. Extract userId, tenantId, tenantSlug, role from claims
//   4. Inject tenant context into request headers for downstream consumption
//   5. Enforce role-based route prefix matching
//   6. Redirect unauthenticated users to /login
//   7. Redirect / to the user's role dashboard
//
// NOTE: /super-admin passes through here without a JWT — the portal enforces
// its own SUPER_ADMIN_KEY gate (see lib/auth/super-admin.ts).
// ============================================================================

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { PUBLIC_KEY } from "@/lib/license/public-key"
import type { AccessTokenPayload } from "@/lib/auth/types"

// ---------------------------------------------------------------------------
// Route configuration
// ---------------------------------------------------------------------------

/** Paths that are public ONLY at the exact path (no sub-paths implied). */
const PUBLIC_EXACT = new Set<string>([
  "/login",
  "/super-admin",
  "/favicon.ico",
  "/icon-light-32x32.png",
  "/icon-dark-32x32.png",
  "/icon.svg",
  "/apple-icon.png",
])

/** Path prefixes that are public including their sub-paths (/prefix/*). */
const PUBLIC_PREFIXES = [
  "/api/auth",
  "/_next",
  "/archai", // public brand assets (used on the login screen)
]

const ROLE_PATH_PREFIXES: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
  supervisor: "/supervisor",
}

const ROLE_REDIRECT: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
  supervisor: "/supervisor",
}

const ACCESS_TOKEN_COOKIE = "meridian_access_token"

// ---------------------------------------------------------------------------
// Helper: check if path is public (exact match, or a registered prefix —
// never a bare startsWith, which would leak /login-anything /super-admin-x)
// ---------------------------------------------------------------------------

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

// ---------------------------------------------------------------------------
// Helper: redirect to login preserving intended destination
// ---------------------------------------------------------------------------

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = "/login"

  // Preserve the original destination as a query param for post-login redirect
  if (
    request.nextUrl.pathname !== "/" &&
    request.nextUrl.pathname !== "/login"
  ) {
    url.searchParams.set("redirect", request.nextUrl.pathname)
  }

  return NextResponse.redirect(url)
}

// ---------------------------------------------------------------------------
// Helper: import RS256 public key for JWT verification
// ---------------------------------------------------------------------------

async function importPublicKey(): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PUBLIC KEY-----"
  const pemFooter = "-----END PUBLIC KEY-----"
  const pemContents = PUBLIC_KEY
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "")

  // Edge-runtime safe base64 decode — Buffer is NOT available in proxy.
  // atob returns a binary string where each char code is one byte.
  const binaryDer = Uint8Array.from(
    atob(pemContents),
    (c) => c.charCodeAt(0),
  )

  return await crypto.subtle.importKey(
    "spki",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  )
}

// ---------------------------------------------------------------------------
// Proxy entry point
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip proxy for public paths (exact + registered prefixes only)
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Extract and verify JWT from cookie
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) {
    return redirectToLogin(request)
  }

  let payload: AccessTokenPayload
  try {
    const publicKey = await importPublicKey()
    const result = await jwtVerify<AccessTokenPayload>(token, publicKey, {
      issuer: "meridian-clinic-cloud",
      algorithms: ["RS256"],
    })
    payload = result.payload
  } catch {
    // Token invalid or expired — redirect to login
    return redirectToLogin(request)
  }

  // Extract tenant context
  const { sub: userId, tenant_id: tenantId, tenant_slug: tenantSlug, role } = payload

  // Clone headers with tenant context injected
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", userId)
  requestHeaders.set("x-tenant-id", tenantId)
  requestHeaders.set("x-tenant-slug", tenantSlug)
  requestHeaders.set("x-user-role", role)

  // Role-based route enforcement
  const allowedPrefix = ROLE_PATH_PREFIXES[role]
  if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
    // User is trying to access a route outside their role
    const url = request.nextUrl.clone()
    url.pathname = ROLE_REDIRECT[role] ?? "/login"
    return NextResponse.redirect(url)
  }

  // Root path — redirect to role dashboard
  if (pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = ROLE_REDIRECT[role] ?? "/login"
    return NextResponse.redirect(url)
  }

  // Pass through with injected tenant context headers
  return NextResponse.next({ request: { headers: requestHeaders } })
}

// ---------------------------------------------------------------------------
// Matcher: apply to all routes except static files
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon-.*\\.png|apple-icon\\.png).*)",
  ],
}
