import { cn } from '@/lib/utils'

// ============================================================================
// Archai Design System — MOTIF 01 "Bus Paths" (HERO BUS background)
//   Parallel circuit lines breaking at 45° ending in nodes; one line
//   energized in Arc with a pulsing port node (MOTIF 04 — one per screen).
//   Pure decoration — aria-hidden. Stretch over any container via absolute.
// ============================================================================

type Props = {
  className?: string
  /** density of the line bundle — default matches the brand hero */
  lines?: number
  /** energize one path in Arc (glowing port) — keep true only for hero screens */
  active?: boolean
  /** flip horizontally (for corner balance) */
  flip?: boolean
}

export function BusPaths({ className, lines = 6, active = true, flip = false }: Props) {
  const paths: string[] = []
  for (let i = 0; i < lines; i++) {
    const y = 40 + i * 8
    const x1 = 100 - i * 8
    const y2 = 90 + i * 8
    paths.push(`M0 ${y} H${x1} L${x1 + 40} ${y2} H${320 - i * 16}`)
  }
  const activeIndex = 2
  const activePath = paths[activeIndex]
  const nodes = [0, 1, 2].map((i) => ({
    cx: 320 - i * 16 - activeIndex * 16,
    cy: 90 + i * 8 + activeIndex * 8,
  }))

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 330 190"
      preserveAspectRatio="xMidYMid slice"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g fill="none" stroke="var(--line)" strokeWidth="1.4">
        {paths.map((d, i) => (
          <path key={`bus-${i}`} d={d} />
        ))}
      </g>
      {nodes.map((n, i) => (
        <circle
          key={`node-${i}`}
          cx={n.cx}
          cy={n.cy}
          r="4.5"
          fill="var(--background)"
          stroke="var(--line)"
          strokeWidth="1.4"
        />
      ))}
      {active && (
        <>
          <path d={activePath} fill="none" stroke="var(--arc)" strokeWidth="2.2" />
          <circle
            cx={nodes[0].cx}
            cy={nodes[0].cy}
            r="8"
            fill="rgba(46,210,255,0.16)"
            className="animate-archai-pulse"
            style={{ transformOrigin: `${nodes[0].cx}px ${nodes[0].cy}px` }}
          />
          <circle cx={nodes[0].cx} cy={nodes[0].cy} r="5.5" fill="var(--arc)" />
        </>
      )}
    </svg>
  )
}
