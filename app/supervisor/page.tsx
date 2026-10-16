import type { Metadata } from "next"
import { SupervisorPageShell } from "./supervisor-page-shell"

export const metadata: Metadata = {
  title: "Supervisor Portal — Clinic Management",
  description:
    "Scoped clinic oversight for supervisors — sections granted by the admin",
}

/**
 * Supervisor route — thin server component. The client shell loads the
 * admin-granted section list via a server action on mount, then fetches
 * each granted section's data on demand.
 */
export default function SupervisorPage() {
  return <SupervisorPageShell />
}
