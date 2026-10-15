// ============================================================================
// Super Admin Gate — API-key protection for the /super-admin portal
// ============================================================================
// The portal operates on the Identity DB (provisions databases, issues
// licenses) and therefore needs its own auth, separate from tenant JWTs.
//
// Mechanism:
//   - A shared key is stored in the SUPER_ADMIN_KEY environment variable.
//   - A server action verifies a submitted key (timing-safe) and sets an
//     httpOnly cookie. Both the page and every super-admin server action
//     call isSuperAdminAuthed() before doing anything.
// ============================================================================

import { cookies } from "next/headers"
import { timingSafeEqual } from "node:crypto"

const SUPER_ADMIN_COOKIE = "super_admin_key"

/** Reads the configured key. Null when the env var is missing (gate closed). */
export function getExpectedSuperAdminKey(): string | null {
  const key = process.env.SUPER_ADMIN_KEY
  if (!key) return null
  return key
}

/** Timing-safe string comparison — no early-exit leaks. */
export function superAdminKeyMatches(submitted: string, expected: string): boolean {
  const a = Buffer.from(submitted, "utf8")
  const b = Buffer.from(expected, "utf8")
  if (a.length !== b.length) {
    // Compare against itself to keep constant time, then fail
    timingSafeEqual(a, a)
    return false
  }
  return timingSafeEqual(a, b)
}

/**
 * Gate check for pages and server actions.
 * Returns true only when SUPER_ADMIN_KEY is configured AND the request
 * carries a matching httpOnly cookie.
 */
export async function isSuperAdminAuthed(): Promise<boolean> {
  const expected = getExpectedSuperAdminKey()
  if (!expected) return false

  const cookieStore = await cookies()
  const provided = cookieStore.get(SUPER_ADMIN_COOKIE)?.value
  if (!provided) return false

  return superAdminKeyMatches(provided, expected)
}

/** Cookie name — used by the login/logout server actions. */
export function superAdminCookieName(): string {
  return SUPER_ADMIN_COOKIE
}
