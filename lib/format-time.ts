// ============================================================================
// Shared time formatting helper
// ============================================================================
// Handles both JavaScript Date objects and ISO 8601 strings.
// pg returns TIMESTAMP columns as Date objects; repositories normalize to
// ISO strings, but defensively this helper handles both.
// ============================================================================

/**
 * Format a Date or ISO string to HH:MM in 24-hour time.
 * Returns "—" for null/undefined/invalid inputs.
 */
export function formatTime(val: string | Date | null | undefined): string {
  if (!val) return "—"
  const d = val instanceof Date ? val : new Date(val)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Format a Date or ISO string to a full locale date string.
 * Returns "—" for null/undefined/invalid inputs.
 */
export function formatDate(val: string | Date | null | undefined): string {
  if (!val) return "—"
  const d = val instanceof Date ? val : new Date(val)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}