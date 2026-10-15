"use server"

// ============================================================================
// Server Action: Login — Phase 2D
// ============================================================================
// Validates credentials against the Identity DB, creates JWT tokens,
// and sets httpOnly cookies via the response headers.
// ============================================================================

import { cookies } from "next/headers"
import { compare } from "bcryptjs"
import { getIdentityPool } from "@/lib/db/connection"
import { getUserByEmail } from "@/lib/db/repositories/identity/users"
import { getTenantById } from "@/lib/db/repositories/identity/tenants"
import { signAccessToken } from "@/lib/auth/jwt"
import type { LoginCredentials, LoginResult } from "@/lib/auth/types"

// ---------------------------------------------------------------------------
// Cookie configuration
// ---------------------------------------------------------------------------

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
}

const ACCESS_TOKEN_COOKIE = "meridian_access_token"

// ---------------------------------------------------------------------------
// Role → dashboard mapping
// ---------------------------------------------------------------------------

const ROLE_REDIRECT: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  try {
    const pool = getIdentityPool()

    // 1. Look up user by email
    const user = await getUserByEmail(pool, credentials.email)
    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    if (!user.is_active) {
      return {
        success: false,
        error: "This account has been deactivated. Contact your administrator.",
      }
    }

    // 2. Verify password
    const isValid = await compare(credentials.password, user.password_hash)
    if (!isValid) {
      return { success: false, error: "Invalid email or password" }
    }

    // 3. Get tenant info
    const tenant = await getTenantById(pool, user.tenant_id)
    if (!tenant) {
      return { success: false, error: "Tenant not found" }
    }
    if (tenant.status !== "active") {
      return {
        success: false,
        error: `This clinic's account is ${tenant.status}. Contact support.`,
      }
    }

    // 4. Create the access token (single-token sessions; 24h expiry.
    //    A refresh-tokens table + rotation flow is a Phase 4 follow-up.)
    const accessToken = await signAccessToken({
      userId: user.id,
      tenantId: user.tenant_id,
      tenantSlug: tenant.slug,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    })

    // 5. Set cookie
    const cookieStore = await cookies()
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 24 * 3600, // 24 hours
    })

    const redirectUrl = ROLE_REDIRECT[user.role] ?? "/receptionist"
    return { success: true, redirectUrl }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed"
    console.error("login error:", message)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}