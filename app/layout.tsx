import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Readex_Pro, IBM_Plex_Sans_Arabic, Sora, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

// ============================================================================
// Archai Design System — brand type stack (all Google Fonts, per brand book)
//   Readex Pro           → Arabic headlines (600/700)
//   IBM Plex Sans Arabic → body + UI (400/500/600)
//   Sora                 → Latin display + numerals (400-700)
//   JetBrains Mono       → code, specs, labels (400/500)
// ============================================================================

const readexPro = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-readex',
  display: 'swap',
})

const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-arabic',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Clinic Management — Private Practice Suite',
  },
  description: 'Premium clinic management platform for independent private medical practices',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1F4F7' },
    { media: '(prefers-color-scheme: dark)', color: '#1B2228' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${readexPro.variable} ${plexSansArabic.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Inline script to apply dark/light class BEFORE first paint — avoids flash of wrong theme.
            Placed in <head> as a raw HTML injection so it executes before React hydrates.
            WARNING: Keep this script minimal — no imports, no closures, no external references. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
    document.documentElement.classList.add('light');
  }
})();
`.trim(),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
