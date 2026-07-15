/**
 * ThemeScript — injects a tiny inline <script> that reads localStorage
 * and applies the .dark or .light class to <html> before the first paint.
 *
 * This prevents the dreaded "flash of wrong theme" (FOWT) on page load.
 *
 * Rendered as a client component but its output is a static <script> tag —
 * Next.js inlines it into the HTML stream.
 */

export function ThemeScript() {
  // This string is injected verbatim into the HTML. Keep it minimal and
  // avoid any runtime dependencies (no imports, no closures).
  const script = `
(function() {
  try {
    var theme = localStorage.getItem('clinic-theme') || 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  } catch(e) {
    // localStorage unavailable — default to light
    document.documentElement.classList.add('light');
  }
})();
`.trim()

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}