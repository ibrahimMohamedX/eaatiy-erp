// ============================================================================
// Auth Types — Phase 2D
// ============================================================================
// Shared types for JWT payload, session, and auth context.
// ============================================================================

import type { UserRole } from "@/lib/types"

/** Claims embedded in the access token JWT */
export interface AccessTokenPayload {
  sub: string // user UUID
  tenant_id: string
  tenant_slug: string
  email: string
  full_name: string
  role: UserRole
  iat: number // epoch seconds
  exp: number // epoch seconds
}

/** Session data extracted from a verified access token */
export interface Session {
  userId: string
  tenantId: string
  tenantSlug: string
  email: string
  fullName: string
  role: UserRole
}

/** Credentials submitted from the login form */
export interface LoginCredentials {
  email: string
  password: string
  tenantSlug?: string // optional for super admin
}

/** Result of a login attempt */
export type LoginResult =
  | { success: true; redirectUrl: string }
  | { success: false; error: string }