"use server"

// ============================================================================
// Server Action: Get Super Admin Audit Log
// ============================================================================
// Returns the platform-level audit trail from the Identity DB
// (super_admin_audit): provisioning, tenant status transitions, license
// generation/revocation. Consumer shape matches the tenant AuditLog type.
// ============================================================================

import { getIdentityPool } from "@/lib/db/connection"
import { listSuperAdminAudit } from "@/lib/db/repositories/identity/superadmin-audit"
import { isSuperAdminAuthed } from "@/lib/auth/super-admin"
import type { AuditLog } from "@/lib/types"

export type GetSuperAdminAuditLogResult =
  | { success: true; data: AuditLog[] }
  | { success: false; error: string }

export async function getSuperAdminAuditLog(): Promise<GetSuperAdminAuditLogResult> {
  if (!(await isSuperAdminAuthed())) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const pool = getIdentityPool()
    const logs = await listSuperAdminAudit(pool, 200)
    return { success: true, data: logs }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch audit log"
    console.error("getSuperAdminAuditLog error:", message)
    return { success: false, error: message }
  }
}
