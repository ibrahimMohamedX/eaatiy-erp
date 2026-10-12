import type { Metadata } from "next"
import { AdminPageShell } from "./admin-page-shell"
import { getDashboardData } from "@/lib/actions/admin/get-dashboard-data"
import type { DashboardData } from "@/lib/actions/admin/get-dashboard-data"

export const metadata: Metadata = {
  title: "Admin Analytics — Clinic Management",
  description:
    "Compliance monitoring, revenue analytics, and audit trails for clinic administrators",
}

/**
 * Admin route — server component that fetches initial dashboard data
 * and passes it to the client shell for interactive filtering.
 */
export default async function AdminAnalyticsPage() {
  // Fetch initial dashboard data (last 30 days by default)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const result = await getDashboardData(since)

  const initialData: DashboardData | null = result.success ? result.data : null
  const fetchError = result.success ? null : result.error

  return <AdminPageShell initialData={initialData} fetchError={fetchError} />
}