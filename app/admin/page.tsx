import type { Metadata } from "next"
import { AdminPageShell } from "./admin-page-shell"

export const metadata: Metadata = {
  title: "Admin Analytics — Clinic Management",
  description:
    "Compliance monitoring, revenue analytics, and audit trails for clinic administrators",
}

/**
 * Admin route — thin server component that delegates to a client shell
 * so date-range state can be managed interactively.
 */
export default function AdminAnalyticsPage() {
  return <AdminPageShell />
}