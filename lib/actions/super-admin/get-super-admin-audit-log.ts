"use server"

// ============================================================================
// Server Action: Get Super Admin Audit Log
// ============================================================================
// For Phase 2C, this returns an empty list with a structure matching AuditLog.
// In Phase 2D/2E, this will be extended to query an Identity DB audit table
// that tracks all super admin actions (provision, suspend, license gen, etc.).
//
// The action is structured so UI components can consume it immediately
// without changes when the backend implementation arrives.
// ============================================================================

import type { AuditLog } from "@/lib/types"

export type GetSuperAdminAuditLogResult =
  | { success: true; data: AuditLog[] }
  | { success: false; error: string }

export async function getSuperAdminAuditLog(): Promise<GetSuperAdminAuditLogResult> {
  try {
    // Phase 2C: Return empty — Identity DB audit table comes in Phase 2D/3
    // The UI component handles empty state gracefully with i18n messages.
    return { success: true, data: [] }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch audit log"
    console.error("getSuperAdminAuditLog error:", message)
    return { success: false, error: message }
  }
}