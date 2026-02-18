## BuyerHQ Full Project Audit
Date: 2026-02-18  
Scope: Full tracked codebase and SQL scripts read before any rebuild edits.

---

## 0.1 — File & Folder Structure Audit

### Routes/pages discovered (`src/app`)

- `/` → `src/app/(public)/page.tsx`
- `/agents` → `src/app/(public)/agents/page.tsx`
- `/agents/[slug]` → `src/app/(public)/agents/[slug]/page.tsx`
- `/blog` → `src/app/(public)/blog/page.tsx`
- `/contact` → `src/app/(public)/contact/page.tsx`
- `/faq` → `src/app/(public)/faq/page.tsx`
- `/how-it-works` → `src/app/(public)/how-it-works/page.tsx`
- `/about` → `src/app/(public)/about/page.tsx`
- `/privacy` → `src/app/(public)/privacy/page.tsx`
- `/terms` → `src/app/(public)/terms/page.tsx`
- `/why-buyerhq` → `src/app/(public)/why-buyerhq/page.tsx`
- `/get-matched` → `src/app/(public)/get-matched/page.tsx`
- `/get-matched/results` → `src/app/(public)/get-matched/results/page.tsx`
- `/login` → `src/app/(auth)/login/page.tsx`
- `/signup` → `src/app/(auth)/signup/page.tsx`
- `/join` → `src/app/(auth)/join/page.tsx`
- `/admin-login` → `src/app/(auth)/admin-login/page.tsx`
- `/dashboard` → `src/app/(buyer)/dashboard/page.tsx`
- `/dashboard/saved` → `src/app/(buyer)/dashboard/saved/page.tsx`
- `/dashboard/enquiries` → `src/app/(buyer)/dashboard/enquiries/page.tsx`
- `/agent-portal` → `src/app/(agent)/agent-portal/page.tsx`
- `/agent-portal/leads` → `src/app/(agent)/agent-portal/leads/page.tsx`
- `/agent-portal/billing` → `src/app/(agent)/agent-portal/billing/page.tsx`
- `/admin` → `src/app/(admin)/admin/page.tsx`
- `/admin/verifications` → `src/app/(admin)/admin/verifications/page.tsx`
- `/admin/bulk-upload` → `src/app/(admin)/admin/bulk-upload/page.tsx`

### API routes discovered

- `POST /api/contact` → `src/app/api/contact/route.ts`
- `GET /auth/callback` (non-api auth callback route) → `src/app/auth/callback/route.ts`

### Components discovered (`src/components`)

- **Layout:** `layout/Navbar.tsx`, `layout/Footer.tsx`
- **Agents:** `AgentCard.tsx`, `AgentSearchHeader.tsx`, `FeaturedAgents.tsx`, `FilterSidebar.tsx`
- **Home:** `HeroSection.tsx`, `TrustBar.tsx`, `HowItWorks.tsx`, `WhyBuyerHQ.tsx`, `LocationGrid.tsx`, `LatestInsights.tsx`, `MatchCTA.tsx`, `SearchBar.tsx`, `FAQSection.tsx`
- **Brand:** `Logo.tsx`, `Badges.tsx`
- **UI primitives:** `button.tsx`, `card.tsx`, `input.tsx`, `textarea.tsx`, `badge.tsx`, `checkbox.tsx`, `avatar.tsx`, `accordion.tsx`, `dropdown-menu.tsx`, `progress.tsx`

### Hooks discovered

- No dedicated `src/hooks` directory exists.
- State/effect logic is inline in page/component files.

### Utilities / libs discovered

- `src/lib/utils.ts`
- `src/lib/matching.ts`
- `src/lib/supabase.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/types/index.ts`
- `src/middleware.ts`

### Imported files that do not exist

- **None detected** (import graph check reports `MISSING_IMPORTS = 0`).

### Existing files never imported

Import graph non-entry files with zero inbound imports:

- `src/components/ui/avatar.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/lib/matching.ts`
- `src/lib/supabase.ts` (used by auth/admin pages in runtime, but not imported by most app code)
- `src/types/index.ts` (mostly referenced via `@/types` alias from some files, but still largely underused relative to schema)

Framework entrypoint files are naturally not imported (pages/layout/route files, middleware, robots, sitemap).

---

## 0.2 — Database Audit

### SQL/schema files present

- `supabase_schema.sql`
- `supabase/setup_production_db.sql`
- `supabase/add_users_table.sql`
- `supabase/seed_admins.sql`
- `supabase/sync_admin_accounts.sql`
- `ULTIMATE_DATABASE_SETUP.sql`
- `PRODUCTION_DATABASE_FINAL.sql`
- `DATABASE_FIX_FINAL.sql`

### Current schema (actual codebase scripts) is inconsistent

The SQL scripts define a **legacy/alternative model**, not the required model in the rebuild prompt.

Primary tables currently defined across scripts:

- `public.users`
- `public.agents` (agent `id` tied to `users.id`, includes `slug`, `business_name`, `primary_suburb`, etc.)
- `public.enquiries`
- `public.saved_agents`
- `public.match_results`
- `public.agent_case_studies` (in `supabase_schema.sql`)

### Missing required tables from rebuild brief

The following required tables are **not properly present** in a unified canonical schema:

- `reviews` (required as first-class table; current review data is mock in UI)
- `agent_profiles` (auth-linked portal mapping table required by brief)
- `contact_submissions` (required; current contact API sends email via Resend, does not insert DB)
- `blog_posts` (required; blog is hardcoded in frontend)

### Relationship audit (existing scripts)

- `users.id` references `auth.users.id`
- `agents.id` references `users.id` (not independent agent UUID as required target model)
- `enquiries.agent_id` references `agents.id`
- `enquiries.buyer_id` references `users.id`
- `saved_agents` bridges buyers and agents
- `match_results.buyer_id` references `users.id`
- `agent_case_studies.agent_id` references `agents.id`

### RLS policy audit (existing scripts)

Policies are duplicated and contradictory across SQL files; examples:

- Multiple variants of "public agents are viewable by everyone" (`USING true`)
- Enquiry insert policy alternates between:
  - buyer-auth-only checks
  - `WITH CHECK (true)` allowing anyone
- Admin policies are recursive in some scripts and "fixed" in others
- No canonical policies for required `reviews`, `contact_submissions`, `blog_posts`, `agent_profiles`

### Supabase calls in code (current)

Supabase usage locations:

- Auth callback route (`exchangeCodeForSession`)
- Auth pages (`/login`, `/signup`, `/join`, `/admin-login`)
- Agent portal dashboard
- Agents directory page (`/agents`)
- Buyer saved agents page
- Admin bulk upload

Tables currently queried in app code:

- `agents`
- `enquiries`
- `users`
- `saved_agents`

### Where Supabase should be called but currently is not

- Homepage stats, featured agents, state counts
- Blog index and single post
- FAQ content (static only)
- Agent profile (`/agents/[slug]` uses hardcoded mock)
- Quiz results matching
- Contact submissions (should insert DB)
- Admin dashboard moderation/management tables
- Agent portal leads statuses and profile completion

### Broken/incomplete/no-data query behavior

- `FeaturedAgents` component hardcodes empty array.
- `TrustBar` hardcodes all stats to zero.
- `LocationGrid` hardcodes all state counts to zero.
- `/blog` uses static mock posts only.
- `/agents/[slug]` uses local mock object; not DB.
- `/get-matched/results` hardcodes empty `mockResults`.
- `/agents` uses minimal query (`subscription_status='active'`) and fallback to all agents; no full filters/pagination as required.
- `POST /api/contact` sends email only; no `contact_submissions` insert.

---

## 0.3 — Theme & Style Audit

### Tailwind config audit (`tailwind.config.ts`)

Issues:

- Not aligned to required strict dark monotone token system.
- Defines legacy semantic tokens (`warm`, `verified`, `teal`, etc.) that are inconsistently used.
- Uses light background defaults (`background: #FFFFFF`) contrary to required dark base (`#080808`).
- Typography scale does not match required named scale (`display-xl`, `display-lg`, etc.).

### Global CSS audit (`src/app/globals.css`)

Issues:

- Light theme default background/text.
- Does not implement required global base/scrollbar/selection/focus treatment from brief.
- Uses DM Sans custom variable rather than required Geist + Geist Mono pairing.

### Hardcoded/rogue style values

- Hex hardcoded in layouts:
  - `src/app/(agent)/layout.tsx` → `bg-[#F8FAFC]`
  - `src/app/(admin)/layout.tsx` → `bg-[#F1F5F9]`
- Multiple non-design-system colors in classes:
  - `bg-red-50`, `text-red-600`
  - gradient tokens and legacy color names (`from-teal`, `shadow-teal`, etc.)

### Visual style inconsistency findings

- Public pages use one style language (rounded, white cards).
- Buyer, agent, and admin shells use separate palettes and spacing systems.
- Component variants are inconsistent (`Button` API + ad hoc custom class styling everywhere).
- Badge styling patterns differ between `brand/Badges.tsx` and `ui/badge.tsx`.

### Responsive/layout break risks

- Buyer mobile menu toggle state exists but no mobile menu panel rendering.
- Several desktop-first layouts rely on large fixed paddings/gaps and huge radii.
- Multiple dense admin/agent card grids likely overflow or compress at tablet widths.

---

## 0.4 — Functionality Audit

### Buttons and click behavior

Inventory scan:

- Total `<Button>` usages: **69**
- With explicit `onClick`: **14**
- Without explicit `onClick`: **55**

Interpretation:

- Many without `onClick` are valid submit buttons or wrapped in `Link`.
- A significant subset are **visual-only controls** (no handler, no submit, no navigation) especially in admin/agent dashboards.

Examples of actionless/placeholder controls:

- Admin: "System Health", "Review Docs", "Approve Expert", "Reject / Flag", quick-action buttons.
- Agent billing: "Change Plan", "Cancel Subscription", invoice download icon (UI only).
- Agent layout: "Log Out" button has no sign-out handler.
- Buyer layout: "Sign Out" button has no sign-out handler.
- Agent profile page CTA buttons have no enquiry submit logic.

### Forms audit

Detected forms:

1. `SearchBar` (`onSubmit`) — redirects to `/agents?q=...`, no server validation.
2. Contact form (`/contact`) — has client-side required check; submits to `/api/contact`; API currently emails only.
3. Admin login form — submits with Supabase auth and role check.

Other major user flows are pseudo-forms using buttons/state only:

- `/join` multi-step uses state; limited validation; inserts only partial agent data.
- `/get-matched` quiz uses client state and querystring navigation.

### Navigation link audit

- Static link scan found **49** navigation targets.
- Static route resolution check: **0 broken static links**.
- However, many links route to pages that are placeholder-quality relative to rebuild requirements.

### State initialized but unused or functionally ineffective

- Buyer layout `isMobileMenuOpen` toggles icon but no menu panel shown.
- Multiple mock-state fields in `/join` and `/get-matched/results` do not connect to persistent backend logic.

### API route connectivity

- Existing API route: `POST /api/contact` only.
- Frontend call to `/api/contact` exists.
- Missing required routes:
  - `POST /api/enquiries`
  - `GET /api/agents`
  - `GET /api/agents/[id]`
  - `GET /api/stats`

---

## Baseline Quality Checks (pre-rebuild)

- `npm run lint` → passes.
- `npx tsc --noEmit` → passes.
- `npm run build` → fails during prerender for auth/data pages because Supabase browser client uses non-null env assertions without safe fallback.

---

## Rebuild decisions (pre-implementation)

1. Adopt a single canonical Supabase schema matching rebuild brief exactly.
2. Replace theme with strict dark monotone design tokens and remove legacy color drift.
3. Centralize data access via typed DB client and required API routes.
4. Replace placeholder/mocked UI logic with real DB-backed flows.
5. Add full loading, error, empty, auth, and route protection behaviors.

