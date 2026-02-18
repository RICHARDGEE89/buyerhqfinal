-- ==========================================================
-- BuyerHQ live schema compatibility + policy repair
-- ==========================================================
-- Run this once in Supabase SQL editor for existing projects.
-- It repairs missing agent columns and removes recursive legacy
-- RLS policy patterns that reference public.users from itself.

create extension if not exists pgcrypto;

-- ----------------------------------------------------------
-- Core compatibility columns
-- ----------------------------------------------------------
alter table if exists public.agents
  add column if not exists is_verified boolean not null default true;

alter table if exists public.agents
  add column if not exists is_active boolean not null default true;

update public.agents
set
  is_verified = coalesce(is_verified, true),
  is_active = coalesce(is_active, true)
where is_verified is null or is_active is null;

alter table if exists public.agents
  alter column is_verified set default true;
alter table if exists public.agents
  alter column is_active set default true;

-- ----------------------------------------------------------
-- Admin lookup function (no public.users recursion)
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
-- Ensure admin_accounts exists
-- ----------------------------------------------------------
create table if not exists public.admin_accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default timezone('utc'::text, now()),
  preferences jsonb not null default '{}'::jsonb
);

alter table public.admin_accounts
  add column if not exists preferences jsonb not null default '{}'::jsonb;

-- ----------------------------------------------------------
-- Remove recursive legacy users policy if users table exists
-- ----------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'users'
  ) then
    execute 'drop policy if exists "Admins can view all users" on public.users';
    execute '
      create policy "Admins can view all users"
      on public.users for select
      using (public.is_admin_email())
    ';
  end if;
end $$;

-- ----------------------------------------------------------
-- Reset policies on key tables to non-recursive versions
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
    'admin_accounts'
  ]
  loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = target_table
    ) then
      execute format('alter table public.%I enable row level security', target_table);
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

select 'BuyerHQ live schema compatibility repair complete' as status;
