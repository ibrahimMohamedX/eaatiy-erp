// ============================================================================
// Color Utilities — 12% Opacity Rule Enforcement
// ============================================================================
// Semantic status colors must always render as rgba(r,g,b,0.12) for backgrounds.
// These helpers ensure consistency across the entire codebase.
// ============================================================================

/**
 * Converts a hex color to its RGB components for use with the 12% opacity rule.
 * Accepts both 6-digit (#059669) and 3-digit (#abc) hex formats.
 */
export function hexToRgb(hex: string): string {
  // Strip '#' prefix
  let h = hex.replace(/^#/, "")

  // Expand shorthand 3-char hex
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  }

  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)

  return `${r},${g},${b}`
}

/**
 * Returns the semantic status color as an rgba background value at exactly 12% opacity.
 * Usage: style={{ backgroundColor: statusBg("#059669") }}
 */
export function statusBg(hex: string): string {
  return `rgba(${hexToRgb(hex)},0.12)`
}

/**
 * Standard semantic status colors and their RGB representations.
 * The single source of truth for all status pill colors in the app.
 */
export const SEMANTIC_COLORS = {
  emerald: { hex: "#059669", rgb: "5,150,105" },
  amber: { hex: "#D97706", rgb: "217,119,6" },
  red: { hex: "#DC2626", rgb: "220,38,38" },
  blue: { hex: "#2563EB", rgb: "37,99,235" },
} as const

export const PRIMARY_TEAL = "#0F766E"
export const PRIMARY_TEAL_RGB = "15,118,110"