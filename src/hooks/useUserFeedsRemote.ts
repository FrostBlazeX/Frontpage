import { useEffect, useMemo, useState } from "react";
import { BLOG_FEEDS } from "../data/blogs";
import type { BlogFeed } from "../types/feed";
import { supabase, fireAndForget } from "../lib/supabaseClient";
import { uniqueSlug } from "../utils/slugify";
import { colorForId } from "./useUserFeeds";
import type { NewFeedInput, UseUserFeedsResult } from "./useUserFeeds";

// Supabase-backed counterpart to useUserFeeds. See
// supabase/migrations/0001_init.sql for the `custom_feeds` / `hidden_feeds` /
// `feed_title_overrides` tables this reads/writes.
export function useUserFeedsRemote(userId: string): UseUserFeedsResult {
  const [userFeeds, setUserFeeds] = useState<BlogFeed[]>([]);
  const [hiddenFeedIds, setHiddenFeedIds] = useState<string[]>([]);
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [{ data: customRows }, { data: hiddenRows }, { data: titleRows }] = await Promise.all([
        supabase
          .from("custom_feeds")
          .select("id,name,url,site_url,category,color")
          .eq("user_id", userId),
        supabase.from("hidden_feeds").select("feed_id").eq("user_id", userId),
        supabase.from("feed_title_overrides").select("feed_id,title").eq("user_id", userId),
      ]);
      if (cancelled) return;

      if (customRows) {
        setUserFeeds(
          customRows.map((r) => ({
            id: r.id,
            name: r.name,
            url: r.url,
            siteUrl: r.site_url,
            category: r.category,
            color: r.color,
          })),
        );
      }
      if (hiddenRows) setHiddenFeedIds(hiddenRows.map((r) => r.feed_id));
      if (titleRows) {
        const map: Record<string, string> = {};
        for (const row of titleRows) map[row.feed_id] = row.title;
        setTitleOverrides(map);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isCurated = (feedId: string) => BLOG_FEEDS.some((f) => f.id === feedId);

  const feeds: BlogFeed[] = useMemo(
    () =>
      [...BLOG_FEEDS.filter((f) => !hiddenFeedIds.includes(f.id)), ...userFeeds].map((feed) =>
        titleOverrides[feed.id] ? { ...feed, name: titleOverrides[feed.id] } : feed,
      ),
    [hiddenFeedIds, userFeeds, titleOverrides],
  );

  const hiddenCuratedFeeds: BlogFeed[] = useMemo(
    () => BLOG_FEEDS.filter((f) => hiddenFeedIds.includes(f.id)),
    [hiddenFeedIds],
  );

  const addFeed = (input: NewFeedInput) => {
    const existingIds = new Set([...BLOG_FEEDS.map((f) => f.id), ...userFeeds.map((f) => f.id)]);
    const id = uniqueSlug(input.name, existingIds);
    const feed: BlogFeed = {
      id,
      name: input.name,
      url: input.url,
      siteUrl: input.siteUrl,
      category: input.category,
      color: colorForId(id),
    };
    setUserFeeds((prev) => [...prev, feed]);
    fireAndForget(
      supabase.from("custom_feeds").insert({
        user_id: userId,
        id,
        name: feed.name,
        url: feed.url,
        site_url: feed.siteUrl,
        category: feed.category,
        color: feed.color,
      }),
    );
  };

  const renameFeed = (feedId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTitleOverrides((prev) => ({ ...prev, [feedId]: trimmed }));
    fireAndForget(
      supabase.from("feed_title_overrides").upsert({ user_id: userId, feed_id: feedId, title: trimmed }),
    );
  };

  const removeFeed = (feedId: string) => {
    if (isCurated(feedId)) {
      setHiddenFeedIds((prev) => (prev.includes(feedId) ? prev : [...prev, feedId]));
      fireAndForget(supabase.from("hidden_feeds").upsert({ user_id: userId, feed_id: feedId }));
    } else {
      setUserFeeds((prev) => prev.filter((f) => f.id !== feedId));
      fireAndForget(supabase.from("custom_feeds").delete().eq("user_id", userId).eq("id", feedId));
    }
  };

  const restoreFeed = (feedId: string) => {
    setHiddenFeedIds((prev) => prev.filter((id) => id !== feedId));
    fireAndForget(supabase.from("hidden_feeds").delete().eq("user_id", userId).eq("feed_id", feedId));
  };

  return { feeds, hiddenCuratedFeeds, addFeed, renameFeed, removeFeed, restoreFeed, isCurated };
}
