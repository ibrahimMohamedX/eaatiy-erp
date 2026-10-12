// ============================================================================
// API Route: GET /api/auth/session — Phase 2D
// ============================================================================
// Returns the current session from the verified JWT in the cookie.
// Used by the AuthContext client-side refetch() to hydrate session state.
// The middleware already verified the JWT — this endpoint just re-reads it.
// ============================================================================

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { extractSession } from "@/lib/auth/jwt"
import type { Session } from "@/lib/auth/types"

const ACCESS_TOKEN_COOKIE = "meridian_access_token"

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    if (!token) {
      return NextResponse.json({ session: null }, { status: 200 })
    }

    const session: Session | null = await extractSession(token)

    return NextResponse.json({ session }, { status: 200 })
  } catch {
    return NextResponse.json({ session: null }, { status: 200 })
  }
}