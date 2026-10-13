import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// ============================================================================
// Archai Design System — Badge / Status Pill
//   Pill radius 99px · 1px outline (arc / copper / neutral) · mono 13px
//   Status variant: ink-bg pill with colored text (table rows)
// ============================================================================

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full whitespace-nowrap font-mono text-xs font-medium transition-colors [&_svg]:pointer-events-none [&_svg]:size-3',
  {
    variants: {
      variant: {
        arc: 'border border-arc/60 px-3 py-1.5 text-arc',
        copper: 'border border-copper/60 px-3 py-1.5 text-copper',
        neutral: 'border border-line px-3 py-1.5 text-silver',
        status: 'bg-ink px-2.5 py-0.5 text-[13px] font-semibold text-foreground',
        ok: 'border border-ok/40 bg-ok/10 px-3 py-1.5 text-ok',
        warn: 'border border-warn/40 bg-warn/10 px-3 py-1.5 text-warn',
        err: 'border border-err/40 bg-err/10 px-3 py-1.5 text-err',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
