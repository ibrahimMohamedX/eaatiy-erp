import { redirect } from "next/navigation"

/**
 * Root route — redirects to the default role dashboard.
 * In production, this would check the authenticated user's role
 * and redirect accordingly (admin → /admin, doctor → /doctor,
 * receptionist → /receptionist).
 *
 * For now, the receptionist dashboard is the default landing page.
 */
export default function RootPage() {
  redirect("/receptionist")
}