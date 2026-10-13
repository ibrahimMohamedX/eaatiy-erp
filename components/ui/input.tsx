import * as React from 'react'

import { cn } from '@/lib/utils'

// ============================================================================
// Archai Design System — Input
//   h-12 · radius 12px · field bg deeper than card (ink on dark)
//   Focus: arc border + 4px arc/18% ring · Error: #FF6B7A
// ============================================================================

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-lg border border-line bg-card px-4 text-base text-foreground',
        'transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none',
        'aria-invalid:border-err aria-invalid:focus-visible:border-err',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-line dark:bg-ink',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
