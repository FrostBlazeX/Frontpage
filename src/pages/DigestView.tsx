import { useState } from "react";
import BlogCard from "../components/BlogCard";
import ReaderView from "../components/ReaderView";
import type { FeedItem } from "../types/feed";
import type { Category } from "../hooks/useCategories";

type DigestViewProps = {
  items: FeedItem[];
  lastVisitAt: number | null;
  categories: Category[];
  resolveCategoryId: (feedId: string, defaultCategoryName: string) => string;
  resolveCategoryName: (feedId: string, defaultCategoryName: string) => string;
  readIds: Record<string, boolean>;
  onRead: (id: string) => void;
  onToggleRead: (id: string) => void;
  bookmarkedIds: Record<string, boolean>;
  onToggleBookmark: (id: string) => void;
  onViewAllCategory: (categoryId: string) => void;
};

const ITEMS_PER_CATEGORY = 5;

// The Design-It-Yourself "Digest / Summary View" — a since-last-visit
// briefing grouped by category, rather than the main feed's chronological
// list. Builds on the same lastVisitAt snapshot the main feed's "N new since
// last visit" banner already uses (see useLastVisit.ts), just sliced and
// grouped differently: top N most-recent qualifying items per category
// instead of one flat count.
function DigestView({
  items,
  lastVisitAt,
  categories,
  resolveCategoryId,
  resolveCategoryName,
  readIds,
  onRead,
  onToggleRead,
  bookmarkedIds,
  onToggleBookmark,
  onViewAllCategory,
}: DigestViewProps) {
  const [readerItemId, setReaderItemId] = useState<string | null>(null);

  const newItems = lastVisitAt
    ? items.filter((item) => item.publishedAt && new Date(item.publishedAt).getTime() > lastVisitAt)
    : [];

  const groups = categories
    .map((category) => {
      const categoryItems = newItems
        .filter((item) => resolveCategoryId(item.feedId, item.category) === category.id)
        .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime());
      return { category, categoryItems };
    })
    .filter((group) => group.categoryItems.length > 0);

  const allDigestItems = groups.flatMap((group) => group.categoryItems.slice(0, ITEMS_PER_CATEGORY));
  const readerIndex = readerItemId ? allDigestItems.findIndex((item) => item.id === readerItemId) : -1;
  const readerItem = readerIndex >= 0 ? allDigestItems[readerIndex] : null;

  const openReader = (id: string) => {
    onRead(id);
    setReaderItemId(id);
  };
  const goToReaderOffset = (offset: 1 | -1) => {
    const nextItem = allDigestItems[readerIndex + offset];
    if (!nextItem) return;
    onRead(nextItem.id);
    setReaderItemId(nextItem.id);
  };

  return (
    <div className="flex flex-1 flex-col w-full">
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Digest</h1>
        <p className="text-sm text-text-secondary">What's new since your last visit, by category.</p>
      </div>

      {groups.length === 0 ? (
        <div role="status" className="p-8 text-center text-text-tertiary">
          Nothing new since your last visit.
        </div>
      ) : (
        <div className="w-full p-4">
          {groups.map(({ category, categoryItems }) => (
            <section key={category.id} className="mb-6">
              <div className="mb-2 flex items-center justify-between px-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                  {category.name} · {categoryItems.length} new
                </h2>
                <button
                  type="button"
                  onClick={() => onViewAllCategory(category.id)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  View all in {category.name}
                </button>
              </div>
              <ul className="divide-y divide-border-subtle">
                {categoryItems.slice(0, ITEMS_PER_CATEGORY).map((item) => (
                  <BlogCard
                    key={item.id}
                    item={item}
                    isRead={!!readIds[item.id]}
                    onRead={onRead}
                    onToggleRead={onToggleRead}
                    categoryLabel={resolveCategoryName(item.feedId, item.category)}
                    onOpenReader={openReader}
                    isBookmarked={!!bookmarkedIds[item.id]}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {readerItem && (
        <ReaderView
          key={readerItem.id}
          item={readerItem}
          categoryLabel={resolveCategoryName(readerItem.feedId, readerItem.category)}
          onClose={() => setReaderItemId(null)}
          onNext={() => goToReaderOffset(1)}
          onPrev={() => goToReaderOffset(-1)}
          hasNext={readerIndex >= 0 && readerIndex < allDigestItems.length - 1}
          hasPrev={readerIndex > 0}
          isBookmarked={!!bookmarkedIds[readerItem.id]}
          onToggleBookmark={onToggleBookmark}
        />
      )}
    </div>
  );
}

export default DigestView;
