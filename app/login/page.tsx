import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { BusPaths } from "@/components/archai/bus-paths"

export const metadata: Metadata = {
  title: "Login — Clinic Management",
  description: "Sign in to your clinic management dashboard",
}

/**
 * Login route — Archai hero screen.
 * Carbon canvas + BusPaths motif + node grid; the form renders as a glass panel.
 * Public path — no auth required.
 */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* MOTIF 01 — Bus paths, one energized line (hero only) */}
      <BusPaths className="opacity-90" />
      {/* BACKGROUND 02 — subtle node grid */}
      <div className="archai-node-grid pointer-events-none absolute inset-0 opacity-40" />
      {/* soft arc halo behind the glass card */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(46,210,255,0.10),transparent_62%)] dark:bg-[radial-gradient(circle,rgba(46,210,255,0.16),transparent_62%)]" />

      <LoginForm />
    </main>
  )
}
