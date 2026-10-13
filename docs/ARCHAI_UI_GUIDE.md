# Archai UI Guide — Application Implementation

> This document translates the **Archai Design System** (company brand book, `design-system/`)
> into concrete Tailwind recipes for this codebase. Every UI change — new screen or
> restyle — must follow it. The tokens live in [`app/globals.css`](../app/globals.css);
> primitives in [`components/ui/`](../components/ui/); brand bits in [`components/archai/`](../components/archai/).

## 1. Identity rules (non-negotiable)

- **Dark is the identity.** Light is the exception (uses "ink" variants of Arc/Copper).
- Color budget: Carbon surface 60% · Panel cards 20% · Silver text 12% · Arc signal 6% · Copper accent 2%.
- **ONE Arc button per screen.** Copper buttons are for the primary booking CTA only.
- **No colored gradient backgrounds.** The only gradient is Chrome (`--chrome`) on frames/bevels.
- **Glow only around Arc** elements on dark backgrounds (`.archai-glow`, `.archai-glow-soft`).
- **No letter-spacing on Arabic** ever. Latin digits (0-9) everywhere.
- **No emojis inside the UI.** Icons are Lucide, 24-grid, `strokeWidth={1.75}` (1.5 for large).
- Code/IDs/specs/eyebrows → JetBrains Mono. Latin tech terms inside Arabic → Sora, Arc color.
- Status pills/IDs in tables/numbers in KPIs → `font-latin` (Sora) or `font-mono`.
- Max 3 font weights per screen.

## 2. Palette → Tailwind

| Token | Dark | Light | Class examples |
|---|---|---|---|
| `--background` (Carbon) | `#1B2228` | `#F1F4F7` (Paper) | `bg-background` |
| `--card` (Panel) | `#222B33` | `#FFFFFF` | `bg-card` |
| `--steel` (surface-2) | `#2D3841` | `#E6EAEE` | `bg-steel`, `bg-muted` |
| `--ink` (deepest) | `#12181D` | `#10161B` | `bg-ink` (input bg on dark: `dark:bg-ink`) |
| `--line` (border) | `#3A4753` | `#D5DDE5` | `border-line` |
| `--foreground` (Paper) | `#F1F4F7` | `#10161B` | `text-foreground` |
| `--silver` | `#CCD3DA` | `#3A4753` | `text-silver` (secondary text) |
| `--mist` (muted) | `#98A5B1` | `#4A5966` | `text-mist`, `text-muted-foreground` |
| `--arc` (signal) | `#2ED2FF` | `#07739B` | `text-arc`, `bg-arc`, `border-arc` |
| `--copper` | `#C48A5C` | `#8A5A36` | `text-copper`, `bg-copper` |
| `--ok / --warn / --err` | `#3DDC97` / `#E9A24F` / `#FF6B7A` | `#0E7A4B` / `#8A5A36` / `#B3243A` | `text-ok` etc. |

**Migration map** (old hardcoded → new):

| Old | New |
|---|---|
| `bg-white dark:bg-[#1F2937]` | `bg-card` |
| `border-[#E5E7EB] dark:border-[#374151]` | `border-line` |
| `text-[#111827] dark:text-[#F9FAFB]` | `text-foreground` |
| `text-[#6B7280] dark:text-[#9CA3AF]` | `text-muted-foreground` |
| `bg-[#0F766E]` (old teal brand) | `bg-primary` (Arc) |
| `text-[#0F766E]` | `text-arc` |
| `hover:bg-[#F9FAFB] dark:hover:bg-[#374151]` | `hover:bg-accent` |
| `rounded-[12px]` | `rounded-lg` (12px) |
| `rounded-[20px]` | `rounded-2xl` |

## 3. Typography

Fonts (loaded in [`app/layout.tsx`](../app/layout.tsx)): Readex Pro (Arabic display),
IBM Plex Sans Arabic (body), Sora (Latin display/numbers), JetBrains Mono (specs).

| Role | Class | Size/Line | Weight |
|---|---|---|---|
| Page title (H2-level) | `font-display text-3xl md:text-4xl font-bold` | 1.25-1.35 | 700 |
| Section heading (H3) | `font-display text-xl font-semibold` | 1.4 | 600 |
| Card title | `font-display text-lg font-semibold` | 1.4 | 600 |
| Body | `font-sans text-[15px] leading-relaxed` | 1.75-1.85 | 400 |
| Eyebrow | `.archai-eyebrow` (mono, +2px tracking, uppercase, `text-arc`) | 12-13px | 500 |
| KPI number | `font-latin text-3xl font-semibold` | 1.2 | 600 |
| ID / code / spec | `font-mono text-xs text-mist` | — | 500 |

Arabic line-height ≥ 1.6 for body text. In `.dir-rtl` the display font auto-swaps to Readex Pro.

## 4. Spacing · Radius · Motion

- Spacing: 4px base — use `1/2/3/4/6/8/12/16` (4/8/12/16/24/32/48/64px). Card padding `p-5 md:p-6`.
- Radius: inputs/buttons `rounded-lg` (12px), cards `rounded-2xl` (≈20px), pills `rounded-full`, icon tiles `rounded-xl`.
- Motion: hover/press 120ms, menus/cards 240ms, reveal 480ms — always `ease-[cubic-bezier(0.2,0.8,0.2,1)]` (class `ease-archai` if needed, or inline `--ease`).
- Enter animations: `.animate-archai-fade-up` (translateY 24px). Pulse (one per screen): `.animate-archai-pulse`.

## 5. Component recipes

**Card** — `<Card className="p-5 md:p-6">` → `bg-card border border-line rounded-2xl`.

**Glass stat (MOTIF 02)** — over imagery/dark scenes only:
`rounded-xl archai-glass p-4` (blur 10px, white 7% bg, inner top highlight).

**Chrome bevel (MOTIF 03)** — featured element frame:
`archai-chrome rounded-2xl` wrapping `rounded-[19px] bg-carbon` content.

**KPI stat tile**
```tsx
<Card className="relative overflow-hidden p-5">
  <div className="flex items-start justify-between">
    <span className="archai-eyebrow">{label}</span>
    <Icon className="size-5 text-arc" strokeWidth={1.75} />
  </div>
  <p className="mt-3 font-latin text-3xl font-semibold text-foreground">42</p>
  <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
</Card>
```

**Section header pattern**
```tsx
<div>
  <p className="archai-eyebrow">RECEPTION / QUEUE</p>
  <h2 className="mt-2 font-display text-2xl font-bold">Live Queue</h2>
  <p className="mt-1 text-sm text-muted-foreground">…</p>
</div>
```

**Nav item (sidebar)**
```tsx
className={active
  ? "relative flex h-10 w-full items-center gap-3 rounded-lg bg-steel px-3 text-sm font-medium text-foreground"
  : "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-steel hover:text-foreground"}
{active && <span className="absolute start-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-arc" />}
```
(`start-0` keeps RTL correct. Icon `size-[18px] strokeWidth={1.75}`.)

**Table row** — `border-b border-line py-3 text-[15px]`, IDs `font-mono text-xs text-mist`,
status → `<Badge variant="status" className="text-ok">…</Badge>`.

**Alerts** — `flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium`
+ ok: `bg-ok/10 text-ok` · warn: `bg-warn/10 text-warn` · err: `bg-err/10 text-err`
+ 8px dot: `<span className="size-2 rounded-full bg-ok" />`.

**Input** — `<Input />` primitive (h-12, `focus-visible` arc ring). Labels 15px/500 `text-silver`.

**Buttons** — `<Button variant="…">`: `default` (Arc, ONE per screen) · `copper` (booking CTA)
· `outline` (1.5px arc) · `secondary` (line border, silver) · `ghost` · `destructive`.

**Charts (Recharts)** — use `var(--chart-1..5)`; grid `var(--line)`; tooltip:
`rounded-lg border border-line bg-popover p-3 font-mono text-xs`; never multi-neon.

**Avatars** — `rounded-xl bg-steel text-silver font-semibold` (initials, Latin).

## 6. Brand bits

- Logo: `<ArchaiLogo variant="lockup" />` / `variant="mark"` (theme-aware mark PNGs in `/archai/`).
- Hero background: `<BusPaths />` (MOTIF 01) — login + empty/error screens; `active` pulse only on the hero.
- Node grid: `.archai-node-grid` for subtle section backgrounds.

## 7. i18n / RTL contract (must not break)

- Keep every existing prop signature and `t.*` key path identical — restyle markup only.
- `useT()` in client components; `t` prop in server components — never mix in one file.
- Numbers/phone/IDs inside RTL → wrap with `ltr-in-rtl` class.
- Chevron mirrors: keep existing `rtl-mirror-icon` usage.
