import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import FeedHeader from "../components/FeedHeader";
import FeedPage from "../components/FeedPage";
import ReaderView from "../components/ReaderView";
import type { FeedHealth, FeedItem } from "../types/feed";
import type { FeedLayout } from "../hooks/useLayoutPreference";
import type { AutoRefreshInterval } from "../hooks/useAutoRefreshInterval";
import { formatDate } from "../utils/formatDate";

// Sentinel selectedCategory value, alongside "All" — see Sidebar.tsx.
export const SAVED_CATEGORY = "Saved";

type HomepageProps = {
  items: FeedItem[];
  loading: boolean;
  selectedCategory: string;
  onRefresh: () => void;
  readIds: Record<string, boolean>;
  onRead: (id: string) => void;
  onToggleRead: (id: string) => void;
  onMarkAllRead: (items: FeedItem[]) => void;
  resolveCategoryId: (feedId: string, defaultCategoryName: string) => string;
  resolveCategoryName: (feedId: string, defaultCategoryName: string) => string;
  categoryNameById: (id: string) => string;
  layout: FeedLayout;
  onLayoutChange: (layout: FeedLayout) => void;
  bookmarkedIds: Record<string, boolean>;
  bookmarkedAt: Record<string, number>;
  onToggleBookmark: (id: string) => void;
  searchQuery: string;
  health: Record<string, FeedHealth>;
  autoRefreshInterval: AutoRefreshInterval;
  onAutoRefreshChange: (interval: AutoRefreshInterval) => void;
  newItemsCount: number;
  onDismissNewItems: () => void;
  lastVisitAt: number | null;
};

const Homepage = ({
  items,
  loading,
  selectedCategory,
  onRefresh,
  readIds,
  onRead,
  onToggleRead,
  onMarkAllRead,
  resolveCategoryId,
  resolveCategoryName,
  categoryNameById,
  layout,
  onLayoutChange,
  bookmarkedIds,
  bookmarkedAt,
  onToggleBookmark,
  searchQuery,
  health,
  autoRefreshInterval,
  onAutoRefreshChange,
  newItemsCount,
  onDismissNewItems,
  lastVisitAt,
}: HomepageProps) => {
  const [readerItemId, setReaderItemId] = useState<string | null>(null);
  const [savedSortBy, setSavedSortBy] = useState<"saved" | "published">("saved");

  const categoryFilteredItems =
    selectedCategory === "All"
      ? items
      : selectedCategory === SAVED_CATEGORY
        ? items.filter((item) => bookmarkedIds[item.id])
        : items.filter((item) => resolveCategoryId(item.feedId, item.category) === selectedCategory);

  const sortedItems =
    selectedCategory === SAVED_CATEGORY && savedSortBy === "saved"
      ? [...categoryFilteredItems].sort((a, b) => (bookmarkedAt[b.id] ?? 0) - (bookmarkedAt[a.id] ?? 0))
      : categoryFilteredItems;

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const visibleItems = trimmedQuery
    ? sortedItems.filter((item) =>
        [item.title, item.author, item.excerpt, item.content].some((field) =>
          field.toLowerCase().includes(trimmedQuery),
        ),
      )
    : sortedItems;

  const categoryLabel =
    selectedCategory === "All"
      ? "All Items"
      : selectedCategory === SAVED_CATEGORY
        ? "Saved"
        : categoryNameById(selectedCategory);

  const markAllRead = () => onMarkAllRead(visibleItems);

  const unreadCount = visibleItems.filter((item) => !readIds[item.id]).length;

  const newSinceLastVisitCount = lastVisitAt
    ? visibleItems.filter(
        (item) => item.publishedAt && new Date(item.publishedAt).getTime() > lastVisitAt,
      ).length
    : 0;

  const lastUpdatedAt = Object.values(health).reduce<number | null>((latest, h) => {
    const time = new Date(h.fetchedAt).getTime();
    return latest === null || time > latest ? time : latest;
  }, null);
  const lastUpdatedLabel = lastUpdatedAt ? formatDate(new Date(lastUpdatedAt).toISOString()) : null;

  const readerIndex = readerItemId ? visibleItems.findIndex((item) => item.id === readerItemId) : -1;
  const readerItem = readerIndex >= 0 ? visibleItems[readerIndex] : null;

  const openReader = (id: string) => {
    onRead(id);
    setReaderItemId(id);
  };
  const goToReaderOffset = (offset: 1 | -1) => {
    const nextItem = visibleItems[readerIndex + offset];
    if (!nextItem) return;
    onRead(nextItem.id);
    setReaderItemId(nextItem.id);
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <FeedHeader
        selectedCategory={categoryLabel}
        unreadCount={unreadCount}
        onRefresh={onRefresh}
        onMarkAllRead={markAllRead}
        layout={layout}
        onLayoutChange={onLayoutChange}
        autoRefreshInterval={autoRefreshInterval}
        onAutoRefreshChange={onAutoRefreshChange}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      {newItemsCount > 0 && (
        <button
          type="button"
          onClick={onDismissNewItems}
          role="status"
          className="flex w-full items-center justify-center gap-2 px-6 py-2 border-b border-border bg-accent-subtle text-accent text-sm font-semibold transition-colors hover:bg-accent-subtle/80"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {newItemsCount} new item{newItemsCount === 1 ? "" : "s"} just arrived — tap to dismiss
        </button>
      )}

      {newSinceLastVisitCount > 0 && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 px-6 py-2 border-b border-border bg-accent-subtle text-accent text-sm font-semibold"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          {newSinceLastVisitCount} new item{newSinceLastVisitCount === 1 ? "" : "s"} since your last
          visit
        </div>
      )}

      {selectedCategory === SAVED_CATEGORY && (
        <div className="flex items-center justify-end gap-2 px-6 py-2 border-b border-border-subtle text-sm">
          <span className="text-text-tertiary">Sort by</span>
          <div className="flex gap-1" role="group" aria-label="Sort saved items">
            {(["saved", "published"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSavedSortBy(option)}
                aria-pressed={savedSortBy === option}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  savedSortBy === option
                    ? "bg-accent-subtle text-accent"
                    : "text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                {option === "saved" ? "Date saved" : "Date published"}
              </button>
            ))}
          </div>
        </div>
      )}

      <FeedPage
        key={selectedCategory}
        items={visibleItems}
        loading={loading}
        selectedCategory={categoryLabel}
        readIds={readIds}
        onRead={onRead}
        onToggleRead={onToggleRead}
        resolveCategoryName={resolveCategoryName}
        onOpenReader={openReader}
        layout={layout}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={onToggleBookmark}
        searchQuery={searchQuery}
      />

      {readerItem && (
        <ReaderView
          key={readerItem.id}
          item={readerItem}
          categoryLabel={resolveCategoryName(readerItem.feedId, readerItem.category)}
          onClose={() => setReaderItemId(null)}
          onNext={() => goToReaderOffset(1)}
          onPrev={() => goToReaderOffset(-1)}
          hasNext={readerIndex >= 0 && readerIndex < visibleItems.length - 1}
          hasPrev={readerIndex > 0}
          isBookmarked={!!bookmarkedIds[readerItem.id]}
          onToggleBookmark={onToggleBookmark}
        />
      )}
    </div>
  );
};
export default Homepage;
