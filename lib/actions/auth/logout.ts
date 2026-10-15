"use server"

// ============================================================================
// Server Action: Logout — Phase 2D
// ============================================================================
// Clears the access token cookie and redirects to /login.
// ============================================================================

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const ACCESS_TOKEN_COOKIE = "meridian_access_token"

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  redirect("/login")
}