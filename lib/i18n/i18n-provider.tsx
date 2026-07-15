"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { Locale } from "./config"
import { DEFAULT_LOCALE, LOCALE_CONFIGS } from "./config"
import { I18nContext } from "./use-t"
import en from "./en"
import ar from "./ar"
import type { Translations } from "./use-t"

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = "clinic-locale"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const dictionaries: Record<Locale, Translations> = { en, ar }

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "en" || stored === "ar") return stored
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_LOCALE
}

function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // silently ignore
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * I18nProvider — wraps the app to supply locale state, translation dictionary,
 * and RTL direction via React context.
 *
 * Place in the root layout so all components can access `useT()`.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Always start with the default locale for SSR consistency — the real stored
  // preference is applied in useEffect on the client, avoiding hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [hydrated, setHydrated] = useState(false)

  const dir = useMemo(() => LOCALE_CONFIGS[locale].dir, [locale])
  const t = useMemo(() => dictionaries[locale], [locale])

  // On first client render, sync the stored locale (if different from default)
  useEffect(() => {
    const stored = readStoredLocale()
    if (stored !== DEFAULT_LOCALE) {
      setLocaleState(stored)
    }
    setHydrated(true)
  }, [])

  // Apply dir + lang attributes to <html> whenever locale changes
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute("dir", dir)
    html.setAttribute("lang", locale)
    // RTL-specific class for CSS hooks
    if (dir === "rtl") {
      html.classList.add("dir-rtl")
    } else {
      html.classList.remove("dir-rtl")
    }
  }, [dir, locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    persistLocale(next)
  }, [])

  const value = useMemo(
    () => ({ locale, t, dir, setLocale }),
    [locale, t, dir, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}