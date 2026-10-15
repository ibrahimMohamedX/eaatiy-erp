"use server"

// ============================================================================
// Server Action: Revoke License — Super Admin
// ============================================================================
// Revokes a tenant's license by setting:
//   - locked_out = true
//   - lockout_reason = "admin_revoked"
//
// The license_state row remains; the license can be re-issued later with
// a new generate-license call (which increments the issue_sequence).
// ============================================================================

import { getIdentityPool } from "@/lib/db/connection"
import { insertSuperAdminAudit } from "@/lib/db/repositories/identity/superadmin-audit"
import { isSuperAdminAuthed } from "@/lib/auth/super-admin"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RevokeLicenseResult =
  | { success: true; data: { tenantId: string; lockedOut: boolean } }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function revokeLicense(
  tenantId: string,
): Promise<RevokeLicenseResult> {
  if (!(await isSuperAdminAuthed())) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const pool = getIdentityPool()

    const result = await pool.query<{ locked_out: boolean }>(
      `UPDATE license_state
       SET locked_out = true,
           lockout_reason = 'admin_revoked'
       WHERE tenant_id = $1
       RETURNING locked_out`,
      [tenantId],
    )

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "No license_state record found for this tenant",
      }
    }

    // Platform audit trail (never blocks the revocation)
    try {
      await insertSuperAdminAudit(pool, {
        action: "update",
        tenantId,
        targetTable: "license_state",
        targetRowId: tenantId,
        summary: "Revoked license (locked_out = true)",
      })
    } catch (auditErr) {
      console.error("super-admin audit write failed:", auditErr)
    }

    return {
      success: true,
      data: { tenantId, lockedOut: result.rows[0].locked_out },
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to revoke license"
    console.error("revokeLicense error:", message)
    return { success: false, error: message }
  }
}