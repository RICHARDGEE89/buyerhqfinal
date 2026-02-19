-- BuyerHQ: External Reviews + Broker Console schema
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.agency_review_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  agent_id uuid not null references public.agents(id) on delete cascade,
  source text not null check (source in ('google_places', 'trustpilot', 'rate_my_agent', 'facebook', 'manual')),
  external_id text not null,
  external_url text,
  source_name text,
  is_active boolean not null default true,
  sync_frequency_minutes integer default 360,
  last_synced_at timestamptz,
  last_sync_status text check (last_sync_status in ('idle', 'success', 'failed')),
  last_sync_error text,
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists agency_review_sources_unique_source
  on public.agency_review_sources(agent_id, source, external_id);
create index if not exists agency_review_sources_agent_idx
  on public.agency_review_sources(agent_id);
create index if not exists agency_review_sources_active_idx
  on public.agency_review_sources(is_active, source);

drop trigger if exists trg_agency_review_sources_updated_at on public.agency_review_sources;
create trigger trg_agency_review_sources_updated_at
before update on public.agency_review_sources
for each row
execute function public.set_updated_at();

create table if not exists public.external_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  agent_id uuid not null references public.agents(id) on delete cascade,
  source_id uuid references public.agency_review_sources(id) on delete set null,
  source text not null check (source in ('google_places', 'trustpilot', 'rate_my_agent', 'facebook', 'manual')),
  external_review_id text not null,
  reviewer_name text,
  reviewer_avatar_url text,
  rating numeric(3,2) not null check (rating >= 0 and rating <= 5),
  review_text text,
  review_url text,
  reviewed_at timestamptz,
  is_approved boolean not null default false,
  is_hidden boolean not null default false,
  is_featured boolean not null default false,
  helpful_count integer,
  trust_weight numeric(5,2),
  sync_metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists external_reviews_unique_source_review
  on public.external_reviews(source, external_review_id, agent_id);
create index if not exists external_reviews_agent_idx
  on public.external_reviews(agent_id, is_approved, is_hidden);
create index if not exists external_reviews_source_idx
  on public.external_reviews(source, reviewed_at desc);

drop trigger if exists trg_external_reviews_updated_at on public.external_reviews;
create trigger trg_external_reviews_updated_at
before update on public.external_reviews
for each row
execute function public.set_updated_at();

create table if not exists public.broker_enquiry_states (
  enquiry_id uuid primary key references public.enquiries(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  owner_email text,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  stage text not null default 'incoming' check (stage in ('incoming', 'qualified', 'agent_outreach', 'waiting_agent', 'waiting_buyer', 'handoff', 'closed')),
  sla_due_at timestamptz,
  next_action text,
  last_touch_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists broker_enquiry_states_stage_idx
  on public.broker_enquiry_states(stage, priority);
create index if not exists broker_enquiry_states_owner_idx
  on public.broker_enquiry_states(owner_email);

drop trigger if exists trg_broker_enquiry_states_updated_at on public.broker_enquiry_states;
create trigger trg_broker_enquiry_states_updated_at
before update on public.broker_enquiry_states
for each row
execute function public.set_updated_at();

create table if not exists public.broker_enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  author_email text,
  note text not null,
  is_internal boolean not null default true
);

create index if not exists broker_enquiry_notes_enquiry_idx
  on public.broker_enquiry_notes(enquiry_id, created_at desc);

alter table public.agency_review_sources enable row level security;
alter table public.external_reviews enable row level security;
alter table public.broker_enquiry_states enable row level security;
alter table public.broker_enquiry_notes enable row level security;

drop policy if exists agency_review_sources_admin_all on public.agency_review_sources;
create policy agency_review_sources_admin_all
on public.agency_review_sources
for all
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists external_reviews_public_select on public.external_reviews;
create policy external_reviews_public_select
on public.external_reviews
for select
using (is_approved = true and is_hidden = false);

drop policy if exists external_reviews_admin_all on public.external_reviews;
create policy external_reviews_admin_all
on public.external_reviews
for all
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists broker_enquiry_states_admin_all on public.broker_enquiry_states;
create policy broker_enquiry_states_admin_all
on public.broker_enquiry_states
for all
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists broker_enquiry_notes_admin_all on public.broker_enquiry_notes;
create policy broker_enquiry_notes_admin_all
on public.broker_enquiry_notes
for all
using (public.is_admin_email())
with check (public.is_admin_email());

