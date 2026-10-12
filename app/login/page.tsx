import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login — Clinic Management",
  description: "Sign in to your clinic management dashboard",
}

/**
 * Login route — renders the login form.
 * Public path — no auth required.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] dark:bg-[#111827]">
      <LoginForm />
    </div>
  )
}