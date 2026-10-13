"use client"

import { useState } from "react"
import { useT } from "@/lib/i18n/use-t"

/**
 * Admin Top Bar — page title + functional date-range pill filters.
 * The selected range is communicated upward via the onChange callback
 * so the parent can re-filter analytics data.
 */
export function AdminTopBar({
  activeRange,
  onRangeChange,
}: {
  activeRange: string
  onRangeChange?: (range: string) => void
}) {
  const { t } = useT()
  const ranges: string[] = t.admin.dateRanges
  const [localActive, setLocalActive] = useState(activeRange)

  function handleChange(range: string) {
    setLocalActive(range)
    onRangeChange?.(range)
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-card/60 px-6 backdrop-blur-sm">
      {/* Page title left */}
      <h1 className="shrink-0 font-display text-base font-semibold text-foreground">
        {t.admin.analyticsAuditing}
      </h1>

      {/* Date-range segmented control */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-line bg-steel/40 p-1">
        {ranges.map((range) => {
          const active = range === localActive
          return (
            <button
              key={range}
              type="button"
              onClick={() => handleChange(range)}
              className={`h-8 shrink-0 rounded-full px-3 text-[13px] transition-colors duration-200 ${
                active
                  ? "bg-card font-medium text-arc"
                  : "font-normal text-muted-foreground hover:text-foreground"
              }`}
            >
              {range}
            </button>
          )
        })}
      </div>
    </header>
  )
}
