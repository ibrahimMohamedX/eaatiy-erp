import { BusPaths } from "@/components/archai/bus-paths"

export default function LoginLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* MOTIF 01 — Bus paths (inert while loading) */}
      <BusPaths active={false} className="opacity-90" />
      {/* BACKGROUND 02 — subtle node grid */}
      <div className="archai-node-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative w-full max-w-sm animate-archai-fade-up">
        {/* Brand lockup skeleton */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="h-14 w-40 rounded-xl bg-steel animate-pulse" />
          <div className="h-3 w-44 rounded-full bg-steel animate-pulse" />
        </div>
        {/* Glass card skeleton */}
        <div className="archai-glass rounded-2xl p-6 md:p-7">
          <div className="space-y-5">
            <div className="h-12 rounded-lg bg-steel animate-pulse" />
            <div className="h-12 rounded-lg bg-steel animate-pulse" />
          </div>
          <div className="mt-7 h-12 rounded-lg bg-steel animate-pulse" />
        </div>
      </div>
    </main>
  )
}
