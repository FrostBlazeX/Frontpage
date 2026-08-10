import { useEffect, useState } from "react";
import type { FeedItem } from "../types/feed";
import BlogCard from "./BlogCard";
import GridCard from "./GridCard";
import CompactRow from "./CompactRow";
import FeedSkeleton from "./FeedSkeleton";
import { groupItemsByDay } from "../utils/groupItemsByDay";
import type { FeedLayout } from "../hooks/useLayoutPreference";

type FeedPageProps = {
  items: FeedItem[];
  loading: boolean;
  selectedCategory: string;
  readIds: Record<string, boolean>;
  onRead: (id: string) => void;
  onToggleRead: (id: string) => void;
  resolveCategoryName: (feedId: string, defaultCategoryName: string) => string;
  onOpenReader: (id: string) => void;
  layout: FeedLayout;
  bookmarkedIds: Record<string, boolean>;
  onToggleBookmark: (id: string) => void;
  searchQuery?: string;
};

const PAGE_SIZE = 30;

const CARD_COMPONENT = { list: BlogCard, grid: GridCard, compact: CompactRow };
const LIST_CLASS = {
  list: "divide-y divide-border-subtle",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  compact: "divide-y divide-border-subtle",
};

function isTypingOrModalOpen(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  const isTyping = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  return isTyping || !!document.querySelector('[role="dialog"]');
}

function domIdFor(itemId: string): string {
  return `feed-item-${itemId}`;
}

// Parent passes key={selectedCategory}, so this remounts (and visibleCount
// resets to PAGE_SIZE) whenever the category changes — no effect needed.
function FeedPage({
  items,
  loading,
  selectedCategory,
  readIds,
  onRead,
  onToggleRead,
  resolveCategoryName,
  onOpenReader,
  layout,
  bookmarkedIds,
  onToggleBookmark,
  searchQuery,
}: FeedPageProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Keyboard Navigation (j/k/o/Enter/s/m) — -1 means nothing focused yet;
  // the first j/k press picks a starting item. Hooks all live above the
  // early returns below so they run unconditionally every render.
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleItems.length;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingOrModalOpen(event.target)) return;
      if (visibleItems.length === 0) return;

      if (event.key === "j" || event.key === "k") {
        event.preventDefault();
        setFocusedIndex((prev) => {
          if (event.key === "j") {
            if (prev >= visibleItems.length - 1 && hasMore) {
              setVisibleCount((count) => count + PAGE_SIZE);
            }
            return Math.min(prev + 1, visibleItems.length - 1 + (hasMore ? 1 : 0));
          }
          return Math.max(prev - 1, 0);
        });
        return;
      }

      if (focusedIndex < 0 || focusedIndex >= visibleItems.length) return;
      const focusedItem = visibleItems[focusedIndex];

      if (event.key === "o" || event.key === "Enter") {
        event.preventDefault();
        onOpenReader(focusedItem.id);
      } else if (event.key === "s") {
        event.preventDefault();
        onToggleBookmark(focusedItem.id);
      } else if (event.key === "m") {
        event.preventDefault();
        onToggleRead(focusedItem.id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visibleItems, hasMore, focusedIndex, onOpenReader, onToggleBookmark, onToggleRead]);

  useEffect(() => {
    if (focusedIndex < 0 || focusedIndex >= visibleItems.length) return;
    document
      .getElementById(domIdFor(visibleItems[focusedIndex].id))
      ?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, visibleItems]);

  // Only block the whole view on the very first load. A manual refresh with
  // items already on screen gets a small inline note instead (patterns.md:
  // "Don't block the UI while feeds are refreshing").
  if (loading && items.length === 0) {
    return <FeedSkeleton layout={layout} />;
  }

  if (items.length === 0) {
    return (
      <div role="status" aria-live="polite" className="p-8 text-center text-text-tertiary">
        {searchQuery?.trim() ? (
          <>No results for "{searchQuery.trim()}".</>
        ) : (
          <>No articles found for "{selectedCategory}".</>
        )}
      </div>
    );
  }

  const groups = groupItemsByDay(visibleItems);
  const CardComponent = CARD_COMPONENT[layout];

  return (
    <div className="w-full p-4">
      {loading && (
        <p role="status" aria-live="polite" className="pb-3 text-sm text-text-tertiary">
          Refreshing feeds…
        </p>
      )}

      {groups.map((group) => (
        <section key={group.label} className="mb-2">
          <h2 className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            {group.label}
          </h2>
          <ul className={LIST_CLASS[layout]}>
            {group.items.map((item) => {
              const index = visibleItems.indexOf(item);
              return (
                <CardComponent
                  key={item.id}
                  item={item}
                  isRead={!!readIds[item.id]}
                  onRead={onRead}
                  onToggleRead={onToggleRead}
                  categoryLabel={resolveCategoryName(item.feedId, item.category)}
                  onOpenReader={onOpenReader}
                  isBookmarked={!!bookmarkedIds[item.id]}
                  onToggleBookmark={onToggleBookmark}
                  searchQuery={searchQuery}
                  domId={domIdFor(item.id)}
                  isFocused={index === focusedIndex}
                />
              );
            })}
          </ul>
        </section>
      ))}

      {hasMore && (
        <div className="pt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Load more ({items.length - visibleItems.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

export default FeedPage;
