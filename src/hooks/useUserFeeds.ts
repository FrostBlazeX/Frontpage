import { useEffect, useMemo, useState } from "react";
import { BLOG_FEEDS } from "../data/blogs";
import type { BlogFeed } from "../types/feed";
import { uniqueSlug } from "../utils/slugify";

export interface NewFeedInput {
  name: string;
  url: string;
  siteUrl: string;
  category: string;
}

export interface UseUserFeedsResult {
  feeds: BlogFeed[];
  hiddenCuratedFeeds: BlogFeed[];
  addFeed: (input: NewFeedInput) => void;
  renameFeed: (feedId: string, name: string) => void;
  removeFeed: (feedId: string) => void;
  restoreFeed: (feedId: string) => void;
  isCurated: (feedId: string) => boolean;
}

const FEED_COLOR_PALETTE = [
  "#2563EB",
  "#DB2777",
  "#C2410C",
  "#0D9488",
  "#7C3AED",
  "#B45309",
  "#059669",
  "#4338CA",
];

// Exported so useUserFeedsRemote can assign the same deterministic colors.
export function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (Math.imul(hash, 31) + id.charCodeAt(i)) | 0;
  return FEED_COLOR_PALETTE[Math.abs(hash) % FEED_COLOR_PALETTE.length];
}

// Curated feeds (BLOG_FEEDS) ship as static data and are never mutated —
// user additions/renames/removals all live in localStorage and are merged
// with the curated list at read time, the same pattern useCategories uses
// for category overrides.
export function useUserFeeds(): UseUserFeedsResult {
  const [userFeeds, setUserFeeds] = useState<BlogFeed[]>(() => {
    const saved = localStorage.getItem("userFeeds");
    return saved ? JSON.parse(saved) : [];
  });
  const [hiddenFeedIds, setHiddenFeedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("hiddenFeedIds");
    return saved ? JSON.parse(saved) : [];
  });
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("feedTitleOverrides");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("userFeeds", JSON.stringify(userFeeds));
  }, [userFeeds]);

  useEffect(() => {
    localStorage.setItem("hiddenFeedIds", JSON.stringify(hiddenFeedIds));
  }, [hiddenFeedIds]);

  useEffect(() => {
    localStorage.setItem("feedTitleOverrides", JSON.stringify(titleOverrides));
  }, [titleOverrides]);

  const isCurated = (feedId: string) => BLOG_FEEDS.some((f) => f.id === feedId);

  // Memoized so this only produces a new array reference when the underlying
  // state actually changes — useFeeds' fetch-all effect keys off this array's
  // identity, so an unmemoized literal here would refetch every feed on
  // every unrelated re-render anywhere in the app.
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
  };

  const renameFeed = (feedId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTitleOverrides((prev) => ({ ...prev, [feedId]: trimmed }));
  };

  const removeFeed = (feedId: string) => {
    if (isCurated(feedId)) {
      setHiddenFeedIds((prev) => (prev.includes(feedId) ? prev : [...prev, feedId]));
    } else {
      setUserFeeds((prev) => prev.filter((f) => f.id !== feedId));
    }
  };

  const restoreFeed = (feedId: string) => {
    setHiddenFeedIds((prev) => prev.filter((id) => id !== feedId));
  };

  return { feeds, hiddenCuratedFeeds, addFeed, renameFeed, removeFeed, restoreFeed, isCurated };
}
