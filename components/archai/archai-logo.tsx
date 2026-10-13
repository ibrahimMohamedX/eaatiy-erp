import { cn } from '@/lib/utils'

// ============================================================================
// Archai Design System — Brand Logo Lockup
//   Mark + "Archai" (Sora 600) + "INTEGRATED SYSTEMS" descriptor (Sora,
//   +3.4px tracking, mist). Theme-appropriate mark via CSS dark: variants:
//   dark → mono-white mark · light → full-color mark.
// ============================================================================

type Variant = 'lockup' | 'mark'

type Props = {
  variant?: Variant
  /** Mark pixel size (lockup keeps 4:3.5 ratio) */
  size?: number
  className?: string
}

export function ArchaiLogo({ variant = 'lockup', size = 40, className }: Props) {
  if (variant === 'mark') {
    return (
      <span
        className={cn('relative inline-block shrink-0', className)}
        style={{ width: size, height: Math.round(size * 0.88) }}
      >
        {/* dark surfaces → mono white · light surfaces → color mark */}
        <img
          src="/archai/archai-mark-mono-white.png"
          alt="Archai"
          width={size}
          height={Math.round(size * 0.88)}
          className="absolute inset-0 hidden h-full w-full object-contain dark:block"
        />
        <img
          src="/archai/archai-mark.png"
          alt="Archai"
          width={size}
          height={Math.round(size * 0.88)}
          className="absolute inset-0 h-full w-full object-contain dark:hidden"
        />
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <ArchaiLogo variant="mark" size={size} />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className="font-latin text-[1.15em] font-semibold text-foreground"
          style={{ fontSize: `${size * 0.42}px`, lineHeight: 1 }}
        >
          Archai
        </span>
        <span
          className="font-latin font-normal text-mist"
          style={{
            fontSize: `${Math.max(7.5, size * 0.16)}px`,
            letterSpacing: '0.34em',
            marginTop: size * 0.11,
            lineHeight: 1,
          }}
        >
          INTEGRATED SYSTEMS
        </span>
      </span>
    </span>
  )
}
