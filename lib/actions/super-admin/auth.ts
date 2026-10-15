"use server"

// ============================================================================
// Server Actions: Super Admin Auth — API key login/logout
// ============================================================================
// Verifies the submitted key against the SUPER_ADMIN_KEY env var
// (timing-safe) and issues an httpOnly session cookie. The portal page and
// every super-admin server action re-check isSuperAdminAuthed() — this
// action is the ONLY place that can mint the cookie.
// ============================================================================

import { cookies } from "next/headers"
import {
  getExpectedSuperAdminKey,
  superAdminKeyMatches,
  superAdminCookieName,
} from "@/lib/auth/super-admin"

export type SuperAdminAuthResult =
  | { success: true }
  | { success: false; error: string }

export async function submitSuperAdminKey(key: string): Promise<SuperAdminAuthResult> {
  const expected = getExpectedSuperAdminKey()
  if (!expected) {
    return {
      success: false,
      error: "Server is missing SUPER_ADMIN_KEY — the portal is locked.",
    }
  }

  if (!key || !superAdminKeyMatches(key, expected)) {
    return { success: false, error: "Invalid access key" }
  }

  const cookieStore = await cookies()
  cookieStore.set(superAdminCookieName(), key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 3600, // 8-hour console session
  })

  return { success: true }
}

export async function logoutSuperAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(superAdminCookieName())
}
