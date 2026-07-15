"use client"

import { I18nProvider } from "@/lib/i18n/i18n-provider"
import { FloatingActionButton } from "@/components/floating-action-button"

/**
 * Providers — client-component wrapper that hydrates theme/i18n state
 * and mounts the Floating Action Button.
 *
 * Theme script is injected server-side via layout.tsx <head> to avoid
 * "script tag inside React component" warnings and hydration mismatches.
 *
 * Separated from the server layout so the "use client" boundary is clean.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      {children}
      <FloatingActionButton />
    </I18nProvider>
  )
}