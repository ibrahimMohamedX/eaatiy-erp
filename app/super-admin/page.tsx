import type { Metadata } from "next"
import { SuperAdminPageShell } from "./super-admin-page-shell"
import { SuperAdminKeyGate } from "@/components/super-admin/key-gate"
import { isSuperAdminAuthed } from "@/lib/auth/super-admin"

export const metadata: Metadata = {
  title: "Super Admin Console — Clinic Management",
  description:
    "Multi-tenant management: provision clinics, manage licenses, and audit platform operations.",
}

/**
 * Super Admin route — gated by the SUPER_ADMIN_KEY cookie (see
 * lib/auth/super-admin.ts). Without a valid key the console is never
 * rendered, and every super-admin server action re-checks the gate.
 * The Super Admin operates on the Identity DB and does NOT use tenant context.
 */
export default async function SuperAdminPage() {
  const authed = await isSuperAdminAuthed()

  if (!authed) {
    return <SuperAdminKeyGate />
  }

  return <SuperAdminPageShell />
}
