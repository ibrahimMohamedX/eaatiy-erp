"use client"

import { useState } from "react"

const ranges = [
  "Today",
  "Yesterday",
  "7 Days",
  "30 Days",
  "90 Days",
  "This Month",
  "This Year",
  "Custom",
]

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
  const [localActive, setLocalActive] = useState(activeRange)

  function handleChange(range: string) {
    setLocalActive(range)
    onRangeChange?.(range)
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-6">
      {/* Page title left */}
      <h1 className="shrink-0 text-base font-semibold text-[#111827]">
        Analytics &amp; Auditing
      </h1>

      {/* Date-range pill-tab row */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {ranges.map((range) => {
          const active = range === localActive
          return (
            <button
              key={range}
              type="button"
              onClick={() => handleChange(range)}
              className={`h-8 shrink-0 rounded-full px-3 text-[13px] transition-colors ${
                active
                  ? "bg-[#0F766E] font-medium text-white"
                  : "border border-[#E5E7EB] font-normal text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
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