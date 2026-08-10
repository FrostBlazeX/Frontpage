import { useCallback, useEffect, useRef, useState } from "react";
import { BLOG_FEEDS } from "../data/blogs";
import type { ApiFeedResponse, BlogFeed, FeedHealth, FeedItem } from "../types/feed";

interface UseFeedsResult {
  items: FeedItem[];
  health: Record<string, FeedHealth>;
  loading: boolean;
  refresh: () => Promise<void>;
  retryFeed: (feedId: string) => Promise<void>;
  // Items that arrived on a refresh *after* the initial load (Refresh &
  // Polling's "N new items" indicator) — not counted on first mount, since
  // everything is "new" then and that isn't useful signal.
  newItemsCount: number;
  dismissNewItems: () => void;
}

// Core requirement #1: feed health is active/stale/error, not just up/down.
const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

// Exponential backoff for repeatedly-failing feeds: a bulk "Refresh" skips
// re-fetching a feed until its backoff window passes, so one dead feed
// doesn't get hammered every time the user refreshes. Manual per-feed retry
// (below) always bypasses this.
const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 30 * 60 * 1000;

const isKnownCuratedFeed = (feedId: string) => BLOG_FEEDS.some((f) => f.id === feedId);

function backoffMsFor(consecutiveFailures: number): number {
  if (consecutiveFailures <= 0) return 0;
  return Math.min(BASE_BACKOFF_MS * 2 ** (consecutiveFailures - 1), MAX_BACKOFF_MS);
}

function sortByPublishedAtDesc(items: FeedItem[]): FeedItem[] {
  return [...items].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
}

interface FetchOneResult {
  feedItems: FeedItem[];
  feedHealth: FeedHealth;
}

export function useFeeds(feeds: BlogFeed[]): UseFeedsResult {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [health, setHealth] = useState<Record<string, FeedHealth>>({});
  const [loading, setLoading] = useState(true);
  // Read/written mid-fetch without triggering renders per feed — `health`
  // state (derived from this) is what actually drives the UI.
  const attemptsRef = useRef<Record<string, { consecutiveFailures: number; lastAttemptAt: number }>>({});
  // Rapid successive feed-list changes (e.g. removing several feeds in a
  // row) can start a new refresh() before an older one's network requests
  // have resolved. Each call stamps its own token here; if a newer refresh
  // has started by the time an older one's results come back, the older one
  // discards them instead of clobbering state with stale data.
  const latestRefreshToken = useRef(0);
  // Lets retryFeed check "is this feed still around?" against the latest
  // value even though its own closure captured `feeds` at call time.
  const feedsRef = useRef(feeds);
  useEffect(() => {
    feedsRef.current = feeds;
  }, [feeds]);
  // Mirrors `items` outside React state so refresh() can diff against the
  // pre-refresh set without adding `items` to its own dependency array
  // (which would recreate it, and re-trigger the fetch-on-mount effect,
  // every time items change).
  const itemsRef = useRef<FeedItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const hasLoadedOnceRef = useRef(false);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const dismissNewItems = useCallback(() => setNewItemsCount(0), []);

  const fetchOne = useCallback(async (feed: BlogFeed): Promise<FetchOneResult> => {
    // Curated feeds resolve server-side via a fixed allow-list of ids;
    // user-added feeds (not in that list) pass their URL directly — see
    // api/feed.ts for why that's an acceptable, narrowly-scoped tradeoff.
    const query = isKnownCuratedFeed(feed.id)
      ? `feedId=${encodeURIComponent(feed.id)}`
      : `url=${encodeURIComponent(feed.url)}`;
    const response = await fetch(`/api/feed?${query}`);
    const data: ApiFeedResponse = await response.json();

    if (data.ok) {
      attemptsRef.current[feed.id] = { consecutiveFailures: 0, lastAttemptAt: Date.now() };
      const newestPublishedAt = data.items
        .map((item) => (item.publishedAt ? new Date(item.publishedAt).getTime() : null))
        .filter((time): time is number => time !== null)
        .reduce((max, time) => Math.max(max, time), 0);
      const isStale = newestPublishedAt > 0 && Date.now() - newestPublishedAt > STALE_AFTER_MS;

      return {
        feedItems: data.items.map((item) => ({
          ...item,
          feedId: feed.id,
          category: feed.category,
          color: feed.color,
          siteUrl: feed.siteUrl,
        })),
        feedHealth: {
          feedId: feed.id,
          status: isStale ? "stale" : "healthy",
          fetchedAt: data.fetchedAt,
          consecutiveFailures: 0,
        },
      };
    }

    const consecutiveFailures = (attemptsRef.current[feed.id]?.consecutiveFailures ?? 0) + 1;
    attemptsRef.current[feed.id] = { consecutiveFailures, lastAttemptAt: Date.now() };
    return {
      feedItems: [],
      feedHealth: {
        feedId: feed.id,
        status: "error",
        error: data.error,
        fetchedAt: data.fetchedAt,
        consecutiveFailures,
      },
    };
  }, []);

  const refresh = useCallback(async () => {
    const token = ++latestRefreshToken.current;
    setLoading(true);
    const now = Date.now();
    // A feed that's been removed (Feed Management) won't appear in any
    // result below since it's no longer in `feeds` to iterate — so without
    // this, its previously-fetched items/health would linger in state
    // forever. Prune anything not currently in `feeds` up front.
    const currentFeedIds = new Set(feeds.map((f) => f.id));

    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        const attempt = attemptsRef.current[feed.id];
        if (attempt && now - attempt.lastAttemptAt < backoffMsFor(attempt.consecutiveFailures)) {
          return { feedId: feed.id, skipped: true as const };
        }
        return { feedId: feed.id, skipped: false as const, ...(await fetchOne(feed)) };
      }),
    );

    if (latestRefreshToken.current !== token) return;

    if (hasLoadedOnceRef.current) {
      const prevIds = new Set(itemsRef.current.map((item) => item.id));
      let newCount = 0;
      for (const result of results) {
        if (result.status !== "fulfilled" || result.value.skipped) continue;
        for (const item of result.value.feedItems) {
          if (!prevIds.has(item.id)) newCount++;
        }
      }
      if (newCount > 0) setNewItemsCount((prev) => prev + newCount);
    }
    hasLoadedOnceRef.current = true;

    setItems((prevItems) => {
      let nextItems = prevItems.filter((item) => currentFeedIds.has(item.feedId));
      for (const result of results) {
        if (result.status !== "fulfilled" || result.value.skipped) continue;
        nextItems = [
          ...nextItems.filter((item) => item.feedId !== result.value.feedId),
          ...result.value.feedItems,
        ];
      }
      return sortByPublishedAtDesc(nextItems);
    });

    setHealth((prevHealth) => {
      const nextHealth: Record<string, FeedHealth> = {};
      for (const [feedId, feedHealth] of Object.entries(prevHealth)) {
        if (currentFeedIds.has(feedId)) nextHealth[feedId] = feedHealth;
      }
      for (const result of results) {
        if (result.status !== "fulfilled" || result.value.skipped) continue;
        nextHealth[result.value.feedId] = result.value.feedHealth;
      }
      return nextHealth;
    });

    setLoading(false);
  }, [feeds, fetchOne]);

  const retryFeed = useCallback(
    async (feedId: string) => {
      const feed = feeds.find((f) => f.id === feedId);
      if (!feed) return;

      // Manual retry calls fetchOne directly, skipping the backoff-window
      // check that only applies inside refresh()'s bulk loop — so there's no
      // gate to bypass here. Deliberately NOT touching attemptsRef before
      // this call: fetchOne reads the existing consecutiveFailures count to
      // increment it, and clearing it first would reset the streak back to 1
      // on every retry instead of tracking it accurately.
      const { feedItems, feedHealth } = await fetchOne(feed);

      // The feed may have been removed while this retry was in flight —
      // don't resurrect its items/health if so.
      if (!feedsRef.current.some((f) => f.id === feedId)) return;

      setItems((prevItems) =>
        sortByPublishedAtDesc([...prevItems.filter((item) => item.feedId !== feedId), ...feedItems]),
      );
      setHealth((prevHealth) => ({ ...prevHealth, [feedId]: feedHealth }));
    },
    [feeds, fetchOne],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; refresh() also backs the manual "Refresh" button, so it can't be split into an effect-only variant.
    refresh();
  }, [refresh]);

  return { items, health, loading, refresh, retryFeed, newItemsCount, dismissNewItems };
}
