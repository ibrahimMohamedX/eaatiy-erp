"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, AlertCircle } from "lucide-react"
import { ArchaiLogo } from "@/components/archai/archai-logo"
import { submitSuperAdminKey } from "@/lib/actions/super-admin/auth"
import type { SuperAdminAuthResult } from "@/lib/actions/super-admin/auth"

/**
 * SuperAdminKeyGate — API-key entry screen for the /super-admin portal.
 * Rendered by the page server component when no valid key cookie is present.
 */
export function SuperAdminKeyGate() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [key, setKey] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!key.trim()) {
      setError("Enter the access key.")
      return
    }

    startTransition(async () => {
      try {
        const result: SuperAdminAuthResult = await submitSuperAdminKey(key.trim())
        if (result.success) {
          router.refresh()
        } else {
          setError(result.error)
        }
      } catch {
        setError("An unexpected error occurred. Please try again.")
      }
    })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* MOTIF 01 — Bus paths (static, hero screen) */}
      <div className="archai-node-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(46,210,255,0.10),transparent_62%)] dark:bg-[radial-gradient(circle,rgba(46,210,255,0.16),transparent_62%)]" />

      <div className="relative w-full max-w-sm animate-archai-fade-up">
        <div className="mb-8 flex flex-col items-center gap-3">
          <ArchaiLogo variant="lockup" size={56} />
          <div className="text-center">
            <p className="archai-eyebrow">CONTROL ROOM / RESTRICTED</p>
            <h1 className="mt-2 font-display text-xl font-bold text-foreground">
              Super Admin Access
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="archai-glass rounded-2xl p-6 md:p-7">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg bg-err/10 px-4 py-3 text-sm font-medium text-err" role="alert">
              <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-medium text-silver">Access key</span>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-mist"
                strokeWidth={1.75}
              />
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="••••••••••••••••"
                autoComplete="off"
                disabled={isPending}
                autoFocus
                dir="ltr"
                className="h-12 w-full rounded-lg border border-line bg-card ps-10 pe-3 font-mono text-base text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-ink"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-primary/85 hover:shadow-[0_0_24px_-6px_var(--arc)] active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
          >
            {isPending ? "Verifying…" : "Unlock Console"}
          </button>

          <p className="mt-5 text-center font-mono text-xs leading-relaxed text-mist">
            This console provisions databases and issues licenses.
            <br />
            Access is restricted to platform administrators.
          </p>
        </form>
      </div>
    </main>
  )
}
