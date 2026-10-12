"use client"

// ============================================================================
// Auth Context Provider — Phase 2D
// ============================================================================
// Provides session state to client components. Reads JWT claims from the
// middleware-injected API route or a dedicated server-action cookie reader.
//
// Pattern: Provider wraps the app layout. Children use `useAuth()` to access
// session (userId, tenantId, tenantSlug, role, etc.) without re-reading cookies.
// ============================================================================

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "@/lib/auth/types"
import { logout as logoutAction } from "@/lib/actions/auth/logout"

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  session: Session | null
  isLoading: boolean
  refetch: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ---------------------------------------------------------------------------
// Hook: useAuth
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Provider props
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode
  initialSession: Session | null
}

// ---------------------------------------------------------------------------
// Role → dashboard mapping
// ---------------------------------------------------------------------------

const ROLE_DASHBOARD: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isLoading, setIsLoading] = useState(false)

  // Re-fetch session from a lightweight endpoint that returns the current JWT payload.
  // Falls back to a no-op in Phase 2D — we trust the initial server-read session.
  const refetch = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/session")
      if (res.ok) {
        const data = (await res.json()) as { session: Session | null }
        setSession(data.session)
      }
    } catch {
      // Session stays as-is; middleware will enforce on next navigation
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLogout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await logoutAction()
    } catch {
      // logoutAction calls redirect() so this catch is for edge cases
    } finally {
      setSession(null)
      router.push("/login")
      setIsLoading(false)
    }
  }, [router])

  // Sync session if initialSession changes (rare — SSR refresh)
  useEffect(() => {
    setSession(initialSession)
  }, [initialSession])

  // Auto-fetch session on mount if no initial session was provided
  useEffect(() => {
    if (!initialSession) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, isLoading, refetch, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  )
}