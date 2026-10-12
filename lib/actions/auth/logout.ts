"use server"

// ============================================================================
// Server Action: Logout — Phase 2D
// ============================================================================
// Clears the access token and refresh token cookies.
// Redirects to /login.
// ============================================================================

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const ACCESS_TOKEN_COOKIE = "meridian_access_token"
const REFRESH_TOKEN_COOKIE = "meridian_refresh_token"

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
  redirect("/login")
}