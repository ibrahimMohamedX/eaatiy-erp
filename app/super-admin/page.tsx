import type { Metadata } from "next"
import { SuperAdminPageShell } from "./super-admin-page-shell"

export const metadata: Metadata = {
  title: "Super Admin Console — Clinic Management",
  description:
    "Multi-tenant management: provision clinics, manage licenses, and audit platform operations.",
}

/**
 * Super Admin route — thin server component that delegates to a client shell.
 * The Super Admin operates on the Identity DB and does NOT use tenant context.
 * Protected by env-based API key (Phase 2C) → proper auth (Phase 2D).
 */
export default function SuperAdminPage() {
  return <SuperAdminPageShell />
}