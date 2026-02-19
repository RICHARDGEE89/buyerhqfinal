-- ==========================================================
-- BuyerHQRank + portal hardening support migration
-- ==========================================================
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

-- ----------------------------------------------------------
-- Agent profile columns for BUYERHQRANK
-- ----------------------------------------------------------
alter table if exists public.agents add column if not exists about text;
alter table if exists public.agents add column if not exists slug text;

alter table if exists public.agents add column if not exists instagram_followers integer;
alter table if exists public.agents add column if not exists facebook_followers integer;
alter table if exists public.agents add column if not exists tiktok_followers integer;
alter table if exists public.agents add column if not exists youtube_subscribers integer;
alter table if exists public.agents add column if not exists linkedin_connections integer;
alter table if exists public.agents add column if not exists linkedin_followers integer;
alter table if exists public.agents add column if not exists pinterest_followers integer;
alter table if exists public.agents add column if not exists x_followers integer;
alter table if exists public.agents add column if not exists snapchat_followers integer;

alter table if exists public.agents add column if not exists google_rating numeric(3,2);
alter table if exists public.agents add column if not exists google_reviews integer;
alter table if exists public.agents add column if not exists facebook_rating numeric(3,2);
alter table if exists public.agents add column if not exists facebook_reviews integer;
alter table if exists public.agents add column if not exists ratemyagent_rating numeric(3,2);
alter table if exists public.agents add column if not exists ratemyagent_reviews integer;
alter table if exists public.agents add column if not exists trustpilot_rating numeric(3,2);
alter table if exists public.agents add column if not exists trustpilot_reviews integer;
alter table if exists public.agents add column if not exists productreview_rating numeric(3,2);
alter table if exists public.agents add column if not exists productreview_reviews integer;

alter table if exists public.agents add column if not exists total_followers integer not null default 0;
alter table if exists public.agents add column if not exists social_media_presence text not null default 'D';
alter table if exists public.agents add column if not exists authority_score integer not null default 0;
alter table if exists public.agents add column if not exists buyerhqrank text not null default 'STARTER';
alter table if exists public.agents add column if not exists profile_status text not null default 'Unclaimed';
alter table if exists public.agents add column if not exists verified text not null default 'Unverified';
alter table if exists public.agents add column if not exists claimed_at timestamptz;
alter table if exists public.agents add column if not exists last_updated timestamptz not null default timezone('utc'::text, now());

alter table public.agents drop constraint if exists agents_social_media_presence_check;
alter table public.agents add constraint agents_social_media_presence_check
  check (social_media_presence in ('A+','A','B+','B','C+','C','D+','D'));

alter table public.agents drop constraint if exists agents_profile_status_check;
alter table public.agents add constraint agents_profile_status_check
  check (profile_status in ('Claimed','Unclaimed'));

alter table public.agents drop constraint if exists agents_verified_check;
alter table public.agents add constraint agents_verified_check
  check (verified in ('Verified','Unverified'));

alter table public.agents drop constraint if exists agents_authority_score_check;
alter table public.agents add constraint agents_authority_score_check
  check (authority_score between 0 and 100);

alter table public.agents drop constraint if exists agents_total_followers_check;
alter table public.agents add constraint agents_total_followers_check
  check (total_followers >= 0);

create index if not exists idx_agents_authority_score on public.agents(authority_score desc);
create index if not exists idx_agents_profile_status on public.agents(profile_status);
create index if not exists idx_agents_buyerhqrank on public.agents(buyerhqrank);

-- ----------------------------------------------------------
-- Admin context helpers
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

create or replace function public.is_admin_context()
returns boolean
language sql
stable
as $$
  select public.is_admin_email() or coalesce(auth.role(), '') = 'service_role';
$$;

-- ----------------------------------------------------------
-- BUYERHQRANK calculation trigger
-- ----------------------------------------------------------
create or replace function public.compute_agents_buyerhqrank_fields()
returns trigger
language plpgsql
as $$
declare
  followers_blank boolean;
  social_score integer := 0;
  review_score integer := 0;
  completeness_score integer := 0;
  authority integer := 0;
  review_raw numeric := 0;
  max_review_raw numeric := 5 * ln(5001) * 5;
begin
  followers_blank :=
    NEW.instagram_followers is null and
    NEW.facebook_followers is null and
    NEW.tiktok_followers is null and
    NEW.youtube_subscribers is null and
    NEW.linkedin_connections is null and
    NEW.linkedin_followers is null and
    NEW.pinterest_followers is null and
    NEW.x_followers is null and
    NEW.snapchat_followers is null;

  NEW.instagram_followers := greatest(coalesce(NEW.instagram_followers, 0), 0);
  NEW.facebook_followers := greatest(coalesce(NEW.facebook_followers, 0), 0);
  NEW.tiktok_followers := greatest(coalesce(NEW.tiktok_followers, 0), 0);
  NEW.youtube_subscribers := greatest(coalesce(NEW.youtube_subscribers, 0), 0);
  NEW.linkedin_connections := greatest(coalesce(NEW.linkedin_connections, 0), 0);
  NEW.linkedin_followers := greatest(coalesce(NEW.linkedin_followers, 0), 0);
  NEW.pinterest_followers := greatest(coalesce(NEW.pinterest_followers, 0), 0);
  NEW.x_followers := greatest(coalesce(NEW.x_followers, 0), 0);
  NEW.snapchat_followers := greatest(coalesce(NEW.snapchat_followers, 0), 0);

  NEW.google_rating := least(greatest(coalesce(NEW.google_rating, 0), 0), 5);
  NEW.google_reviews := greatest(coalesce(NEW.google_reviews, 0), 0);
  NEW.facebook_rating := least(greatest(coalesce(NEW.facebook_rating, 0), 0), 5);
  NEW.facebook_reviews := greatest(coalesce(NEW.facebook_reviews, 0), 0);
  NEW.ratemyagent_rating := least(greatest(coalesce(NEW.ratemyagent_rating, 0), 0), 5);
  NEW.ratemyagent_reviews := greatest(coalesce(NEW.ratemyagent_reviews, 0), 0);
  NEW.trustpilot_rating := least(greatest(coalesce(NEW.trustpilot_rating, 0), 0), 5);
  NEW.trustpilot_reviews := greatest(coalesce(NEW.trustpilot_reviews, 0), 0);
  NEW.productreview_rating := least(greatest(coalesce(NEW.productreview_rating, 0), 0), 5);
  NEW.productreview_reviews := greatest(coalesce(NEW.productreview_reviews, 0), 0);

  NEW.total_followers :=
    NEW.instagram_followers +
    NEW.facebook_followers +
    NEW.tiktok_followers +
    NEW.youtube_subscribers +
    NEW.linkedin_connections +
    NEW.linkedin_followers +
    NEW.pinterest_followers +
    NEW.x_followers +
    NEW.snapchat_followers;

  if followers_blank then
    NEW.social_media_presence := 'D';
  elsif NEW.total_followers >= 10000 then
    NEW.social_media_presence := 'A+';
  elsif NEW.total_followers >= 8000 then
    NEW.social_media_presence := 'A';
  elsif NEW.total_followers >= 6000 then
    NEW.social_media_presence := 'B+';
  elsif NEW.total_followers >= 4000 then
    NEW.social_media_presence := 'B';
  elsif NEW.total_followers >= 2500 then
    NEW.social_media_presence := 'C+';
  elsif NEW.total_followers >= 1500 then
    NEW.social_media_presence := 'C';
  elsif NEW.total_followers >= 750 then
    NEW.social_media_presence := 'D+';
  else
    NEW.social_media_presence := 'D';
  end if;

  social_score := case NEW.social_media_presence
    when 'A+' then 40
    when 'A' then 36
    when 'B+' then 32
    when 'B' then 28
    when 'C+' then 22
    when 'C' then 16
    when 'D+' then 10
    else 5
  end;

  review_raw :=
      coalesce(NEW.google_rating, 0) * ln(coalesce(NEW.google_reviews, 0) + 1)
    + coalesce(NEW.facebook_rating, 0) * ln(coalesce(NEW.facebook_reviews, 0) + 1)
    + coalesce(NEW.ratemyagent_rating, 0) * ln(coalesce(NEW.ratemyagent_reviews, 0) + 1)
    + coalesce(NEW.trustpilot_rating, 0) * ln(coalesce(NEW.trustpilot_reviews, 0) + 1)
    + coalesce(NEW.productreview_rating, 0) * ln(coalesce(NEW.productreview_reviews, 0) + 1);

  if max_review_raw > 0 then
    review_score := round(least(40, greatest(0, (review_raw / max_review_raw) * 40)));
  else
    review_score := 0;
  end if;

  if coalesce(array_length(NEW.suburbs, 1), 0) > 0 then
    completeness_score := completeness_score + 5;
  end if;
  if coalesce(array_length(NEW.specializations, 1), 0) > 0 then
    completeness_score := completeness_score + 5;
  end if;
  if nullif(trim(coalesce(NEW.about, NEW.bio, '')), '') is not null then
    completeness_score := completeness_score + 5;
  end if;
  if nullif(trim(coalesce(NEW.fee_structure, '')), '') is not null then
    completeness_score := completeness_score + 5;
  end if;

  authority := least(100, greatest(0, social_score + review_score + completeness_score));
  NEW.authority_score := authority;

  NEW.buyerhqrank := case
    when authority >= 90 then 'ELITE+'
    when authority >= 80 then 'ELITE'
    when authority >= 70 then 'PREMIER'
    when authority >= 60 then 'ADVANCED'
    when authority >= 50 then 'ESTABLISHED'
    when authority >= 35 then 'ACTIVE'
    when authority >= 20 then 'DEVELOPING'
    else 'STARTER'
  end;

  if TG_OP = 'UPDATE' and not public.is_admin_context() then
    NEW.profile_status := OLD.profile_status;
    NEW.claimed_at := OLD.claimed_at;
    NEW.verified := OLD.verified;
  end if;

  NEW.profile_status := case when NEW.profile_status = 'Claimed' then 'Claimed' else 'Unclaimed' end;
  NEW.verified := case
    when NEW.verified = 'Verified' then 'Verified'
    when coalesce(NEW.is_verified, false) then 'Verified'
    else 'Unverified'
  end;

  if NEW.profile_status = 'Claimed' then
    NEW.verified := 'Verified';
    NEW.is_verified := true;
    if TG_OP = 'INSERT' then
      NEW.claimed_at := coalesce(NEW.claimed_at, timezone('utc'::text, now()));
    elsif coalesce(OLD.profile_status, 'Unclaimed') <> 'Claimed' then
      NEW.claimed_at := coalesce(NEW.claimed_at, timezone('utc'::text, now()));
    end if;
  else
    NEW.is_verified := NEW.verified = 'Verified';
    NEW.claimed_at := null;
  end if;

  NEW.last_updated := timezone('utc'::text, now());
  return NEW;
end;
$$;

drop trigger if exists trg_agents_buyerhqrank_fields on public.agents;
create trigger trg_agents_buyerhqrank_fields
before insert or update on public.agents
for each row
execute function public.compute_agents_buyerhqrank_fields();

-- Backfill derived columns.
update public.agents
set last_updated = timezone('utc'::text, now());

select 'BuyerHQRank migration complete' as status;
