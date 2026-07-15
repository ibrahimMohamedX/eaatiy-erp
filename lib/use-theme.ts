"use client"

import { useState, useEffect, useCallback } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = "light" | "dark" | "system"

export interface ThemeState {
  /** The resolved theme actually applied to <html> ("light" | "dark") */
  resolved: "light" | "dark"
  /** The user's preference setting */
  setting: Theme
  /** Switch to a new theme setting */
  setTheme: (theme: Theme) => void
}

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = "clinic-theme"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function resolveTheme(setting: Theme): "light" | "dark" {
  if (setting === "system") return getSystemPreference()
  return setting
}

function applyThemeClass(resolved: "light" | "dark") {
  const root = document.documentElement
  if (resolved === "dark") {
    root.classList.add("dark")
    root.classList.remove("light")
  } else {
    root.classList.add("light")
    root.classList.remove("dark")
  }
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system"
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {
    // localStorage unavailable (private browsing, etc.) — fall through
  }
  return "system"
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // silently ignore
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useTheme — manages light/dark/system theme with localStorage persistence
 * and real-time <html> class toggling.
 *
 * Usage:
 *   const { resolved, setting, setTheme } = useTheme()
 *   setTheme("dark")  // force dark
 *   setTheme("system") // follow OS preference
 */
export function useTheme(): ThemeState {
  // Always default to "system" for consistent SSR render — the real stored
  // preference is synced in useEffect on the client, avoiding hydration mismatch.
  // The <head> inlined theme script already applies the correct class before
  // React hydrates, so we just need to match React's first render.
  const [setting, setSettingState] = useState<Theme>("system")
  const [resolved, setResolved] = useState<"light" | "dark">("light")
  const [hydrated, setHydrated] = useState(false)

  // On first client render, sync the stored theme with React state
  useEffect(() => {
    const stored = readStoredTheme()
    const actual = resolveTheme(stored)
    setSettingState(stored)
    setResolved(actual)
    applyThemeClass(actual)
    setHydrated(true)
  }, [])

  // Re-apply class whenever resolved changes after hydration
  useEffect(() => {
    if (!hydrated) return
    applyThemeClass(resolved)
  }, [resolved, hydrated])

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (setting !== "system") return

    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => setResolved(getSystemPreference())
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [setting])

  const setTheme = useCallback((next: Theme) => {
    setSettingState(next)
    persistTheme(next)
    setResolved(resolveTheme(next))
  }, [])

  return { resolved, setting, setTheme }
}