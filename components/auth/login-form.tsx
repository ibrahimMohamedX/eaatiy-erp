"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { login } from "@/lib/actions/auth/login"
import type { LoginResult } from "@/lib/auth/types"
import { ArchaiLogo } from "@/components/archai/archai-logo"

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }
    if (!password) {
      setError("Please enter your password.")
      return
    }

    startTransition(async () => {
      try {
        const result: LoginResult = await login({ email: email.trim(), password })
        if (result.success) {
          router.push(result.redirectUrl)
        } else {
          setError(result.error)
        }
      } catch {
        setError("An unexpected error occurred. Please try again.")
      }
    })
  }

  return (
    <div className="relative w-full max-w-sm animate-archai-fade-up">
      {/* Brand lockup */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <ArchaiLogo variant="lockup" size={56} />
        <div className="text-center">
          <p className="archai-eyebrow">PRIVATE PRACTICE SUITE</p>
          <h1 className="mt-2 font-display text-xl font-bold text-foreground">
            Sign in to your workspace
          </h1>
        </div>
      </div>

      {/* Glass card (MOTIF 02) */}
      <form
        onSubmit={handleSubmit}
        className="archai-glass rounded-2xl p-6 md:p-7"
      >
        {/* Error alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg bg-err/10 px-4 py-3 text-sm font-medium text-err" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Email field */}
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-medium text-silver">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-mist" strokeWidth={1.75} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="helena.marsh@northgate.com"
                autoComplete="email"
                disabled={isPending}
                dir="ltr"
                className="h-12 w-full rounded-lg border border-line bg-card ps-10 pe-3 text-base text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-ink"
              />
            </div>
          </label>

          {/* Password field */}
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-medium text-silver">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-mist" strokeWidth={1.75} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isPending}
                className="h-12 w-full rounded-lg border border-line bg-card ps-10 pe-11 text-base text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:[box-shadow:var(--glow-soft)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-ink"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-mist transition-colors hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="size-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </label>
        </div>

        {/* Submit — the single Arc button on this screen */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-primary/85 hover:shadow-[0_0_24px_-6px_var(--arc)] active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? (
            <>
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Dev hint — specs are always Mono */}
        <div className="mt-5 text-center font-mono text-xs leading-relaxed text-mist">
          <p>helena.marsh@northgate.com · sara.reyes@northgate.com · amelia.monroe@northgate.com</p>
          <p className="mt-0.5">default password: password123</p>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Clinic Management — an Archai Integrated System
      </p>
    </div>
  )
}
