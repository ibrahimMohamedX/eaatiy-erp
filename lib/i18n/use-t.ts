"use client"

import { createContext, useContext, useCallback, useMemo } from "react"
import type { Locale } from "./config"
import { DEFAULT_LOCALE, LOCALE_CONFIGS } from "./config"
import en from "./en"
import ar from "./ar"
import type { EnglishDictionary } from "./en"
import type { ArabicDictionary } from "./ar"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Translations = EnglishDictionary | ArabicDictionary

export interface I18nContextValue {
  locale: Locale
  t: EnglishDictionary
  dir: "ltr" | "rtl"
  setLocale: (locale: Locale) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: en,
  dir: "ltr",
  setLocale: () => {},
})

// ---------------------------------------------------------------------------
// Translation resolver (deep-path dot notation)
// ---------------------------------------------------------------------------

const dictionaries: Record<Locale, Translations> = { en, ar }

/**
 * Resolves a dot-path key like "receptionist.liveQueue" to its translated value.
 */
export function resolveKey(
  key: string,
  locale: Locale,
): string {
  const dict = dictionaries[locale]
  const parts = key.split(".")
  let current: any = dict
  for (const part of parts) {
    if (current == null || typeof current !== "object") return key
    current = current[part]
  }
  return typeof current === "string" ? current : key
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useT — returns a translation function `t(key, interpolations?)`.
 * Keys use dot notation: "common.search", "doctor.pastEncounters".
 * Interpolations: t("doctor.patientWas", { age: 35 }) → "Patient was 35 yrs"
 */
export function useT(): I18nContextValue {
  const ctx = useContext(I18nContext)
  return ctx
}

/**
 * For non-component usage — interleaved translations in server components.
 */
export function getDictionary(locale: Locale): Translations {
  return dictionaries[locale]
}

/**
 * Interpolates template variables in a translation string.
 * Supports {key} placeholders: "Patient was {age} yrs", { age: 35 }
 */
export function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`,
  )
}

/**
 * Convenience: resolves a key + interpolates in one call.
 */
export function tKey(
  key: string,
  locale: Locale,
  interpolations?: Record<string, string | number>,
): string {
  const raw = resolveKey(key, locale)
  return interpolate(raw, interpolations)
}

/**
 * Returns the CSS direction class and dir attribute value for a locale.
 */
export function useDirection(locale: Locale) {
  return useMemo(() => LOCALE_CONFIGS[locale], [locale])
}