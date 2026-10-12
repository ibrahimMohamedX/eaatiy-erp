"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { login } from "@/lib/actions/auth/login"
import type { LoginResult } from "@/lib/auth/types"

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
    <div className="w-full max-w-sm">
      {/* Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">
          Clinic Management
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
          Sign in to your workspace
        </p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-[#374151] dark:bg-[#1F2937]"
      >
        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-[8px] bg-[#FEF2F2] p-3 text-sm text-[#DC2626] dark:bg-[#DC2626]/10">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}

        {/* Email field */}
        <div className="space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
              Email
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="helena.marsh@northgate.com"
                autoComplete="email"
                disabled={isPending}
                className="h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-sm text-[#111827] placeholder:text-[#C7C7CD] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
              />
            </div>
          </label>

          {/* Password field */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
              Password
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.5} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isPending}
                className="h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-10 text-sm text-[#111827] placeholder:text-[#C7C7CD] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F9FAFB] dark:placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] dark:hover:text-[#9CA3AF]"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0F766E] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Dev hint */}
        <p className="mt-4 text-center text-xs text-[#9CA3AF]">
          Seed users: helena.marsh@northgate.com · sara.reyes@northgate.com · amelia.monroe@northgate.com
        </p>
        <p className="mt-0.5 text-center text-xs text-[#9CA3AF]">
          Default password: password123
        </p>
      </form>
    </div>
  )
}