// ============================================================================
// Root Route — Phase 2D
// ============================================================================
// Reads the JWT access token cookie to determine the user's role and
// redirects to the appropriate role dashboard.
//
// Falls back to /login if no valid token is present.
// ============================================================================

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { extractSession } from "@/lib/auth/jwt"

const ROLE_REDIRECT: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
}

export default async function RootPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("meridian_access_token")?.value

  if (!token) {
    redirect("/login")
  }

  const session = await extractSession(token)
  if (!session) {
    redirect("/login")
  }

  const target = ROLE_REDIRECT[session.role] ?? "/login"
  redirect(target)
}