-- Reading Analytics differentiator: attribute each read event to the feed and
-- category it happened in, so category/source breakdowns don't require
-- re-fetching ephemeral feed data. Nullable because existing rows (and any
-- read recorded when the item's feed/category can't be resolved) predate this
-- column and simply won't appear in the category/source breakdowns.
alter table public.read_events
  add column feed_id text,
  add column category_key text;
