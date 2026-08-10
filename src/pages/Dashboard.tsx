import { useEffect, useMemo } from "react";
import { useFeeds } from "../hooks/useFeeds";
import { useReadState } from "../hooks/useReadState";
import { useCategories } from "../hooks/useCategories";
import { useUserFeeds } from "../hooks/useUserFeeds";
import { useLayoutPreference } from "../hooks/useLayoutPreference";
import { useBookmarks } from "../hooks/useBookmarks";
import { useBookmarksRemote } from "../hooks/useBookmarksRemote";
import { useAutoRefreshInterval } from "../hooks/useAutoRefreshInterval";
import { useAutoRefreshIntervalRemote } from "../hooks/useAutoRefreshIntervalRemote";
import { AUTO_REFRESH_INTERVAL_MS } from "../hooks/useAutoRefreshInterval";
import { useReadStateRemote } from "../hooks/useReadStateRemote";
import type { ReadEventMeta } from "../hooks/useReadStateRemote";
import { useCategoriesRemote } from "../hooks/useCategoriesRemote";
import { useUserFeedsRemote } from "../hooks/useUserFeedsRemote";
import { usePreferencesRemote } from "../hooks/usePreferencesRemote";
import { useAuth } from "../hooks/useAuth";
import DashboardView from "./DashboardView";

// Guest (no session): everything localStorage-backed, unchanged from before
// auth existed. Each variant below calls a *fixed* set of hooks — picking
// between local/remote hooks conditionally inside one component would
// violate the rules of hooks, so the choice happens at the component level
// instead, via which of these two gets rendered.
function DashboardLocal() {
  const userFeedsApi = useUserFeeds();
  const { items, health, loading, refresh, retryFeed, newItemsCount, dismissNewItems } = useFeeds(
    userFeedsApi.feeds,
  );
  const readStateApi = useReadState();
  const categoriesApi = useCategories();
  const [layout, setLayout] = useLayoutPreference();
  const bookmarksApi = useBookmarks();
  const [autoRefreshInterval, setAutoRefreshInterval] = useAutoRefreshInterval();

  useEffect(() => {
    const ms = AUTO_REFRESH_INTERVAL_MS[autoRefreshInterval];
    if (!ms) return;
    const id = setInterval(refresh, ms);
    return () => clearInterval(id);
  }, [autoRefreshInterval, refresh]);

  return (
    <DashboardView
      feeds={userFeedsApi.feeds}
      hiddenCuratedFeeds={userFeedsApi.hiddenCuratedFeeds}
      addFeed={userFeedsApi.addFeed}
      renameFeed={userFeedsApi.renameFeed}
      removeFeed={userFeedsApi.removeFeed}
      restoreFeed={userFeedsApi.restoreFeed}
      items={items}
      health={health}
      loading={loading}
      refresh={refresh}
      retryFeed={retryFeed}
      readIds={readStateApi.readIds}
      markRead={readStateApi.markRead}
      toggleRead={readStateApi.toggleRead}
      markAllRead={readStateApi.markAllRead}
      categoriesApi={categoriesApi}
      layout={layout}
      onLayoutChange={setLayout}
      bookmarkedIds={bookmarksApi.bookmarkedIds}
      bookmarkedAt={bookmarksApi.bookmarkedAt}
      toggleBookmark={bookmarksApi.toggleBookmark}
      autoRefreshInterval={autoRefreshInterval}
      onAutoRefreshChange={setAutoRefreshInterval}
      newItemsCount={newItemsCount}
      onDismissNewItems={dismissNewItems}
    />
  );
}

// Signed-in: same UI, Supabase-backed data. `userId` is only ever set once
// per mount (App.tsx keys this component by user id), so it's safe to treat
// as stable for this instance's lifetime.
function DashboardRemote({ userId }: { userId: string }) {
  const userFeedsApi = useUserFeedsRemote(userId);
  const { items, health, loading, refresh, retryFeed, newItemsCount, dismissNewItems } = useFeeds(
    userFeedsApi.feeds,
  );
  const categoriesApi = useCategoriesRemote(userId);
  // Effective (post-override) category per item, resolved once here so the
  // read-event write can attribute a read without re-deriving categorization
  // logic inside the remote hook itself.
  const itemMeta: ReadEventMeta = useMemo(() => {
    const map: ReadEventMeta = new Map();
    for (const item of items) {
      map.set(item.id, {
        feedId: item.feedId,
        categoryKey: categoriesApi.resolveCategoryId(item.feedId, item.category),
      });
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, categoriesApi.categories]);
  const readStateApi = useReadStateRemote(userId, itemMeta);
  const [layout, setLayout] = usePreferencesRemote(userId);
  const bookmarksApi = useBookmarksRemote(userId);
  const [autoRefreshInterval, setAutoRefreshInterval] = useAutoRefreshIntervalRemote(userId);

  useEffect(() => {
    const ms = AUTO_REFRESH_INTERVAL_MS[autoRefreshInterval];
    if (!ms) return;
    const id = setInterval(refresh, ms);
    return () => clearInterval(id);
  }, [autoRefreshInterval, refresh]);

  return (
    <DashboardView
      feeds={userFeedsApi.feeds}
      hiddenCuratedFeeds={userFeedsApi.hiddenCuratedFeeds}
      addFeed={userFeedsApi.addFeed}
      renameFeed={userFeedsApi.renameFeed}
      removeFeed={userFeedsApi.removeFeed}
      restoreFeed={userFeedsApi.restoreFeed}
      items={items}
      health={health}
      loading={loading}
      refresh={refresh}
      retryFeed={retryFeed}
      readIds={readStateApi.readIds}
      markRead={readStateApi.markRead}
      toggleRead={readStateApi.toggleRead}
      markAllRead={readStateApi.markAllRead}
      categoriesApi={categoriesApi}
      layout={layout}
      onLayoutChange={setLayout}
      bookmarkedIds={bookmarksApi.bookmarkedIds}
      bookmarkedAt={bookmarksApi.bookmarkedAt}
      toggleBookmark={bookmarksApi.toggleBookmark}
      autoRefreshInterval={autoRefreshInterval}
      onAutoRefreshChange={setAutoRefreshInterval}
      newItemsCount={newItemsCount}
      onDismissNewItems={dismissNewItems}
    />
  );
}

function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center">
        Loading…
      </div>
    );
  }

  return user ? <DashboardRemote key={user.id} userId={user.id} /> : <DashboardLocal />;
}

export default Dashboard;
