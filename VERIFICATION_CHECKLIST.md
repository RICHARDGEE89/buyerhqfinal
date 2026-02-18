# BuyerHQ Rebuild Verification Checklist (Phase 8)

Date: 2026-02-18

## Phase 0 - Audit

- [x] Route, component, API, schema, style, and functionality audit completed (`AUDIT.md`).
- [x] Baseline lint/type/build behavior captured during rebuild.

## Phase 1 - Database & Supabase

- [x] Canonical schema maintained in `supabase/setup_production_db.sql`.
- [x] Required core tables present: `agents`, `reviews`, `enquiries`, `agent_profiles`, `contact_submissions`, `blog_posts`, `admin_accounts`.
- [x] Added operational tables required by rebuilt flows:
  - `saved_agents` (buyer shortlist persistence)
  - extended `agent_profiles` (billing + preferences fields)
  - extended `admin_accounts` (`preferences` JSON)
- [x] RLS policies updated for:
  - public read of verified/active agents and published blog posts
  - agent ownership over profile/leads
  - buyer access to own enquiries/saved agents
  - admin moderation permissions (allow-list email guard via `public.is_admin_email()`).
- [x] Seed script remains in `supabase/seed_rebuild.sql` with realistic agents/reviews/blog posts.
- [x] Typed DB contract updated in `src/lib/database.types.ts` with strict table row/insert/update types.

## Phase 2 - Design System

- [x] Rebuild uses shared primitives under `src/components/ui/*` (`Button`, `Card`, `Input`, `Select`, `Textarea`, `Checkbox`, `Modal`, `EmptyState`, `ErrorState`, `Skeleton`, etc.).
- [x] Duplicate legacy lowercase UI files removed to eliminate case-conflict build failures on Linux.

## Phase 3 - Page-by-Page Rebuild (remaining gaps resolved)

- [x] `/admin/verifications` now data-backed with approve/reject actions.
- [x] `/admin/bulk-upload` now validates JSON, normalizes legacy keys, and upserts agents.
- [x] `/admin/agents` created and fully wired (verify/activate/delete).
- [x] `/admin/users` created and wired (agent + buyer activity management).
- [x] `/admin/logs` created with live moderation/event feed.
- [x] `/admin/settings` created with persisted admin preferences + maintenance actions.
- [x] `/agent-portal/billing` rebuilt with persisted plan/cycle/status/payment controls.
- [x] `/agent-portal/profile` created for self-service public profile editing.
- [x] `/agent-portal/settings` created for account notifications and security actions.
- [x] `/dashboard/profile` created using Supabase auth metadata persistence.
- [x] `/dashboard/saved` rebuilt with shortlist load/remove/export/multi-enquiry actions.
- [x] `/dashboard/enquiries` rebuilt with live status filtering, follow-up, and close actions.
- [x] `/dashboard` overview rebuilt with live saved/enquiry/recommendation metrics.

## Phase 4 - API Routes

- [x] Existing rebuilt API routes remain functional:
  - `POST /api/contact`
  - `POST /api/enquiries`
  - `GET /api/agents`
  - `GET /api/agents/[id]`
  - `GET /api/stats`
- [x] `GET /api/agents` validates state query params against strict `StateCode`.

## Phase 5 - Navigation & Layout

- [x] Admin/Agent/Buyer nav links updated for newly added routes.
- [x] Header sign-in route normalized to `/login`.

## Phase 6 - Auth Flow

- [x] Buyer login/signup rebuilt without legacy `users` table dependency.
- [x] Role routing implemented at sign-in:
  - admin allow-list -> `/admin`
  - linked agent profile -> `/agent-portal`
  - default buyer -> `/dashboard`
- [x] `/admin-login` now clean alias redirecting to `/login?next=/admin`.
- [x] Buyer route protection added (`/dashboard*`) in middleware + `ProtectedRoute`.

## Phase 7 - Final Polish

- [x] Loading/error/empty states applied on newly rebuilt admin/agent/buyer pages.
- [x] Build-time `Button asChild` slot bug fixed (single-child compliance).
- [x] Full static generation now succeeds across public/auth pages.

## Phase 8 - Verification Commands

- [x] `npm run lint` -> pass
- [x] `npx tsc --noEmit` -> pass
- [x] `npm run build` -> pass
