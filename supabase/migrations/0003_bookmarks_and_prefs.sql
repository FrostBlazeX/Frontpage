-- Bookmarks / Save for Later differentiator-adjacent stretch feature, plus
-- the auto-refresh interval preference (Refresh & Polling). Both are small
-- additive changes bundled into one migration.

create table public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.bookmarks enable row level security;
create policy "own bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.preferences
  add column auto_refresh_interval text not null default 'off';
