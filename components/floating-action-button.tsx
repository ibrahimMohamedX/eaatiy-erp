"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  ChevronRight,
  X,
  Settings,
} from "lucide-react"
import { useT } from "@/lib/i18n/use-t"
import { useTheme } from "@/lib/use-theme"
import type { Theme } from "@/lib/use-theme"
import type { Locale } from "@/lib/i18n/config"
import { LOCALE_CONFIGS } from "@/lib/i18n/config"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THEME_OPTIONS: { key: Theme; icon: typeof Sun; labelKey: string }[] = [
  { key: "light", icon: Sun, labelKey: "floating.light" },
  { key: "dark", icon: Moon, labelKey: "floating.dark" },
  { key: "system", icon: Monitor, labelKey: "floating.system" },
]

const LOCALE_OPTIONS: { key: Locale }[] = [
  { key: "en" },
  { key: "ar" },
]

// ---------------------------------------------------------------------------
// Floating Action Button
// ---------------------------------------------------------------------------

/**
 * Fixed-position floating button (bottom-right in LTR, bottom-left in RTL)
 * that expands to reveal Theme and Language switcher panels.
 *
 * Position adapts to `dir` from I18nContext.
 */
export function FloatingActionButton() {
  const { t, dir, locale, setLocale } = useT()
  const { resolved, setting, setTheme } = useTheme()

  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<"theme" | "language" | null>(null)

  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open && !panel) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setPanel(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, panel])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
        setPanel(null)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  const handleToggle = useCallback(() => {
    if (open) {
      setOpen(false)
      setPanel(null)
    } else {
      setOpen(true)
    }
  }, [open])

  const handlePanel = useCallback((p: "theme" | "language") => {
    setPanel((prev) => (prev === p ? null : p))
  }, [])

  const handleThemeSelect = useCallback(
    (theme: Theme) => {
      setTheme(theme)
      setPanel(null)
      setOpen(false)
    },
    [setTheme],
  )

  const handleLocaleSelect = useCallback(
    (loc: Locale) => {
      setLocale(loc)
      setPanel(null)
      setOpen(false)
    },
    [setLocale],
  )

  // Position: bottom-right for LTR, bottom-left for RTL
  const positionClass =
    dir === "rtl"
      ? "left-6 right-auto"
      : "right-6 left-auto"

  return (
    <div
      ref={ref}
      className={`fixed bottom-6 ${positionClass} z-50 flex flex-col items-end gap-3`}
    >
      {/* ---- Expandable panels ---- */}
      {open && (
        <div className="flex flex-col gap-3">
          {/* Theme panel */}
          {panel === "theme" && (
            <div className="w-[200px] rounded-[12px] border border-[#E5E7EB] bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_4px_24px_rgba(0,0,0,0.32)]">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] dark:text-[#9CA3AF]">
                {t.floating.theme}
              </p>
              <div className="flex flex-col gap-1">
                {THEME_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isActive = setting === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleThemeSelect(opt.key)}
                      className={`flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-[#0F766E]/[0.08] font-medium text-[#0F766E]"
                          : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#374151] dark:hover:text-[#E5E7EB]"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      {/* Resolve the label via the same dot-path pattern */}
                      {resolvePanelLabel(opt.labelKey, t)}
                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-[#0F766E]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Language panel */}
          {panel === "language" && (
            <div className="w-[200px] rounded-[12px] border border-[#E5E7EB] bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_4px_24px_rgba(0,0,0,0.32)]">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] dark:text-[#9CA3AF]">
                {t.floating.language}
              </p>
              <div className="flex flex-col gap-1">
                {LOCALE_OPTIONS.map((opt) => {
                  const cfg = LOCALE_CONFIGS[opt.key]
                  const isActive = locale === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleLocaleSelect(opt.key)}
                      className={`flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-[#0F766E]/[0.08] font-medium text-[#0F766E]"
                          : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#374151] dark:hover:text-[#E5E7EB]"
                      }`}
                    >
                      <span className="text-base leading-none">{cfg.flag}</span>
                      <span className={isActive ? "font-semibold" : ""}>
                        {cfg.nativeLabel}
                      </span>
                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-[#0F766E]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Menu bar — two icon buttons */}
          {!panel && (
            <div className="flex items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white p-2 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:border-[#374151] dark:bg-[#1F2937] dark:shadow-[0_4px_24px_rgba(0,0,0,0.32)]">
              <button
                type="button"
                onClick={() => handlePanel("theme")}
                className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#374151] dark:hover:text-[#E5E7EB]"
              >
                {resolved === "dark" ? (
                  <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                ) : (
                  <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />
                )}
                <span>{t.floating.theme}</span>
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>

              <button
                type="button"
                onClick={() => handlePanel("language")}
                className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:bg-[#374151] dark:hover:text-[#E5E7EB]"
              >
                <Globe className="h-[18px] w-[18px]" strokeWidth={1.5} />
                <span>{t.floating.language}</span>
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- Main FAB trigger ---- */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={open ? "Close settings" : "Open settings"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F766E] text-white shadow-[0_4px_16px_rgba(15,118,110,0.32)] transition-all hover:bg-[#115E59] hover:shadow-[0_4px_20px_rgba(15,118,110,0.40)] active:scale-95"
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <Settings className="h-5 w-5" strokeWidth={1.5} />
        )}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helper — resolves floating action button labels using the dictionary
// ---------------------------------------------------------------------------

function resolvePanelLabel(key: string, t: Record<string, any>): string {
  const parts = key.split(".")
  let current: any = t
  for (const part of parts) {
    if (current == null || typeof current !== "object") return key
    current = current[part]
  }
  return typeof current === "string" ? current : key
}