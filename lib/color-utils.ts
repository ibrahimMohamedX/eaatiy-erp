// ============================================================================
// Color Utilities — Archai Design System status tints
// ============================================================================
// Semantic status colors render as rgba(r,g,b,0.12) backgrounds (12% rule).
// Source of truth: Archai semantic palette —
//   ok #3DDC97 · warn #E9A24F · err #FF6B7A · arc #2ED2FF · copper #C48A5C
// ============================================================================

/**
 * Converts a hex color to its RGB components for use with the 12% opacity rule.
 * Accepts both 6-digit (#3DDC97) and 3-digit (#abc) hex formats.
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
 * Usage: style={{ backgroundColor: statusBg("#3DDC97") }}
 */
export function statusBg(hex: string): string {
  return `rgba(${hexToRgb(hex)},0.12)`
}

/**
 * Archai semantic colors and their RGB representations.
 * The single source of truth for all status pill colors in the app.
 */
export const SEMANTIC_COLORS = {
  ok: { hex: "#3DDC97", rgb: "61,220,151" },
  warn: { hex: "#E9A24F", rgb: "233,162,79" },
  err: { hex: "#FF6B7A", rgb: "255,107,122" },
  arc: { hex: "#2ED2FF", rgb: "46,210,255" },
  copper: { hex: "#C48A5C", rgb: "196,138,92" },
} as const

/** Archai signal color (Arc Blue) — the brand accent. */
export const ARCHAI_ARC = "#2ED2FF"
export const ARCHAI_ARC_RGB = "46,210,255"
