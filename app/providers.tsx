"use client"

import { I18nProvider } from "@/lib/i18n/i18n-provider"
import { FloatingActionButton } from "@/components/floating-action-button"
import { AuthProvider } from "@/lib/auth/auth-context"

/**
 * Providers — client-component wrapper that hydrates theme/i18n state,
 * mounts the Floating Action Button, and provides auth session context.
 *
 * AuthProvider fills session via GET /api/auth/session on mount.
 * Theme script is injected server-side via layout.tsx <head> to avoid
 * "script tag inside React component" warnings and hydration mismatches.
 *
 * Separated from the server layout so the "use client" boundary is clean.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider initialSession={null}>
      <I18nProvider>
        {children}
        <FloatingActionButton />
      </I18nProvider>
    </AuthProvider>
  )
}