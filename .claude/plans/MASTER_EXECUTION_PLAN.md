<!-- FORMAT NOTE: This file was copied from chat and lost some markdown formatting.
     The content is correct but the following markup is missing throughout:

1. CODE BLOCKS: Lines 28-31 (usage pattern) and 86-91 (prompt structure) should be in ``` fences.
   Lines 170-172: the bash commands `pnpm add drizzle-orm pg drizzle-kit` and `pnpm add -D @types/pg`
   should be in a ```bash fence, and the sentence "Create docker-compose.yml..." is separate prose.
   Lines 696-724 (Docker Compose YAML) should be in a ```yaml fence.
   Lines 885-1036 (directory tree) should be in a ``` fence.
   Lines 1047-1066 (dependency graph) should be in a ``` fence.

2. HEADINGS: Every phase is missing its #### sub-headings. In each phase section, these lines
   should have #### prefixes:
     "Objective & Scope"          → #### Objective & Scope
     "Why This Phase Comes..."    → #### Why This Phase Comes First (or Second/Last)
     "Architectural Approach"     → #### Architectural Approach
     "Step-by-Step Implementation"→ #### Step-by-Step Implementation
     "Verification & Definition of Done" → #### Verification & Definition of Done

3. BOLD STEP MARKERS: Within Step-by-Step Implementation, every
     "Step N: Description"
   should be
     **Step N: Description**

4. CHECKBOXES: In Verification sections, every line like
     " All 8 repository files exist..."  → - [ ] All 8 repository files exist...
     " docker compose up postgres..."    → - [ ] docker compose up postgres...
   The leading space indicates a lost "- [ ]" prefix. Every line in a Verification section
   that starts with a space or a bare sentence is a checklist item.

5. PIPE TABLES: Appendix B (lines 1037-1046), Appendix D (lines 1067-1079), Phase 2A Step 2/3
   tables, and the Phase Architecture Overview table lost their |---|---| separator rows.
   Treat tab-separated lines as pipe table rows with the first line as the header.

6. DELETME: Line 1 "Here is the complete plan..." is a leftover instruction from chat — ignore it.

7. TYPOS FIXED in this version (none remain in my content).

Everything else — file paths, function names, architectural decisions, phase ordering,
migration SQL, verification steps — is correct and readable as-is.
-->


# MASTER EXECUTION PLAN — Clinic Management System

**Version:** 2.0
**Date:** 2026-07-17
**Architect:** Claude (Principal Software Architect)
**Project State:** Phase 0/1 complete (mock-data UI with i18n, dark/light theme, AR/EN RTL support). 55 `.tsx` files, 8 domain types, zero TypeScript errors, Next.js 16.2.6 Turbopack.

---

## PART 1: AI SKILLS & TOKEN OPTIMIZATION PROTOCOL

### 1. Required AI Skills/Personas

When executing this plan with Claude Code CLI, activate the following personas explicitly in your prompt prefix each session:

| Persona | Trigger Phrase | Responsibilities |
|---|---|---|
| `Principal Architect` | "Act as Principal Architect" | Validates that every implementation decision aligns with the hybrid multi-tenant architecture. Rejects deviations. Owns the data model, isolation strategy, and API contract. |
| `Security Architect` | "Act as Security Architect" | Audits every PR for credential leaks, JWT misuse, license bypass vectors, SQL injection. Owns the license enforcement module and audit log integrity. |
| `Staff Engineer — Next.js` | "Act as Staff Next.js Engineer" | Owns App Router patterns, server/client boundary correctness, streaming/RSC decisions, bundle optimization. Ensures no `"use client"` contamination of data-fetching code. |
| `DBA / Backend Engineer` | "Act as DBA" | Owns every migration, every query, every index. Ensures schema-per-tenant isolation is never violated. Reviews every Drizzle query for N+1, missing WHERE clauses on tenant_id, and connection pool hygiene. |
| `QA Owner` | "Act as QA Owner" | Owns verification. Writes the manual test checklist for each phase. Confirms each Definition of Done gate before marking a phase complete. Does not trust the developer's self-assessment. |

**Usage pattern per session:**
Act as Principal Architect and Staff Next.js Engineer.
We are executing Phase 2B, Step 4: repository layer for appointments.
Follow the Zero-Bug Execution Rules from MASTER_EXECUTION_PLAN.md.



### 2. Zero-Bug Execution Rules

These rules are binding for every coding session. Violating any one of them produces bugs that compound across phases.

#### Rule 1: TypeScript Strict — No Escape Hatches
- `strict: true` in tsconfig.json is non-negotiable. Already enabled.
- Zero `as any` casts. Zero `@ts-ignore` or `@ts-expect-error` directives.
- Every function's return type is explicit. No inferred returns on exported functions.
- `unknown` over `any`. Type narrowing via discriminated unions, never casts.

#### Rule 2: Server/Client Boundary Discipline
- Data fetching (Drizzle queries, fetch calls) lives exclusively in Server Components or server actions. NEVER in a `"use client"` file.
- Client components receive data via props. They do not import database clients.
- The `"use client"` directive appears ONLY on components that use hooks (`useState`, `useEffect`, `useT`, `useTheme`) or event handlers (`onClick`).
- Server actions are defined in `lib/actions/` with the `"use server"` directive. They are the sole bridge between client components and the database.

#### Rule 3: Tenant Isolation — Never Omit `tenant_id`
- Every query against a tenant-scoped table MUST include `WHERE tenant_id = $tenantId` or the equivalent Drizzle filter.
- The `tenant_id` is extracted from the request context (subdomain, JWT claim, or header) in a single server-side middleware. It is never passed from the client.
- Missing a `tenant_id` filter is a P0 security bug. Code review must flag it every time.

#### Rule 4: One Migration, One Concern
- Each migration file changes exactly one logical thing (one table, one column, one index).
- Migration files are numbered sequentially and never edited after being applied.
- No migration touches more than one tenant schema at a time.

#### Rule 5: No Mock Data in New Code
- Phase 2+ code NEVER imports from `lib/mock-data.ts`. That file is frozen at Phase 1.
- Every new component receives data from the database layer via props.
- Even during development, seed data comes from a Drizzle seed script, not from mock-data.ts.

#### Rule 6: Component Contract — Prop Types Are Explicit
Every component receiving translated text must have a `t` prop of the correct dictionary type, OR use `useT()` directly in a `"use client"` component. No hybrid approaches in the same file.

#### Rule 7: Error Boundaries on Every Route Segment
Every `app/` route segment (admin, doctor, receptionist, super-admin, login) must have its own `error.tsx`. The existing error pages from Phase 1 are the template. New routes must replicate this pattern.

#### Rule 8: Verify Before Commit
Before marking any step complete:
- `tsc --noEmit` passes with zero errors
- `next build` succeeds
- The affected UI flow is manually checked in both `en` and `ar` locales
- Dark mode is toggled for the affected views

### 3. Token & Request Optimization Strategy

#### 3.1 Phase Chunking Discipline
Each phase in Part 2 is sized to fit within one Claude Code session (~200-400 lines of net-new code per step). Do NOT combine phases. Each session executes exactly one phase (or one major step within a phase if the step exceeds 400 lines). This prevents context overflow and reduces retry loops.

#### 3.2 Prompt Structure
Every implementation prompt follows this template:

[Persona activation — 1 line]
[Phase reference: "Phase 2B, Step 4" — 1 line]
[Concrete task: "Create lib/db/repositories/appointments.ts with these 6 functions" — 1 line]
[Existing file reference: "Follow pattern from lib/db/repositories/patients.ts" — 1 line]
[Constraints: "Use Drizzle schema from lib/db/schema/tenant/appointments.ts, no mock data" — 2-3 lines]
[Verification: "Run tsc, then describe manual test steps" — 1 line]



#### 3.3 File Reference, Never Re-Explain
When working on file B that mirrors file A, say: "Create B following the exact pattern of A. Read A for the template." Do NOT paste A's contents into the prompt.

#### 3.4 Parallel Read, Sequential Write
Use parallel Read calls to load all files needed for a step in one turn. Then write files sequentially in subsequent turns.

#### 3.5 Cache-Aware Session Pacing
- Sessions under 5 minutes stay within the prompt-cache TTL.
- If a phase step requires more than ~5 minutes, split it across two sessions.
- Use `/compact` when the conversation exceeds ~150 messages.

#### 3.6 Verification as Separate Session
After completing a phase's code, run verification in a NEW session: "Verify Phase 2B completion per MASTER_EXECUTION_PLAN.md. Run tsc --noEmit and next build. Report errors only."

---

## PART 2: THE PHASED EXECUTION ROADMAP

### Phase Architecture Overview

| Phase | Title | Status |
|---|---|---|
| Phase 0 | Mock UI with i18n | ✅ DONE |
| Phase 1 | Responsive layout + theme + RTL | ✅ DONE |
| Phase 2A | Foundation — Drizzle ORM, Identity DB, schema-per-tenant DDL | ⏳ Next |
| Phase 2B | Core repositories + server actions + wire up receptionist dashboard | 🗓️ Pending |
| Phase 2C | Super Admin Portal + tenant provisioning + license management | 🗓️ Pending |
| Phase 2D | JWT-based login, role routing, middleware enforcement | 🗓️ Pending |
| Phase 2E | Wire up doctor workspace + live queue with real data | 🗓️ Pending |
| Phase 2F | Wire up admin analytics with real aggregation queries | 🗓️ Pending |
| Phase 3 | Docker packaging, on-premise gateway, native license guard binary | 🗓️ Pending |
| Phase 4 | Enterprise hardening — TPM binding, audit export, multi-instance scaling | 🗓️ Pending |

---

### PHASE 2A — DATABASE FOUNDATION & ORM SETUP

#### Objective & Scope

Install Drizzle ORM. Design and create the PostgreSQL schema for:
1. **Identity DB** — `tenants`, `users`, `rbac_roles`, `license_state` tables (shared, single instance)
2. **Tenant DB template** — `patients`, `appointments`, `medical_records`, `prescriptions`, `billings`, `audit_logs`, `transaction_watermark`, `license_state` tables

No business logic yet. Pure DDL + Drizzle schema definitions + a seed script that replaces `lib/mock-data.ts`.

#### Why This Phase Comes First

Database is the foundation. Every subsequent phase reads/writes real data. Delaying this means accumulating throwaway mock-data glue code.

#### Architectural Approach

**ORM: Drizzle ORM** (not Prisma)
- No Rust binary — works identically in cloud and on-premise Docker.
- `drizzle-orm/pg-core` accepts a `Pool` instance per connection; we control lifecycle.
- Schema defined in TypeScript — no code generation, migration SQL is hand-authored and reviewed.

**Database Isolation Model: Schema-per-Tenant**
- One PostgreSQL server hosts multiple databases via `CREATE DATABASE`.
- Each tenant database contains the full application schema.
- No RLS. No shared tables. True physical isolation.
- The Identity DB is a separate database on the same server (or a dedicated small instance).

**Connection Strategy:**
- Identity DB: single `Pool` instance, always connected.
- Tenant DBs: `Pool` per tenant, created lazily on first request. Cached in a `Map<string, Pool>` with idle-eviction after 15 minutes.

**Environment:**
- Development: Local PostgreSQL via Docker.
- Production cloud: One managed PostgreSQL instance hosting Identity DB + tenant databases.
- On-premise: Docker Compose with PostgreSQL container, single tenant database.

#### Step-by-Step Implementation

**Step 1: Install Drizzle and PostgreSQL driver**

```bash
pnpm add drizzle-orm pg drizzle-kit
pnpm add -D @types/pg
Create docker-compose.yml in project root with a postgres service (port 5432, volume for data persistence, POSTGRES_PASSWORD from env).

Step 2: Create Identity DB schema

Directory: lib/db/schema/identity/

File	Tables
tenants.ts	tenants (id UUID PK, name, slug UNIQUE, address fields, city, phone, subscription_tier, status, created_at)
users.ts	users (id UUID PK, tenant_id FK→tenants, email UNIQUE, password_hash, full_name, avatar_url, role ENUM, is_active, created_at)
rbac_roles.ts	rbac_roles (id UUID PK, user_id FK→users, tenant_id FK→tenants, role ENUM — one user, multiple roles across tenants)
license_state.ts	license_state (singleton: id=1 CHECK, installation_id UUID, license_token TEXT, highest_issue_sequence INT, heartbeat_hash TEXT, heartbeat_at TIMESTAMPTZ, locked_out BOOLEAN, lockout_reason TEXT)
Step 3: Create Tenant DB schema template

Directory: lib/db/schema/tenant/

File	Key Constraints
patients.ts	tenant_id NOT NULL, date_of_birth DATE NOT NULL (age NEVER stored), blood_group nullable, allergies nullable
appointments.ts	queue_number INT per doctor per day, status ENUM, FK→patients, FK→users(doctor)
medical_records.ts	FK→appointments UNIQUE (one record per completed appt), vitals as JSONB
prescriptions.ts	FK→medical_records, items as JSONB array of PrescriptionItem
billings.ts	FK→appointments UNIQUE, payment_status ENUM, total_amount DECIMAL(10,2)
audit_logs.ts	FK→users(actor), action ENUM, target_table TEXT, changes JSONB array of AuditChange
transaction_watermark.ts	BIGSERIAL PK, table_name, record_id, recorded_at DEFAULT now(), previous_watermark_hash
Step 4: Create Drizzle config and connection manager

File: lib/db/connection.ts

getIdentityPool() — singleton connection to Identity DB
getTenantPool(tenantSlug) — lazy Map-based tenant pool resolver
evictIdlePools() — setInterval cleanup of unused tenant pools
File: drizzle.config.ts

Step 5: Write and apply Identity DB migration

Use drizzle-kit generate → review generated SQL → drizzle-kit migrate.

Step 6: Write and apply Tenant DB migration

Same for tenant schema — this migration runs once per new tenant DB at provision time.

Step 7: Write seed script

File: scripts/seed.ts

Creates Identity DB records: 1 tenant ("Northgate Clinic"), 6 users, their rbac_roles
Creates tenant DB for Northgate, runs migration
Seeds 8 patients, 8 appointments, 2 medical records, 2 prescriptions, 3 billing records, 4 audit log entries (mirrors current mock-data)
All IDs via crypto.randomUUID(), passwords via bcrypt (pnpm add bcrypt @types/bcrypt)
Step 8: Remove mock-data dependency

Delete lib/mock-data.ts (or mark @deprecated)
tsc --noEmit will show errors where mock functions are imported — these are resolved in Phase 2B
Verification & Definition of Done
 docker compose up postgres starts Docker PostgreSQL, reachable on port 5432
 drizzle-kit generate produces clean migration SQL
 Migration applies without errors on Identity DB
 Migration applies without errors on a test tenant DB
 Seed script runs to completion, all 9 tenant tables contain expected row counts
 Drizzle Studio (drizzle-kit studio) can browse all tables
 tsc --noEmit passes on all new files (mock-data import errors are expected and documented — not yet fixed)
PHASE 2B — REPOSITORIES, SERVER ACTIONS & RECEPTIONIST WIRING
Objective & Scope
Build the data access layer (repositories), create server actions for all receptionist operations, and wire the receptionist dashboard to use real database queries. The receptionist becomes the first fully-functional role dashboard.

Why This Phase Comes Second
Receptionist is the entry point for every patient flow. Wiring it first validates the entire data pipeline (DB → repository → server action → client component) before we touch the more complex doctor and admin dashboards.

Architectural Approach
Repository Pattern: Each domain entity gets a file in lib/db/repositories/ exporting typed (pool, tenantId, ...args) => Promise<T> functions. The tenantId parameter is always required — Rule 3 enforcement.

Server Actions in lib/actions/receptionist/ call repositories and return { success, data } | { success: false, error }. They receive tenantId from middleware (hardcoded to "t_northgate_01" until Phase 2D auth exists).

Component Wiring: Server component (page.tsx) calls server action → passes result as props to client shell. Interactive operations in client components call server actions via useTransition.

Step-by-Step Implementation
Step 1: Create repository files (8 files)

lib/db/repositories/patients.ts — getPatient, searchPatients (ILIKE/LIKE), createPatient, getAllPatients
lib/db/repositories/appointments.ts — getTodayAppointments, getAppointment, createAppointment, updateAppointmentStatus, getPatientHistory
lib/db/repositories/users.ts — getUser, getDoctors (WHERE role=doctor AND is_active), getDoctorInitials (pure fn)
lib/db/repositories/medical-records.ts — getMedicalRecordForAppointment, createMedicalRecord
lib/db/repositories/prescriptions.ts — getPrescriptionsForRecord, createPrescription
lib/db/repositories/billings.ts — getBillingForAppointment, createBilling, updateBillingStatus, getReceptionistKpis
lib/db/repositories/audit-logs.ts — getAuditLogs, createAuditLog, getAdminKpis
lib/db/repositories/tenants.ts — getTenant

Step 2: Create server actions (9 files)

lib/actions/receptionist/register-patient.ts — validates, calls repo, creates audit log
lib/actions/receptionist/book-appointment.ts — validates, computes queue_number, calls repo, audit logs
lib/actions/receptionist/search-patients.ts — delegates to searchPatients repo
lib/actions/receptionist/get-today-queue.ts — calls getTodayAppointments, enriches with names
lib/actions/receptionist/call-next.ts — lowest queue_number for specified doctor → sets in_consultation + actual_start
lib/actions/receptionist/record-vitals.ts — creates/updates vitals for an appointment
lib/actions/receptionist/start-consultation.ts — status → in_consultation
lib/actions/receptionist/cancel-appointment.ts — status → cancelled + cancelled_at + cancellation_reason
lib/actions/receptionist/mark-completed.ts — status → completed + completed_at

Step 3: Wire receptionist page shell to server actions

Modify:

app/receptionist/page.tsx — fetch queue via server action, pass as props
app/receptionist/receptionist-page-shell.tsx — remove mock-data imports, accept data via props
components/receptionist/live-queue-panel.tsx — accept queue items as props, call actions via useTransition
components/receptionist/patient-search-card.tsx — search triggers searchPatients action
components/receptionist/patient-registration-modal.tsx — use registerPatient action
components/receptionist/appointment-modal.tsx — doctor list from getDoctors, submit via bookAppointment
components/receptionist/vitals-intake-card.tsx — use recordVitals action
components/receptionist/kpi-row.tsx — accept KPI values as props
Step 4: Create transactional audit log wrapper

File: lib/db/audit.ts

withAudit(pool, tenantId, actorId, action, targetTable, targetRowId, summary, fn) — wraps a mutation in a transaction that creates an audit log row alongside it. Used by every server action that mutates data.
Step 5: Test data pipeline end-to-end

Verify receptionist dashboard loads with seed data → register new patient → book appointment → call next → cancel → search → all creating audit log entries.

Verification & Definition of Done
 All 8 repository files exist with typed exports
 All 9 server actions exist with validation and audit logging
 Receptionist dashboard loads with seed data matching Phase 1 mock-data UI
 Register patient: success path + validation error path both work
 Book appointment: queue_number auto-computed correctly
 Call next: status transitions correctly, queue re-renders
 Cancel: status + cancellation_reason saved
 Search: fuzzy match works, empty query returns empty
 Record vitals: values persist in DB
 Every mutation creates audit log entries with correct actor/table/action
 tsc --noEmit passes with ZERO errors
 next build succeeds
 Tested in en and ar with dark/light theme
 Zero imports from lib/mock-data.ts in any component
PHASE 2C — SUPER ADMIN PORTAL & TENANT PROVISIONING
Objective & Scope
Build /super-admin dashboard that:

Lists all tenants with status (active, suspended, provisioning, revoked)
Creates tenants (provisions a PostgreSQL DB, runs tenant migration, seeds admin user)
Suspends / activates / revokes tenants (updates Identity DB)
Generates license tokens (signed RS256 JWTs) bound to a tenant's installation_id
Tracks license issue sequences per tenant
Displays audit log of all Super Admin actions
Why This Phase Comes Before Auth
The Super Admin Portal operates on the Identity DB; it needs no tenant-scoped auth. Building it now validates the entire tenant provisioning pipeline before we add user authentication.

Architectural Approach
Tenant Provisioning Flow:

Super Admin fills form (clinic name, slug, admin email, subscription tier)
Server action: inserts tenant row → CREATE DATABASE tenant_{slug} → runs tenant migration → seeds admin user → inserts installation_id into license_state → sets status to active
Returns installation_id and admin credentials
License Token Generation:

Reads installation_id and highest_issue_sequence from tenant's license_state
Increments issue_sequence atomically
Signs RS256 JWT: { iss, sub, iat, exp, seq, installation_id, tier, max_users, features, grace_days }
Private key in env var — NEVER in any DB
lib/license/public-key.ts — compiled-in public key
Super Admin Route:

/super-admin — no tenant context, no role redirect
Protected by separate Super Admin auth (env-based API key in Phase 2C, proper auth in 2D)
Step-by-Step Implementation
Step 1: Create Super Admin layout & page shell

app/super-admin/page.tsx — server component
app/super-admin/super-admin-shell.tsx — client shell with tabs: Tenants, Licensing, Audit
app/super-admin/error.tsx — error boundary
Step 2: Create Identity DB repositories

lib/db/repositories/identity/tenants.ts: getAllTenants, getTenantBySlug, createTenant, updateTenantStatus, deleteTenant
lib/db/repositories/identity/users.ts: getUserByEmail, createUser, updateUserPassword
Step 3: Create tenant provisioning server action

lib/actions/super-admin/provision-tenant.ts — validates slug, creates DB, runs migration, seeds admin
Step 4: Create license management server actions

lib/actions/super-admin/generate-license.ts
lib/actions/super-admin/revoke-license.ts — sets locked_out: true
Step 5: Build Super Admin UI components

components/super-admin/tenant-list.tsx — table with status pills, Suspend/Activate/Revoke buttons
components/super-admin/provision-tenant-modal.tsx — new tenant form
components/super-admin/license-generator.tsx — for an active tenant, shows installation_id, generates license string
components/super-admin/super-admin-audit.tsx — filtered audit log viewer
Step 6: Add Identity DB connection manager support

Update lib/db/connection.ts to differentiate Identity DB and tenant DB pools
Step 7: Add RS256 key generation script

scripts/generate-jwt-keys.ts — generates RS256 key pair, prints storage instructions
Public key in lib/license/public-key.ts
Verification & Definition of Done
 super-admin loads with Tenants, Licensing, Audit tabs
 Provision "Test Clinic"—verify new tenant DB exists with migrations applied and admin user seeded
 Tenant list shows "Test Clinic" with "Active" status
 Suspend "Test Clinic" → status updates in Identity DB
 Activate "Test Clinic" → status returns to Active
 Generate license → valid JWT returned with correct claims
 Revoke license → license_state.locked_out = true
 Super Admin audit log shows all provisioning/suspension/license actions
 tsc --noEmit passes with zero errors
 next build succeeds
PHASE 2D — AUTHENTICATION & AUTHORIZATION
Objective & Scope
Implement JWT-based login, role-based routing, and middleware-enforced access control:

Login page at /login
JWT session management (httpOnly cookie)
Middleware that reads the JWT, resolves tenant + role, and enforces route access
Role-based redirect from / (admin→/admin, doctor→/doctor, receptionist→/receptionist)
Super Admin login (separate credentials, redirects to /super-admin)
Logout
Why Auth Comes After Super Admin
The Super Admin Portal provisions tenants and creates initial admin users. Auth needs those users to exist before it can authenticate them.

Architectural Approach
JWT Strategy:

Access token JWT (RS256): { sub: userId, tenant_id, tenant_slug, role, iat, exp } — 24h expiry
Stored in httpOnly, Secure, SameSite=Strict cookie
Middleware extracts tenant context from the JWT — no database lookup per request
Refresh token: stored in a separate cookie, 7-day expiry, validated against a refresh_tokens table in Identity DB (allows revocation)
Password Hashing:

bcrypt with cost factor 12
Password reset is out of scope for Phase 2 — seed users get a known temporary password
Middleware:

middleware.ts at project root
Matches all routes except /login, /api/auth/*, /super-admin/*, static assets
Extracts JWT from cookie, verifies signature with public key
Extracts role and tenant_slug from JWT claims
Enforces route prefix matching: role doctor can only access /doctor/*, etc.
Super Admin routes have separate auth (separate JWT or API key in header)
Redirects unauthenticated users to /login
Redirects authenticated users to their role dashboard if they land on /
On-Premise Consideration:

Login validates against the local tenant database's users table, not the cloud Identity DB
The tenant-specific user's password hash is stored locally
This means a clinic can log in without internet connectivity
The license validation (Phase 2C license_state table) runs separately from auth
Step-by-Step Implementation
Step 1: Create login page

app/login/page.tsx — server component rendering LoginForm
components/auth/login-form.tsx — client component with email, password fields
Server action: lib/actions/auth/login.ts — validates credentials, creates JWT, sets cookies, returns redirect URL
Step 2: Create JWT utilities

lib/auth/jwt.ts: signAccessToken(user), verifyAccessToken(token), signRefreshToken(user), verifyRefreshToken(token)
lib/auth/password.ts: hashPassword(plain), verifyPassword(plain, hash)
Step 3: Create middleware

middleware.ts:
Read JWT from cookie
Verify signature
Extract role, tenant_slug from claims
Route enforcement: role-based path prefix matching
Inject tenant context into request headers (x-tenant-id, x-tenant-slug, x-user-id, x-user-role) for downstream server components/actions
Step 4: Create auth context provider (client-side)

lib/auth/auth-context.tsx — provides { user, tenant, role, logout } to client components
Reads from a server endpoint that returns the current session (JWT claims, not a DB query)
Step 5: Update all server actions to use real tenant context

Every server action in lib/actions/ reads tenant_id and actor_id from headers (set by middleware) instead of hardcoded values
Remove all hardcoded "t_northgate_01" and "u_receptionist_01" references
Step 6: Update root page redirect

app/page.tsx — instead of hardcoded redirect("/receptionist"), read the JWT and redirect to the correct role dashboard
Step 7: Add role-based visibility to sidebars

Admin sidebar: shows all nav items for admin users only
Doctor sidebar: shows clinical nav items only
Receptionist sidebar: shows operations nav items only
Components already support this — just ensure the auth context propagates
Step 8: Update seed script for bcrypt passwords

Replace plaintext passwords with bcrypt hashes for all seed users
Default seed password for all users: "password123" (development only)
Verification & Definition of Done
 Unauthenticated request to /receptionist redirects to /login
 Login with helena.marsh@northgate.com / password123 redirects to /receptionist
 Login with sara.reyes@northgate.com / password123 redirects to /doctor
 Login with amelia.monroe@northgate.com / password123 redirects to /admin
 Receptionist user cannot access /doctor or /admin routes (middleware blocks)
 Doctor user cannot access /receptionist or /admin routes
 Admin user cannot access /receptionist or /doctor routes
 Landing on / while authenticated redirects to correct role dashboard
 Logout clears cookies and redirects to /login
 Server actions correctly receive tenant context from headers, not hardcoded values
 Seed users have bcrypt-hashed passwords (verify in DB directly)
 Super Admin login (separate credentials) → /super-admin
 tsc --noEmit passes with zero errors
 next build succeeds
 Full login→dashboard→logout flow tested in en and ar
PHASE 2E — DOCTOR WORKSPACE WIRING
Objective & Scope
Wire the doctor dashboard to real database queries:

Queue rail shows the logged-in doctor's actual queue (filtered by doctor_id)
Selecting a patient loads their real data (banner, vitals, tabs)
Current Visit tab: save draft + complete consultation write to DB
History tab: loads past encounters from DB
Prescriptions tab: create, edit, print prescriptions in DB
Billing tab: real billing records, mark-as-paid actions
Why Doctor After Receptionist + Auth
Doctor workspace needs auth (to identify the logged-in doctor) and working repositories (to read/write patient data). Both are built in 2B and 2D.

Architectural Approach
Server Component Data Fetching:
The doctor page shell becomes a hybrid: the outer page (app/doctor/page.tsx) is a server component that fetches the doctor's queue and passes it to the client shell. Interactive operations (save draft, complete consultation, create prescription) are server actions called from client components.

Real-time Queue:
No WebSocket yet. Queue refresh via router.refresh() after status-changing actions, or a setInterval poll every 30 seconds calling a lightweight server action that returns only queue status changes.

Medical Record Creation:

"Complete Consultation" creates a medical_records row, updates appointment status to completed, creates a billings row (unpaid), and optionally creates a prescriptions row — all in one transaction.
"Save Draft" updates only the medical_records row (or creates it if draft didn't exist) without changing appointment status.
Step-by-Step Implementation
Step 1: Create doctor server actions

lib/actions/doctor/get-my-queue.ts — returns appointments for the logged-in doctor today
lib/actions/doctor/get-patient-data.ts — returns patient + current appointment + vitals + past encounters + prescriptions + billing
lib/actions/doctor/save-draft.ts — upserts medical_record with draft status (or a is_draft boolean column)
lib/actions/doctor/complete-consultation.ts — transactional: creates/finalizes medical_record, sets appointment to completed, creates billing row, creates prescription if items provided, creates audit logs for all
lib/actions/doctor/create-prescription.ts — standalone prescription creation
lib/actions/doctor/mark-billing-paid.ts — updates billing status + payment method + paid_at
Step 2: Refactor doctor page shell

Modify app/doctor/page.tsx:

Fetch doctor's queue via server action
Pass queue items as props to DoctorPageShell
Modify app/doctor/doctor-page-shell.tsx:

Remove mock-data imports
Accept queue + initial patient data as props
Active patient state managed client-side
Step 3: Wire QueueRail

components/doctor/queue-rail.tsx: Accept queue items as props (already supports this pattern from Phase 1)
Clicking a patient sets active patient in page shell state
Queue items show real patient names, queue numbers, statuses from DB
Step 4: Wire Workspace components

components/doctor/workspace.tsx: Pass active patient data to all tabs
components/doctor/patient-banner.tsx: Already receives patient data as props — no change needed
components/doctor/vitals-strip.tsx: Already receives vitals as props — no change needed
Step 5: Wire CurrentVisitTab

components/doctor/current-visit-tab.tsx:
Chief complaint, diagnosis, notes fields → saveDraft server action on "Save Draft" click
Same fields → completeConsultation on "Complete Consultation" click
After completion, show "Completed" badge, disable editing
Step 6: Wire HistoryTab

Already receives past encounters as props
Data now comes from DB via getPatientHistory repository
Step 7: Wire PrescriptionsTab

components/doctor/prescriptions-tab.tsx:
"Add Medicine" adds to local state array
"Save Prescription" calls createPrescription server action
"Print" triggers window.print() (unchanged from Phase 1)
Step 8: Wire BillingTab

components/doctor/billing-tab.tsx:
Shows billing record from DB (via getBillingForAppointment)
"Mark Paid Cash/Card" calls markBillingPaid server action
Step 9: Add is_draft column to medical_records

Migration: ALTER TABLE medical_records ADD COLUMN is_draft BOOLEAN DEFAULT false
Update Drizzle schema
Save Draft creates/updates with is_draft: true
Complete Consultation sets is_draft: false
Verification & Definition of Done
 Doctor login → queue shows only that doctor's patients
 Selecting a patient → banner shows real patient data (name, age, gender, allergies)
 Vitals strip shows real vitals from the most recent completed encounter, or placeholder for new patients
 "Save Draft" → chief complaint/diagnosis/notes persist in DB
 Reload page → draft data is restored
 "Complete Consultation" → appointment marked completed, medical record created, billing row created, audit log entries created
 History tab shows past completed encounters for the patient
 Prescriptions tab: add medicines, save → prescription row in DB
 Billing tab: shows unpaid billing, mark paid → status updates
 Doctor who completes consultation → patient removed from queue
 tsc --noEmit passes with zero errors
 next build succeeds
 Full workflow tested in en and ar with dark/light theme
PHASE 2F — ADMIN ANALYTICS WIRING
Objective & Scope
Wire the admin dashboard to real aggregation queries:

KPI grid with live counts from DB
Revenue tab with real billing aggregates
Appointments tab with today's schedule
Doctors performance tab with per-doctor stats
Audit log with real audit trail data
Charts (revenue over time, status donut, appointments per doctor) with DB queries
Why Admin Last
Admin reads across all data. It needs all repositories working, all audit logging in place, and real billing/appointment data flowing from doctor + receptionist operations before its aggregation queries return meaningful results.

Architectural Approach
Aggregation Queries:
Most admin queries are COUNT, SUM, GROUP BY operations. These are implemented as dedicated repository functions that return typed aggregation objects, not raw SQL results.

Date Range Filtering:
The admin date range selector (Today, Yesterday, 7 Days, 30 Days, etc.) maps to SQL WHERE clauses on created_at columns. The date range is passed as a parameter to every aggregation function.

Chart Data:
Recharts components already receive data as props. The server component fetches chart data via server actions and passes it as props to the client chart components. No chart data fetching in client components.

Step-by-Step Implementation
Step 1: Create admin aggregation repositories

lib/db/repositories/admin-kpis.ts:
getRevenueSummary(pool, tenantId, dateRange) — total paid, outstanding, average fee, record count
getAppointmentStats(pool, tenantId, dateRange) — total, completed, cancelled, completion rate, cancellation rate
getNewPatientCount(pool, tenantId, dateRange) — count patients created within range
getDoctorPerformance(pool, tenantId, dateRange) — per doctor: total, completed, completion rate
getAppointmentsPerDoctorOverTime(pool, tenantId, dateRange) — for bar chart: doctor name + count
getStatusDistribution(pool, tenantId, dateRange) — waiting/in_consultation/completed/cancelled counts for donut chart
getRevenueOverTime(pool, tenantId, dateRange) — daily revenue sums for line chart
Step 2: Create admin server actions

lib/actions/admin/get-dashboard-data.ts — aggregates all KPI and chart data in one call (or separate calls per tab)
lib/actions/admin/get-revenue-data.ts — detailed billing records for revenue tab table
lib/actions/admin/get-appointments-data.ts — detailed appointment list for today
lib/actions/admin/get-audit-data.ts — filtered audit logs
Step 3: Refactor admin page shell
Modify app/admin/page.tsx:

Fetch KPI data via server action
Pass as props to AdminPageShell
Modify app/admin/admin-page-shell.tsx:

Accept initial data as props
Tab switching triggers server actions for tab-specific data (if not preloaded)
Step 4: Wire KPI Grid

components/admin/kpi-grid.tsx: Accept KPI values as props (already supports this)
Values come from getAdminKpis repository
Step 5: Wire Revenue Tab

components/admin/revenue-tab.tsx: Accept billing records as props
Summary cards from getRevenueSummary
Step 6: Wire Appointments Tab

components/admin/appointments-tab.tsx: Accept appointment list as props
Filters by today or selected date range
Step 7: Wire Doctors Tab

components/admin/doctors-tab.tsx: Accept doctor stats as props
Stats from getDoctorPerformance
Step 8: Wire Audit Log

components/admin/audit-log.tsx: Accept audit entries as props
Filter bar triggers getAuditData server action with new filters
Step 9: Wire Charts

components/admin/analytics-charts.tsx:
RevenueChart: revenue data from getRevenueOverTime
StatusDonut: distribution from getStatusDistribution
AppointmentsPerDoctor: bar chart data from getAppointmentsPerDoctorOverTime
Verification & Definition of Done
 Admin dashboard loads with KPI counts matching seed data
 Revenue tab shows billing records with correct amounts
 Appointments tab shows today's appointments
 Doctors tab shows correct per-doctor stats
 Audit log shows entries, filterable by table/action/staff
 Charts render with seed data values
 Date range selector changes filter all tabs' data
 Date range "Today" vs "30 Days" produces different KPI values
 tsc --noEmit passes with zero errors
 next build succeeds
 Full admin dashboard tested in en and ar with dark/light theme
PHASE 3 — DOCKER PACKAGING & ON-PREMISE DELIVERY
Objective & Scope
Package the entire application for on-premise deployment:

Production Docker image for the Next.js application
Docker Compose file for on-premise deployment (app + PostgreSQL + gateway sidecar)
Native license guard binary (meridian-guard) in Rust
Gateway sidecar for periodic cloud health checks
One-command deployment for clinics (docker compose up)
Why Phase 3 After All Features Work
Phase 3 is about delivery, not features. The application must be fully functional before packaging it for on-premise deployment.

Architectural Approach
Docker Image:

Multi-stage build: node:20-alpine for build, node:20-alpine for runtime
Next.js standalone output mode (output: 'standalone' in next.config.ts)
Public key for license verification compiled into the image
No secrets in the image — database password, JWT private key injected via environment variables at runtime
Gateway Sidecar:

Small Rust binary (~5MB) that runs alongside the app container
Responsibilities:
On startup: verify license token against local PostgreSQL license_state
Every 5 minutes: attempt to phone home to cloud Identity DB health endpoint
If subscription revoked: toggle license_state.locked_out = true in local DB
If offline > X days (configurable grace period): log warning, increment offline counter
Expose /health endpoint for the Docker healthcheck
Expose /status endpoint that the Next.js app queries to check license validity
License Guard Binary:

Rust binary compiled for linux/amd64 (and linux/arm64 for ARM servers)
Responsibilities:
Verify JWT license signature using compiled-in public key
Check issue_sequence monotonic counter in DB
Maintain hash-chain heartbeat in license_state table
Perform self-integrity check (SHA-256 of own binary) at startup
Expose JSON API over Unix socket or localhost TCP for the Next.js app to query
Docker Compose Structure:


services:
  app:
    image: meridian-app:latest
    environment:
      - DATABASE_URL=postgres://meridian:${DB_PASSWORD}@db:5432/meridian
      - LICENSE_GUARD_URL=http://guard:9090
      - GATEWAY_URL=http://gateway:8080
    depends_on: [db, guard, gateway]

  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      - POSTGRES_USER=meridian
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=meridian

  guard:
    image: meridian-guard:latest
    volumes: [guard_data:/data]
    environment:
      - DATABASE_URL=postgres://meridian:${DB_PASSWORD}@db:5432/meridian

  gateway:
    image: meridian-gateway:latest
    environment:
      - IDENTITY_URL=https://cloud.meridian.app/health
      - TENANT_ID=${TENANT_ID}
      - DATABASE_URL=postgres://meridian:${DB_PASSWORD}@db:5432/meridian
Step-by-Step Implementation
Step 1: Configure Next.js for standalone output

next.config.ts: output: 'standalone' — produces a self-contained .next/standalone/ directory with the minimal Node.js server
Verify: next build produces a runnable standalone directory
Step 2: Create Dockerfile for Next.js app

Dockerfile: multi-stage build, copies standalone output, exposes port 3000
Entrypoint: node server.js
Step 3: Create license guard binary

New directory: guard/
guard/Cargo.toml — Rust project, dependencies: jsonwebtoken, sha2, tokio-postgres, serde_json
guard/src/main.rs:
HTTP server on port 9090 (localhost only)
GET /verify — verifies license and returns { valid, tier, expires_at, reason? }
GET /heartbeat — returns current heartbeat status
POST /activate — accepts a new license token via request body, validates, stores in DB with issue_sequence check
Startup: self-integrity check, hash-chain initialization
guard/Dockerfile — minimal Rust Alpine image
Step 4: Create gateway sidecar

New directory: gateway/
gateway/Cargo.toml — Rust, dependencies: reqwest, tokio, serde_json, tokio-postgres
gateway/src/main.rs:
HTTP server on port 8080 (localhost only)
Background task: every 5 minutes, POST to cloud identity service with tenant_id
On { status: "suspended" } response → update local license_state.locked_out = true
On { status: "revoked" } response → update local license_state.locked_out = true with reason
On connection failure → increment offline counter, log warning
GET /status — returns { connected, last_check_at, subscription_status, offline_days }
gateway/Dockerfile — minimal Rust Alpine image
Step 5: Create Docker Compose for on-premise

docker-compose.onprem.yml:
All 4 services
Named volume for PostgreSQL data
Environment variable placeholders: ${DB_PASSWORD}, ${TENANT_ID}, ${LICENSE_TOKEN}
Healthchecks on all services
Step 6: Create deployment script

scripts/deploy-onprem.sh:
Generates random DB password
Creates .env file with generated values
Prompts for TENANT_ID and LICENSE_TOKEN
Runs docker compose up -d
Step 7: Create license activation page in the app

New route: app/settings/license/page.tsx
Client component with textarea to paste license string
Calls guard binary's /activate endpoint via server action
Shows current license status (valid until, tier, features)
Step 8: Add license status check to middleware

Update middleware.ts to call guard binary's /verify endpoint on each request (or check a cached result in Redis/local memory)
If license invalid/locked: redirect to an interstitial page explaining the situation, with data export still available
Verification & Definition of Done
 docker build -t meridian-app . succeeds
 docker compose -f docker-compose.onprem.yml up starts all 4 services
 Application accessible at http://localhost:3000
 Login works with seed data in the local PostgreSQL
 License guard /verify returns valid response for a real license token
 License guard /verify returns { valid: false, reason: "expired" } for an expired token
 Pasting an expired license in the activation page → guard rejects it
 Pasting a license with lower issue_sequence → guard rejects it ("rollback detected")
 Gateway sidecar /status returns correct subscription status
 Simulating cloud unavailability (stop cloud endpoint) → gateway logs offline counter, app still works
 Simulating { status: "suspended" } cloud response → gateway locks license, app shows suspended interstitial
 Full on-premise flow tested: deploy → login → use all 3 dashboards → data persists across restart
 tsc --noEmit passes with zero errors (for app code)
 cargo build --release passes for both guard and gateway
 next build succeeds
PHASE 4 — ENTERPRISE HARDENING
Objective & Scope
Production hardening for enterprise-scale deployment:

Multi-instance tenant database routing (multiple PostgreSQL servers)
TPM-based hardware binding for license enforcement (optional, enterprise tier)
Audit log export and compliance reporting
Performance optimization (query indexing, caching, connection pooling)
Monitoring and alerting infrastructure
Why Phase 4 Is Last
These are operational concerns that matter at 50+ clinics. They're unnecessary overhead at 5 clinics. Delaying them avoids premature optimization while keeping the architecture compatible with these additions.

Architectural Approach
Multi-Instance Routing:

Identity DB tenants table gains a db_host column (hostname of the PostgreSQL instance hosting that tenant's database)
Connection manager's getTenantPool reads db_host to route to the correct server
PgBouncer in front of each PostgreSQL instance for connection pooling
Same CREATE DATABASE per tenant, same schema — just distributed across instances
TPM Binding:

License guard binary integrates with the host's TPM 2.0 chip via tss-esapi Rust crate
Reads PCR7 (UEFI secure boot policy) and PCR11 (kernel image hash) values
License JWT gains a pcr_values: { pcr7: "...", pcr11: "..." } claim
Guard verifies current PCR values match license claims — if the boot chain changed, license is invalid
This is enterprise-tier only; standard tier uses the Phase 3 guard without TPM
Performance:

Index audit trail on (tenant_id, created_at) for filtered queries
Cache Identity DB tenant list in application memory (60s TTL)
PgBouncer transaction pooling for tenant connections
Lazy tenant database connection (don't warm all tenant pools at startup)
Monitoring:

Healthcheck endpoints on app, guard, gateway
Structured JSON logging with pino (or winston)
Optional Prometheus metrics endpoint for on-premise monitoring
Step-by-Step Implementation
Step 1: Add db_host to tenant provisioning

Migration: ALTER TABLE tenants ADD COLUMN db_host TEXT NOT NULL DEFAULT 'localhost'
When provisioning, assign to a PostgreSQL instance (round-robin or based on load)
Connection manager reads db_host to build the Pool connection string
Step 2: Add PgBouncer to Docker Compose

docker-compose.onprem.yml: add pgbouncer service between app and db
Configuration: transaction pooling, max 50 connections, idle timeout 10min
Step 3: Add required indexes

Migration: CREATE INDEX idx_appointments_tenant_doctor_date ON appointments(tenant_id, doctor_id, scheduled_start)
Migration: CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC)
Migration: CREATE INDEX idx_billings_tenant_status ON billings(tenant_id, payment_status)
Migration: CREATE INDEX idx_patients_tenant_name ON patients USING gin(tenant_id, full_name gin_trgm_ops) for fuzzy search (requires pg_trgm extension)
Step 4: Add in-memory Identity DB cache

lib/db/cache.ts: tenantCache — Map<string, Tenant> populated at startup, refreshed every 60s
Middleware reads tenant context from this cache (after JWT verification), not from DB per request
Step 5: Add compliance export

lib/actions/admin/export-audit-log.ts — generates CSV or JSON export of filtered audit logs
lib/actions/admin/export-patient-records.ts — exports a patient's full medical history as structured JSON (for legal/insurance requests)
Step 6: Add TPM support to guard binary (enterprise tier)

Feature-gated in guard/Cargo.toml: tpm = ["tss-esapi"]
Only compiled when building for enterprise tier
PCR verification as described above
Step 7: Add structured logging

lib/logging/logger.ts — wraps pino with request-id tracing
Server actions log at info level (action, tenant, actor, outcome)
Errors log at error level with stack traces
Step 8: Add health endpoint

app/api/health/route.ts — returns { status: "ok", db: "connected", license: "valid", uptime: N }
Verification & Definition of Done
 Tenant provisioning assigns to different db_host values in multi-instance setup
 Connection manager routes to correct instance based on db_host
 PgBouncer logs show connection pooling metrics
 Indexes exist in all tenant databases (verify via \di in psql)
 Audit log filtered queries return in <100ms (vs pre-index baseline)
 Patient fuzzy search returns in <200ms
 Identity DB cache reduces per-request DB calls for tenant resolution
 Audit log export produces valid JSON/CSV
 Health endpoint responds correctly
 Logs emit structured JSON with request IDs
 tsc --noEmit passes, next build succeeds, cargo build passes
APPENDIX A: Directory Structure at Phase 4 Completion

eaatiy-erp/
├── app/
│   ├── layout.tsx                    # Root layout (theme script, providers)
│   ├── page.tsx                      # Role-based redirect
│   ├── providers.tsx                 # I18nProvider + FAB wrapper
│   ├── globals.css
│   ├── error.tsx
│   ├── loading.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── error.tsx
│   ├── admin/
│   │   ├── page.tsx                  # Server component → fetches data → AdminPageShell
│   │   ├── admin-page-shell.tsx      # Client shell
│   │   ├── error.tsx
│   │   └── loading.tsx
│   ├── doctor/
│   │   ├── page.tsx
│   │   ├── doctor-page-shell.tsx
│   │   ├── error.tsx
│   │   └── loading.tsx
│   ├── receptionist/
│   │   ├── page.tsx
│   │   ├── receptionist-page-shell.tsx
│   │   ├── error.tsx
│   │   └── loading.tsx
│   ├── super-admin/
│   │   ├── page.tsx
│   │   ├── super-admin-shell.tsx
│   │   ├── error.tsx
│   │   └── loading.tsx
│   ├── settings/
│   │   └── license/
│   │       └── page.tsx               # License activation page (on-premise)
│   └── api/
│       ├── health/
│       │   └── route.ts
│       └── auth/
│           ├── login/route.ts
│           └── logout/route.ts
├── components/
│   ├── ui/                           # Shared primitives (button.tsx)
│   ├── admin/                        # 9 admin dashboard components
│   ├── doctor/                       # 8 doctor workspace components
│   ├── receptionist/                 # 8 receptionist components
│   ├── super-admin/                  # 4 super admin components (Phase 2C)
│   ├── auth/                         # login-form.tsx (Phase 2D)
│   └── floating-action-button.tsx
├── lib/
│   ├── types.ts                      # Domain types (Phase 1 — frozen)
│   ├── mock-data.ts                  # @deprecated (removed in Phase 2B)
│   ├── use-theme.ts
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── en.ts
│   │   ├── ar.ts
│   │   ├── use-t.ts
│   │   └── i18n-provider.tsx
│   ├── db/
│   │   ├── connection.ts             # Pool manager (Phase 2A)
│   │   ├── cache.ts                  # Identity DB cache (Phase 4)
│   │   ├── audit.ts                  # Transactional audit wrapper (Phase 2B)
│   │   ├── schema/
│   │   │   ├── identity/
│   │   │   │   ├── tenants.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── rbac_roles.ts
│   │   │   │   └── license_state.ts
│   │   │   └── tenant/
│   │   │       ├── patients.ts
│   │   │       ├── appointments.ts
│   │   │       ├── medical_records.ts
│   │   │       ├── prescriptions.ts
│   │   │       ├── billings.ts
│   │   │       ├── audit_logs.ts
│   │   │       └── transaction_watermark.ts
│   │   └── repositories/
│   │       ├── identity/
│   │       │   ├── tenants.ts
│   │       │   └── users.ts
│   │       ├── patients.ts
│   │       ├── appointments.ts
│   │       ├── medical-records.ts
│   │       ├── prescriptions.ts
│   │       ├── billings.ts
│   │       ├── audit-logs.ts
│   │       ├── users.ts
│   │       ├── tenants.ts
│   │       └── admin-kpis.ts
│   ├── actions/
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── logout.ts
│   │   ├── receptionist/
│   │   │   ├── register-patient.ts
│   │   │   ├── book-appointment.ts
│   │   │   ├── search-patients.ts
│   │   │   ├── get-today-queue.ts
│   │   │   ├── call-next.ts
│   │   │   ├── record-vitals.ts
│   │   │   ├── start-consultation.ts
│   │   │   ├── cancel-appointment.ts
│   │   │   └── mark-completed.ts
│   │   ├── doctor/
│   │   │   ├── get-my-queue.ts
│   │   │   ├── get-patient-data.ts
│   │   │   ├── save-draft.ts
│   │   │   ├── complete-consultation.ts
│   │   │   ├── create-prescription.ts
│   │   │   └── mark-billing-paid.ts
│   │   ├── admin/
│   │   │   ├── get-dashboard-data.ts
│   │   │   ├── get-revenue-data.ts
│   │   │   ├── get-appointments-data.ts
│   │   │   ├── get-audit-data.ts
│   │   │   ├── export-audit-log.ts
│   │   │   └── export-patient-records.ts
│   │   └── super-admin/
│   │       ├── provision-tenant.ts
│   │       ├── generate-license.ts
│   │       └── revoke-license.ts
│   ├── auth/
│   │   ├── jwt.ts                    # sign/verify JWT functions
│   │   ├── password.ts              # bcrypt hash/verify
│   │   └── auth-context.tsx         # Client auth context provider
│   ├── license/
│   │   └── public-key.ts            # Compiled-in public key constant
│   └── logging/
│       └── logger.ts                # Structured logging (Phase 4)
├── guard/                            # Native Rust license guard (Phase 3)
│   ├── Cargo.toml
│   ├── Dockerfile
│   └── src/
│       └── main.rs
├── gateway/                          # Gateway sidecar (Phase 3)
│   ├── Cargo.toml
│   ├── Dockerfile
│   └── src/
│       └── main.rs
├── scripts/
│   ├── seed.ts                       # Database seed script (Phase 2A)
│   ├── generate-jwt-keys.ts          # RS256 key pair generation (Phase 2C)
│   └── deploy-onprem.sh             # On-premise deployment (Phase 3)
├── middleware.ts                      # Auth + tenant context middleware (Phase 2D)
├── docker-compose.yml                # Dev PostgreSQL (Phase 2A)
├── docker-compose.onprem.yml         # Full on-premise stack (Phase 3)
├── Dockerfile                        # Next.js production image (Phase 3)
├── drizzle.config.ts                 # Drizzle Kit config (Phase 2A)
├── next.config.ts
├── tsconfig.json
├── package.json
└── MASTER_EXECUTION_PLAN.md          # This file
APPENDIX B: Key Technical Decisions (Non-Negotiable)
Decision	Choice	Why Not the Alternative
ORM	Drizzle	Prisma's single-db-per-client design and Rust binary make multi-database routing painful. Drizzle accepts any Pool instance, no codegen, works identically everywhere.
Database isolation	Schema-per-tenant (CREATE DATABASE)	RLS doesn't support on-premise. Per-instance PostgreSQL is operationally unmanageable at scale. Single-instance multi-database is the sweet spot.
License enforcement core	Native Rust binary	JavaScript license checks are trivially patched. A compiled binary raises the reverse-engineering cost from 2 hours to 40+ hours.
Connection pool strategy	Pool-per-tenant, lazy, with idle eviction	One global pool with RLS would work for cloud but fails on-premise. Pool-per-tenant is necessary but must be lazy to avoid explosion.
Auth token format	RS256 JWT in httpOnly cookie	LocalStorage XSS risk. Server-side session store adds DB dependency per request. JWT with middleware verification = zero-DB auth check.
Super Admin DB	Separate Identity DB, not RLS-shared	The Identity DB must be available even if a tenant DB is down. Colocation creates a SPOF.
On-premise kill switch	Gateway sidecar + license_state lockout, not remote wipe	Remote data destruction is legally dangerous. License-enforced access denial satisfies commercial needs without destroying patient data.
Grace period on expiry	7-day grace → read-only → locked	Hard cutoff creates support emergencies and damages customer relationships. Graceful degradation preserves access to data while enforcing payment.
APPENDIX C: Phase Dependency Graph

Phase 0 (Mock UI) ✓
Phase 1 (i18n/Theme/RTL) ✓
    ↓
Phase 2A (DB Foundation + ORM)
    ↓
Phase 2B (Repositories + Receptionist Wiring)
    ↓
Phase 2C (Super Admin + Tenant Provisioning + Licensing)
    ↓
Phase 2D (Authentication + Middleware)
    ↓
Phase 2E (Doctor Workspace Wiring)
    ↓
Phase 2F (Admin Analytics Wiring)
    ↓
Phase 3  (Docker + On-Premise + Guard Binary + Gateway)
    ↓
Phase 4  (Enterprise Hardening — Multi-Instance, TPM, Compliance, Perf)
APPENDIX D: Total Estimated Token Budget
Based on the Claude Code sessions in Phase 0/1 (which consumed ~80-120K tokens per phase for i18n):

Phase	Estimated Sessions	Tokens per Session	Total
2A	2 (install + schema + migration + seed)	~60K	~120K
2B	4-5 (repositories + actions + wiring each component)	~80K	~320-400K
2C	3 (identity repos + provisioning + license + UI)	~70K	~210K
2D	2 (JWT + middleware + login page + context)	~60K	~120K
2E	3 (doctor actions + queue + workspace + tabs)	~70K	~210K
2F	2 (admin repos + actions + chart data + wiring)	~70K	~140K
3	4 (Dockerfile + guard + gateway + compose + deploy)	~80K	~320K
4	2 (indexes + cache + export + logging)	~50K	~100K
Total	22-24 sessions		~1.5-1.6M tokens
This is an estimate. Actual consumption depends on retry loops, verification sessions, and the efficiency of prompt structure per the Part 1 protocol.

End of MASTER_EXECUTION_PLAN.md

