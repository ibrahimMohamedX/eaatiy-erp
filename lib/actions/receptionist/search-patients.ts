"use server"

// ============================================================================
// Server Action: searchPatients — Phase 2D
// ============================================================================
// Fuzzy search by full_name or phone. Context from middleware headers.
// Minimum 2 character query enforced.
// ============================================================================

import { getTenantPool } from "@/lib/db/connection"
import { searchPatients as searchPatientsRepo } from "@/lib/db/repositories/patients"
import { getTenantContext } from "@/lib/auth/server-context"
import type { Patient } from "@/lib/types"

export async function searchPatients(
  query: string,
): Promise<{ success: true; data: Patient[] } | { success: false; error: string }> {
  try {
    if (!query || query.length < 2) {
      return { success: true, data: [] }
    }

    const ctx = await getTenantContext()
    if (!ctx) {
      return { success: false, error: "Unauthorized" }
    }

    const pool = getTenantPool(ctx.tenantSlug)
    const results = await searchPatientsRepo(pool, ctx.tenantId, query)
    return { success: true, data: results }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to search patients",
    }
  }
}