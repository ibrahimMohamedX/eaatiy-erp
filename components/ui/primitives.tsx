import * as React from 'react'

import { cn } from '@/lib/utils'

// ============================================================================
// Archai Design System — Label / Skeleton / Separator
//   Label:    15px · weight 500 · silver
//   Skeleton: steel pulse placeholder
//   Separator: 1px line
// ============================================================================

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn('text-[15px] font-medium text-silver', className)}
      {...props}
    />
  )
}

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-lg bg-steel', className)}
      {...props}
    />
  )
}

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<'div'> & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      data-slot="separator"
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-line',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}

export { Label, Skeleton, Separator }
