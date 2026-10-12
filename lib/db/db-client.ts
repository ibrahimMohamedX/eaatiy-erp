// ============================================================================
// Shared type alias — Pool | PoolClient
// ============================================================================
// Used by repositories so they work with regular pools AND within withAudit()
// transactions (which pass a PoolClient).
// ============================================================================

import type { Pool, PoolClient } from "pg"

/** Union type: both Pool and PoolClient expose .query() with compatible signatures. */
export type DbPool = Pool | PoolClient