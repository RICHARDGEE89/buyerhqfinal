-- ==========================================================
-- BuyerHQ Rebuild Canonical Schema + RLS
-- ==========================================================
-- Run in Supabase SQL editor.
-- This script is idempotent where practical.

create extension if not exists pgcrypto;

-- ----------------------------------------------------------
-- Core tables
-- ----------------------------------------------------------
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  name text not null,
  email text not null unique,
  phone text,
  agency_name text,
  bio text,
  avatar_url text,
  state text check (state in ('NSW','VIC','QLD','WA','SA','TAS','ACT','NT')),
  suburbs text[] default '{}',
  specializations text[] default '{}',
  years_experience integer,
  properties_purchased integer,
  avg_rating numeric(2,1),
  review_count integer default 0,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  licence_number text,
  licence_verified_at timestamptz,
  website_url text,
  linkedin_url text,
  fee_structure text
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  agent_id uuid not null references public.agents(id) on delete cascade,
  buyer_name text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  property_suburb text,
  property_type text,
  is_approved boolean not null default false
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  agent_id uuid not null references public.agents(id) on delete cascade,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  budget_min integer,
  budget_max integer,
  target_suburbs text[] default '{}',
  property_type text,
  message text,
  status text not null default 'new' check (status in ('new', 'viewed', 'responded', 'closed')),
  is_read boolean not null default false
);

create table if not exists public.saved_agents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  unique (buyer_id, agent_id)
);

create table if not exists public.agent_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  subscription_plan text not null default 'starter'
    check (subscription_plan in ('starter','verified-partner','enterprise')),
  billing_cycle text not null default 'monthly'
    check (billing_cycle in ('monthly','annual')),
  subscription_status text not null default 'active'
    check (subscription_status in ('active','past_due','cancelled')),
  next_billing_at timestamptz default (timezone('utc'::text, now()) + interval '30 days'),
  card_brand text,
  card_last4 text,
  cancel_at_period_end boolean not null default false,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (agent_id)
);

alter table public.agent_profiles
  add column if not exists subscription_plan text not null default 'starter';
alter table public.agent_profiles
  add column if not exists billing_cycle text not null default 'monthly';
alter table public.agent_profiles
  add column if not exists subscription_status text not null default 'active';
alter table public.agent_profiles
  add column if not exists next_billing_at timestamptz default (timezone('utc'::text, now()) + interval '30 days');
alter table public.agent_profiles
  add column if not exists card_brand text;
alter table public.agent_profiles
  add column if not exists card_last4 text;
alter table public.agent_profiles
  add column if not exists cancel_at_period_end boolean not null default false;
alter table public.agent_profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;

alter table public.agent_profiles drop constraint if exists agent_profiles_subscription_plan_check;
alter table public.agent_profiles add constraint agent_profiles_subscription_plan_check
  check (subscription_plan in ('starter','verified-partner','enterprise'));
alter table public.agent_profiles drop constraint if exists agent_profiles_billing_cycle_check;
alter table public.agent_profiles add constraint agent_profiles_billing_cycle_check
  check (billing_cycle in ('monthly','annual'));
alter table public.agent_profiles drop constraint if exists agent_profiles_subscription_status_check;
alter table public.agent_profiles add constraint agent_profiles_subscription_status_check
  check (subscription_status in ('active','past_due','cancelled'));

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  name text,
  email text,
  subject text,
  message text,
  is_resolved boolean not null default false
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  title text,
  slug text unique,
  excerpt text,
  content text,
  category text,
  author text,
  published_at timestamptz,
  is_published boolean not null default true,
  cover_image_url text
);

-- Lightweight admin lookup table used by RLS.
create table if not exists public.admin_accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.admin_accounts
  add column if not exists preferences jsonb not null default '{}'::jsonb;

create index if not exists idx_agents_state on public.agents(state);
create index if not exists idx_agents_verified_active on public.agents(is_verified, is_active);
create index if not exists idx_reviews_agent_id on public.reviews(agent_id);
create index if not exists idx_enquiries_agent_id on public.enquiries(agent_id);
create index if not exists idx_saved_agents_buyer_id on public.saved_agents(buyer_id);
create index if not exists idx_blog_posts_published on public.blog_posts(is_published, published_at desc);

-- ----------------------------------------------------------
-- RLS
-- ----------------------------------------------------------
create or replace function public.is_admin_email()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'richardgoodwin@live.com',
    'cam.dirtymack@gmail.com'
  );
$$;

alter table public.agents enable row level security;
alter table public.reviews enable row level security;
alter table public.enquiries enable row level security;
alter table public.saved_agents enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.blog_posts enable row level security;
alter table public.admin_accounts enable row level security;

drop policy if exists "Public read active verified agents" on public.agents;
drop policy if exists "Agent owners can update own row" on public.agents;
drop policy if exists "Authenticated users can create agents" on public.agents;
drop policy if exists "Anyone can submit agent applications" on public.agents;
drop policy if exists "Admins manage agents" on public.agents;
create policy "Public read active verified agents"
  on public.agents for select
  using (is_active = true and is_verified = true);
create policy "Agent owners can update own row"
  on public.agents for update
  using (
    exists (
      select 1
      from public.agent_profiles ap
      where ap.id = auth.uid()
        and ap.agent_id = agents.id
    )
  )
  with check (
    exists (
      select 1
      from public.agent_profiles ap
      where ap.id = auth.uid()
        and ap.agent_id = agents.id
    )
  );
create policy "Anyone can submit agent applications"
  on public.agents for insert
  with check (coalesce(is_verified, false) = false);
create policy "Admins manage agents"
  on public.agents for all
  using (public.is_admin_email())
  with check (public.is_admin_email());

drop policy if exists "Public read approved reviews" on public.reviews;
drop policy if exists "Authenticated insert reviews" on public.reviews;
drop policy if exists "Admins moderate reviews" on public.reviews;
create policy "Public read approved reviews"
  on public.reviews for select
  using (is_approved = true);
create policy "Authenticated insert reviews"
  on public.reviews for insert
  with check (auth.role() = 'authenticated');
create policy "Admins moderate reviews"
  on public.reviews for all
  using (public.is_admin_email())
  with check (public.is_admin_email());

drop policy if exists "Agents read own enquiries" on public.enquiries;
drop policy if exists "Agents update own enquiries" on public.enquiries;
drop policy if exists "Anyone insert enquiries" on public.enquiries;
drop policy if exists "Buyers read own enquiries by email" on public.enquiries;
drop policy if exists "Admins manage enquiries" on public.enquiries;
create policy "Agents read own enquiries"
  on public.enquiries for select
  using (
    exists (
      select 1
      from public.agent_profiles ap
      where ap.id = auth.uid()
        and ap.agent_id = enquiries.agent_id
    )
  );
create policy "Agents update own enquiries"
  on public.enquiries for update
  using (
    exists (
      select 1
      from public.agent_profiles ap
      where ap.id = auth.uid()
        and ap.agent_id = enquiries.agent_id
    )
  )
  with check (
    exists (
      select 1
      from public.agent_profiles ap
      where ap.id = auth.uid()
        and ap.agent_id = enquiries.agent_id
    )
  );
create policy "Anyone insert enquiries"
  on public.enquiries for insert
  with check (true);
create policy "Buyers read own enquiries by email"
  on public.enquiries for select
  using (lower(buyer_email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy "Admins manage enquiries"
  on public.enquiries for all
  using (public.is_admin_email())
  with check (public.is_admin_email());

drop policy if exists "Buyers manage saved agents" on public.saved_agents;
create policy "Buyers manage saved agents"
  on public.saved_agents for all
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

drop policy if exists "Users manage own agent_profile row" on public.agent_profiles;
create policy "Users manage own agent_profile row"
  on public.agent_profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Anyone insert contact submissions" on public.contact_submissions;
drop policy if exists "Admins read contact submissions" on public.contact_submissions;
drop policy if exists "Admins update contact submissions" on public.contact_submissions;
create policy "Anyone insert contact submissions"
  on public.contact_submissions for insert
  with check (true);
create policy "Admins read contact submissions"
  on public.contact_submissions for select
  using (public.is_admin_email());
create policy "Admins update contact submissions"
  on public.contact_submissions for update
  using (public.is_admin_email())
  with check (public.is_admin_email());

drop policy if exists "Public read published blog posts" on public.blog_posts;
drop policy if exists "Admins manage blog posts" on public.blog_posts;
create policy "Public read published blog posts"
  on public.blog_posts for select
  using (is_published = true);
create policy "Admins manage blog posts"
  on public.blog_posts for all
  using (public.is_admin_email())
  with check (public.is_admin_email());

drop policy if exists "Admins read admin_accounts" on public.admin_accounts;
drop policy if exists "Admins manage own admin_accounts" on public.admin_accounts;
create policy "Admins manage own admin_accounts"
  on public.admin_accounts for all
  using (id = auth.uid() and public.is_admin_email())
  with check (
    id = auth.uid()
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and public.is_admin_email()
  );

select 'BuyerHQ rebuild schema + RLS complete' as status;
