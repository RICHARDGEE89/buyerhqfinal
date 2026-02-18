<!--
High-level audit of BuyerHQ Next.js codebase (2026-02-18).

- Routing:
  - App uses the `app` router with segmented groups: `(public)`, `(buyer)`, `(agent)`, `(admin)`, `(auth)`.
  - All primary navigation and footer links (`/`, `/agents`, `/how-it-works`, `/faq`, `/about`, `/why-buyerhq`, `/get-matched`, `/contact`, `/privacy`, `/terms`, `/blog`, `/join`, `/login`, `/admin-login`) resolve to existing `page.tsx` files.
  - Dynamic route `/agents/[slug]` is implemented and renders a full agent profile view.
  - API routing is minimal: a single `auth/callback` route exists; no contact or form-specific API routes are currently present.

- Auth & dashboards:
  - Buyer login (`/login`), signup (`/signup`), and agent join (`/join`) flows are wired to Supabase auth using the shared client wrappers.
  - Buyer dashboard (`/dashboard`, `/dashboard/saved`, `/dashboard/enquiries`) and agent portal (`/agent-portal`, `/agent-portal/leads`, `/agent-portal/billing`) pages exist, with Supabase-backed data for saved agents, enquiries, and agent profiles.
  - Admin login (`/admin-login`) uses a separate `supabase` client and role check, then routes to admin dashboard (`/admin`) and verifications pages.

- Buttons, links, and interactions:
  - Global nav and footer links are correctly wired and navigate to real routes.
  - Core CTAs (get matched, join, login, agent portal, admin console, directory browse) are implemented and navigate as expected.
  - Several secondary admin actions (e.g. "System Health", "Invite New Agency", "Generate Site Report", "Review Flagged Content") currently render as buttons without concrete side effects beyond visual feedback.
  - The contact form renders fields and a submit button but does not yet submit to any API or show success/failure feedback.
  - The match quiz (`/get-matched`) collects answers in client state and navigates to `/get-matched/results` via query string; no server-side matching logic is attached yet.

- Data, state, and Supabase:
  - Supabase client abstractions exist for browser (`src/lib/supabase/client.ts`), server (`src/lib/supabase/server.ts`), and a generic `supabase.ts`; most new client-side pages correctly use the browser client wrapper.
  - Auth-based pages generally fetch `supabase.auth.getUser()` and guard redirects when no user is present.
  - Saved agents and enquiries use proper Supabase queries; error paths often log to `console.error` but do not yet surface user-friendly error messages.
  - Some dashboard metrics and admin/system health cards are populated with static numbers and copy; these act as presentational placeholders rather than live analytics.

- Design system and styling:
  - Tailwind config and `globals.css` define a predominantly monochrome palette (greyscale background, foreground, and primary/secondary colors), with DM Sans as the global font.
  - Legacy semantic color tokens (`bg-warm`, `bg-verified`, etc.) are still referenced across many components; some are not yet re-mapped in Tailwind and may currently rely on default or missing styles.
  - Layout and spacing are largely consistent, using rounded cards, large paddings, and responsive grids; hero/quiz/join flows are fully responsive in structure.

- Code health:
  - As of the latest run, `npm run lint` reports no ESLint errors or warnings.
  - No `TODO` or `FIXME` markers were found in the codebase; there are a few inline comments noting assumptions (e.g. placeholder names or behaviour).
  - A dedicated `test-supabase.js` script contains `console.log` debugging output but is not imported by runtime code.
  - There is some duplication in utility patterns (e.g. multiple inline `cn` helpers) and mixed use of different Supabase client entry points, but no obvious dead imports or missing file references in active routes.

Planned work next:
- Normalize legacy semantic color tokens (`warm`, `verified`, etc.) into the monochrome theme while preserving intent.
- Implement real submission + validation + user feedback for the public contact form.
- Make key dashboard/admin CTAs perform meaningful navigation or actions instead of being purely decorative.
- Tighten Supabase client usage for consistency and add more user-facing error/loading states where needed.
-->

