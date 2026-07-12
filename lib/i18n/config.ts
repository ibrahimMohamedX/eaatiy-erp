// ============================================================================
// i18n Configuration — English (en) & Arabic (ar) with RTL support
// ============================================================================

export const SUPPORTED_LOCALES = ["en", "ar"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

export interface LocaleConfig {
  code: Locale
  label: string
  nativeLabel: string
  dir: "ltr" | "rtl"
  flag: string
}

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    dir: "ltr",
    flag: "🇺🇸",
  },
  ar: {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    dir: "rtl",
    flag: "🇸🇦",
  },
}

/**
 * Derives the best matching locale from an Accept-Language header.
 */
export function negotiateLocale(
  acceptLanguage: string | null,
): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const preferred = acceptLanguage
    .split(",")
    .map((part) => {
      const [code, qVal] = part.trim().split(";q=")
      return { code: code.slice(0, 2).toLowerCase(), q: qVal ? parseFloat(qVal) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { code } of preferred) {
    if (SUPPORTED_LOCALES.includes(code as Locale)) return code as Locale
  }

  return DEFAULT_LOCALE
}

/**
 * Common RTL-aware CSS classes applied to the <html> element.
 */
export function htmlDirectionClass(locale: Locale): string {
  return locale === "ar" ? "dir-rtl" : ""
}

/**
 * Returns 'rtl' or 'ltr' for the dir attribute.
 */
export function dirAttribute(locale: Locale): "rtl" | "ltr" {
  return LOCALE_CONFIGS[locale].dir
}