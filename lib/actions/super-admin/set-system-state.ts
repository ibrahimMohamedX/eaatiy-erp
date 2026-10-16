"use server"

// ============================================================================
// Super Admin Actions: System State (platform-wide singleton)
// ============================================================================
// getSystemStateAction — read the current platform state
// setSystemStateAction — operational | maintenance | locked
//
// The state is enforced in getTenantContext() (with a 15s in-process cache)
// so switching to maintenance/locked automatically denies EVERY tenant
// server action and login within seconds. The super-admin portal itself is
// key-gated and keeps working during a lock.
// ============================================================================

import { getIdentityPool } from "@/lib/db/connection"
import { insertSuperAdminAudit } from "@/lib/db/repositories/identity/superadmin-audit"
import { isSuperAdminAuthed } from "@/lib/auth/super-admin"
import { SYSTEM_STATES, type SystemState } from "@/lib/db/schema/identity/system-state"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SystemStateData {
  state: SystemState
  updatedAt: string
}

export type SystemStateResult =
  | { success: true; data: SystemStateData }
  | { success: false; error: string }

/** Sentinel tenant_id for platform-global audit rows (super_admin_audit.tenant_id is NOT NULL) */
const PLATFORM_TENANT_SENTINEL = "00000000-0000-0000-9000-000000000099"

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getSystemStateAction(): Promise<SystemStateResult> {
  if (!(await isSuperAdminAuthed())) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const pool = getIdentityPool()
    const result = await pool.query<{ state: string; updated_at: Date }>(
      `SELECT state, updated_at FROM system_state WHERE id = 1`,
    )
    const row = result.rows[0]
    if (!row) {
      return { success: true, data: { state: "operational", updatedAt: new Date().toISOString() } }
    }
    return {
      success: true,
      data: {
        state: (SYSTEM_STATES as readonly string[]).includes(row.state)
          ? (row.state as SystemState)
          : "operational",
        updatedAt:
          row.updated_at instanceof Date
            ? row.updated_at.toISOString()
            : String(row.updated_at),
      },
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read system state"
    console.error("getSystemStateAction error:", message)
    return { success: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function setSystemStateAction(state: string): Promise<SystemStateResult> {
  if (!(await isSuperAdminAuthed())) {
    return { success: false, error: "Unauthorized" }
  }
  if (!(SYSTEM_STATES as readonly string[]).includes(state)) {
    return {
      success: false,
      error: `State must be one of: ${SYSTEM_STATES.join(", ")}`,
    }
  }

  const pool = getIdentityPool()
  try {
    const result = await pool.query<{ state: string; updated_at: Date }>(
      `UPDATE system_state SET state = $1, updated_at = now() WHERE id = 1
       RETURNING state, updated_at`,
      [state],
    )
    let row = result.rows[0]
    if (!row) {
      // Singleton missing — create it lazily
      const created = await pool.query<{ state: string; updated_at: Date }>(
        `INSERT INTO system_state (id, state) VALUES (1, $1)
         ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, updated_at = now()
         RETURNING state, updated_at`,
        [state],
      )
      row = created.rows[0]
    }

    // Platform audit trail (never blocks the change)
    try {
      await insertSuperAdminAudit(pool, {
        action: "update",
        tenantId: PLATFORM_TENANT_SENTINEL,
        targetTable: "system_state",
        targetRowId: "1",
        summary: `System state → ${state}`,
      })
    } catch (auditErr) {
      console.error("super-admin audit write failed:", auditErr)
    }

    return {
      success: true,
      data: {
        state: row.state as SystemState,
        updatedAt:
          row.updated_at instanceof Date
            ? row.updated_at.toISOString()
            : String(row.updated_at),
      },
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to set system state"
    console.error("setSystemStateAction error:", message)
    return { success: false, error: message }
  }
}
