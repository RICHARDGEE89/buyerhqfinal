-- ==========================================================
-- BuyerHQ one-shot production repair script
-- ==========================================================
-- Run this file ONCE in Supabase SQL Editor.
-- It is idempotent where practical and is designed to:
-- 1) create/repair required tables + columns
-- 2) fix missing agent flags (is_active/is_verified)
-- 3) remove recursive legacy users policy patterns
-- 4) reset and re-create RLS policies used by the app
-- 5) backfill admin_accounts for known admin emails
--
-- IMPORTANT:
-- - Run in the correct project database.
-- - This script intentionally resets policies on core tables.
--
-- ==========================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------
-- Core tables (create if missing)
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
  is_verified boolean not null default true,
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

create table if not exists public.admin_accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default timezone('utc'::text, now()),
  preferences jsonb not null default '{}'::jsonb
);

-- Legacy optional users table (compat only)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  first_name text,
  last_name text,
  role text check (role in ('buyer', 'agent', 'admin')) default 'buyer',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- ----------------------------------------------------------
-- Column compatibility (live environments)
-- ----------------------------------------------------------
alter table public.agents add column if not exists is_verified boolean not null default true;
alter table public.agents add column if not exists is_active boolean not null default true;
alter table public.agents add column if not exists licence_verified_at timestamptz;
alter table public.agents add column if not exists fee_structure text;
alter table public.agents add column if not exists suburbs text[] default '{}';
alter table public.agents add column if not exists specializations text[] default '{}';

alter table public.agent_profiles add column if not exists subscription_plan text not null default 'starter';
alter table public.agent_profiles add column if not exists billing_cycle text not null default 'monthly';
alter table public.agent_profiles add column if not exists subscription_status text not null default 'active';
alter table public.agent_profiles add column if not exists next_billing_at timestamptz default (timezone('utc'::text, now()) + interval '30 days');
alter table public.agent_profiles add column if not exists card_brand text;
alter table public.agent_profiles add column if not exists card_last4 text;
alter table public.agent_profiles add column if not exists cancel_at_period_end boolean not null default false;
alter table public.agent_profiles add column if not exists preferences jsonb not null default '{}'::jsonb;

alter table public.admin_accounts add column if not exists preferences jsonb not null default '{}'::jsonb;

update public.agents
set
  is_verified = coalesce(is_verified, true),
  is_active = coalesce(is_active, true)
where is_verified is null or is_active is null;

-- ----------------------------------------------------------
-- Constraints and indexes
-- ----------------------------------------------------------
alter table public.agent_profiles drop constraint if exists agent_profiles_subscription_plan_check;
alter table public.agent_profiles add constraint agent_profiles_subscription_plan_check
  check (subscription_plan in ('starter','verified-partner','enterprise'));

alter table public.agent_profiles drop constraint if exists agent_profiles_billing_cycle_check;
alter table public.agent_profiles add constraint agent_profiles_billing_cycle_check
  check (billing_cycle in ('monthly','annual'));

alter table public.agent_profiles drop constraint if exists agent_profiles_subscription_status_check;
alter table public.agent_profiles add constraint agent_profiles_subscription_status_check
  check (subscription_status in ('active','past_due','cancelled'));

create index if not exists idx_agents_state on public.agents(state);
create index if not exists idx_agents_verified_active on public.agents(is_verified, is_active);
create index if not exists idx_reviews_agent_id on public.reviews(agent_id);
create index if not exists idx_enquiries_agent_id on public.enquiries(agent_id);
create index if not exists idx_saved_agents_buyer_id on public.saved_agents(buyer_id);
create index if not exists idx_blog_posts_published on public.blog_posts(is_published, published_at desc);

-- ----------------------------------------------------------
-- Admin helper function (no recursive users dependency)
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

-- ----------------------------------------------------------
-- Enable RLS
-- ----------------------------------------------------------
alter table public.agents enable row level security;
alter table public.reviews enable row level security;
alter table public.enquiries enable row level security;
alter table public.saved_agents enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.blog_posts enable row level security;
alter table public.admin_accounts enable row level security;
alter table public.users enable row level security;

-- ----------------------------------------------------------
-- Drop ALL policies on core tables (clean reset)
-- ----------------------------------------------------------
do $$
declare
  target_table text;
  p record;
begin
  foreach target_table in array array[
    'agents',
    'reviews',
    'enquiries',
    'saved_agents',
    'agent_profiles',
    'contact_submissions',
    'blog_posts',
    'admin_accounts',
    'users'
  ]
  loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = target_table
    ) then
      for p in
        select policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = target_table
      loop
        execute format('drop policy if exists %I on public.%I', p.policyname, target_table);
      end loop;
    end if;
  end loop;
end $$;

-- ----------------------------------------------------------
-- Re-create policies used by the app
-- ----------------------------------------------------------

-- Agents
create policy "Public read active verified agents"
  on public.agents for select
  using (coalesce(is_active, true) = true and coalesce(is_verified, true) = true);

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

-- Reviews
create policy "Public read approved reviews"
  on public.reviews for select
  using (coalesce(is_approved, false) = true);

create policy "Authenticated insert reviews"
  on public.reviews for insert
  with check (auth.role() = 'authenticated');

create policy "Admins moderate reviews"
  on public.reviews for all
  using (public.is_admin_email())
  with check (public.is_admin_email());

-- Enquiries
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

-- Saved agents
create policy "Buyers manage saved agents"
  on public.saved_agents for all
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

-- Agent profiles
create policy "Users manage own agent_profile row"
  on public.agent_profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- Contact submissions
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

-- Blog posts
create policy "Public read published blog posts"
  on public.blog_posts for select
  using (coalesce(is_published, false) = true);

create policy "Admins manage blog posts"
  on public.blog_posts for all
  using (public.is_admin_email())
  with check (public.is_admin_email());

-- Admin accounts
create policy "Admins manage own admin_accounts"
  on public.admin_accounts for all
  using (id = auth.uid() and public.is_admin_email())
  with check (
    id = auth.uid()
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and public.is_admin_email()
  );

-- Legacy users table (compat, non-recursive)
create policy "Users can view own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (public.is_admin_email());

-- ----------------------------------------------------------
-- Backfill admin_accounts entries from auth.users
-- ----------------------------------------------------------
insert into public.admin_accounts (id, email)
select au.id, lower(au.email)
from auth.users au
where lower(au.email) in ('richardgoodwin@live.com', 'cam.dirtymack@gmail.com')
on conflict (id) do update
set email = excluded.email;

-- Optional: also mark legacy public.users role as admin
update public.users
set role = 'admin', updated_at = now()
where lower(email) in ('richardgoodwin@live.com', 'cam.dirtymack@gmail.com');

select 'BuyerHQ one-shot SQL repair complete' as status;
