-- Frontpage full-stack schema.
--
-- Mirrors the localStorage-backed hooks the frontend-only build already
-- uses (useCategories, useUserFeeds, useReadState, useLayoutPreference) one
-- table per concern, so migrating those hooks to Supabase-backed
-- equivalents is a straightforward swap rather than a redesign.
--
-- Every table is scoped to auth.uid() via Row Level Security — since the
-- client talks to Supabase directly with the public anon key, RLS (not any
-- client-side check) is the actual security boundary here.

create extension if not exists pgcrypto;

-- Categories: mirrors useCategories' Category{id,name} + order.
-- category_key is the stable slug id (e.g. "frontend"); renaming only ever
-- changes `name`, never `category_key`.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_key text not null,
  name text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, category_key)
);

alter table public.categories enable row level security;
create policy "own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Feed -> category assignment overrides. Mirrors feedCategoryOverrides.
create table public.feed_category_overrides (
  user_id uuid not null references auth.users(id) on delete cascade,
  feed_id text not null,
  category_key text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, feed_id)
);

alter table public.feed_category_overrides enable row level security;
create policy "own feed category overrides" on public.feed_category_overrides
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Curated feeds the user has removed. Mirrors hiddenFeedIds.
create table public.hidden_feeds (
  user_id uuid not null references auth.users(id) on delete cascade,
  feed_id text not null,
  hidden_at timestamptz not null default now(),
  primary key (user_id, feed_id)
);

alter table public.hidden_feeds enable row level security;
create policy "own hidden feeds" on public.hidden_feeds
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User-added feeds not in the curated set. Mirrors userFeeds.
-- `id` is the client-generated slug (see src/utils/slugify.ts), unique per
-- user rather than globally.
create table public.custom_feeds (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  site_url text not null,
  category text not null,
  color text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.custom_feeds enable row level security;
create policy "own custom feeds" on public.custom_feeds
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Feed title renames (curated or custom). Mirrors feedTitleOverrides.
create table public.feed_title_overrides (
  user_id uuid not null references auth.users(id) on delete cascade,
  feed_id text not null,
  title text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, feed_id)
);

alter table public.feed_title_overrides enable row level security;
create policy "own feed title overrides" on public.feed_title_overrides
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Read state — timestamped (unlike the guest's plain boolean map) so this
-- table doubles as the Reading Analytics differentiator's data source.
create table public.read_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  read_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.read_events enable row level security;
create policy "own read events" on public.read_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Per-user preferences (currently just layout). One row per user.
create table public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  layout text not null default 'list',
  last_visit_at timestamptz
);

alter table public.preferences enable row level security;
create policy "own preferences" on public.preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
