import { useEffect, useRef } from "react";
import { FolderOpen, Bookmark, CircleCheck, CircleX, AlertTriangle, RotateCw, X } from "lucide-react";
import Categories from "./Categories";
import type { BlogFeed, FeedHealth, FeedItem } from "../types/feed";
import type { UseCategoriesResult } from "../hooks/useCategories";
import { SAVED_CATEGORY } from "../pages/Homepage";
import { formatCount } from "../utils/formatCount";

// 3+ consecutive failures reads as "likely dead" rather than a transient blip.
const DEAD_THRESHOLD = 3;

type SidebarProps = {
  items: FeedItem[];
  feeds: BlogFeed[];
  health: Record<string, FeedHealth>;
  readIds: Record<string, boolean>;
  bookmarkedIds: Record<string, boolean>;
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  onMarkFeedRead: (items: FeedItem[]) => void;
  categoriesApi: UseCategoriesResult;
  onRenameFeed: (feedId: string, name: string) => void;
  onRemoveFeed: (feedId: string) => void;
  onRetryFeed: (feedId: string) => Promise<void>;
};

function SidebarContent({
  items,
  feeds,
  health,
  readIds,
  bookmarkedIds,
  selectedCategory,
  onCategorySelect,
  onMarkFeedRead,
  categoriesApi,
  onRenameFeed,
  onRemoveFeed,
  onRetryFeed,
}: SidebarProps) {
  const feedName = (feedId: string) => feeds.find((f) => f.id === feedId)?.name ?? feedId;
  const healthEntries = Object.values(health);
  const unreadTotal = items.filter((item) => !readIds[item.id]).length;
  const temporaryErrorFeeds = healthEntries.filter(
    (h) => h.status === "error" && h.consecutiveFailures < DEAD_THRESHOLD,
  );
  const deadFeeds = healthEntries.filter((h) => h.status === "error" && h.consecutiveFailures >= DEAD_THRESHOLD);
  const staleFeeds = healthEntries.filter((h) => h.status === "stale");

  return (
    <>
      {/* Top section */}
      <div className="mt-2 border-b border-border-subtle pb-4">
        <button
          type="button"
          aria-current={selectedCategory === "All" ? "true" : undefined}
          onClick={() => onCategorySelect("All")}
          className={`flex items-center gap-2 w-full rounded-md px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            selectedCategory === "All"
              ? "bg-accent-subtle text-accent font-semibold"
              : "hover:bg-accent-subtle hover:text-accent"
          }`}
        >
          <FolderOpen className="h-5 w-5" />
          <span>All Items</span>
          <span className="ml-auto">{formatCount(unreadTotal)}</span>
        </button>

        <button
          type="button"
          aria-current={selectedCategory === SAVED_CATEGORY ? "true" : undefined}
          onClick={() => onCategorySelect(SAVED_CATEGORY)}
          className={`flex items-center gap-2 w-full rounded-md px-2 py-2 mt-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            selectedCategory === SAVED_CATEGORY
              ? "bg-accent-subtle text-accent font-semibold"
              : "hover:bg-accent-subtle hover:text-accent"
          }`}
        >
          <Bookmark className="h-5 w-5" />
          <span>Saved</span>
          <span className="ml-auto">{formatCount(Object.keys(bookmarkedIds).length)}</span>
        </button>
      </div>

      {/* Categories */}
      <div className="border-b border-border-subtle pb-4 mt-2">
        <h2 className="uppercase text-md font-semibold text-text-tertiary mb-2">
          Categories
        </h2>

        <Categories
          items={items}
          feeds={feeds}
          readIds={readIds}
          health={health}
          categories={categoriesApi.categories}
          allCategories={categoriesApi.allCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          onMarkFeedRead={onMarkFeedRead}
          resolveCategoryId={categoriesApi.resolveCategoryId}
          onAddCategory={categoriesApi.addCategory}
          onRenameCategory={categoriesApi.renameCategory}
          onDeleteCategory={categoriesApi.deleteCategory}
          onMoveCategory={categoriesApi.moveCategory}
          onAssignFeedCategory={categoriesApi.assignFeedCategory}
          onRenameFeed={onRenameFeed}
          onRemoveFeed={onRemoveFeed}
        />
      </div>

      <div className="px-2 py-2 text-md mt-2" role="status" aria-live="polite">
        {temporaryErrorFeeds.length === 0 && deadFeeds.length === 0 && staleFeeds.length === 0 ? (
          <div className="flex items-center gap-2">
            <CircleCheck className="h-5 w-5 text-success" aria-hidden="true" />
            <span>All feeds healthy</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {deadFeeds.length > 0 && (
              <div className="flex items-center gap-2">
                <CircleX className="h-5 w-5 text-error" aria-hidden="true" />
                <span>
                  {deadFeeds.length} feed{deadFeeds.length === 1 ? "" : "s"} likely dead
                </span>
              </div>
            )}
            {temporaryErrorFeeds.length > 0 && (
              <div className="flex items-center gap-2">
                <CircleX className="h-5 w-5 text-error" aria-hidden="true" />
                <span>
                  {temporaryErrorFeeds.length} feed{temporaryErrorFeeds.length === 1 ? "" : "s"} erroring
                </span>
              </div>
            )}
            {staleFeeds.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                <span>
                  {staleFeeds.length} feed{staleFeeds.length === 1 ? "" : "s"} stale
                </span>
              </div>
            )}
            <ul className="ml-7 text-sm text-text-tertiary space-y-0.5">
              {deadFeeds.map((h) => (
                <li key={h.feedId} className="flex items-center justify-between gap-2">
                  <span aria-label={`Feed status: likely dead - ${feedName(h.feedId)} - ${h.error} - failed ${h.consecutiveFailures} times in a row`}>
                    {feedName(h.feedId)}: {h.error} (failed {h.consecutiveFailures}x)
                  </span>
                  <button
                    type="button"
                    onClick={() => onRetryFeed(h.feedId)}
                    aria-label={`Retry ${feedName(h.feedId)}`}
                    className="shrink-0 rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
              {temporaryErrorFeeds.map((h) => (
                <li key={h.feedId} className="flex items-center justify-between gap-2">
                  <span aria-label={`Feed status: error - ${feedName(h.feedId)} - ${h.error}`}>
                    {feedName(h.feedId)}: {h.error}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRetryFeed(h.feedId)}
                    aria-label={`Retry ${feedName(h.feedId)}`}
                    className="shrink-0 rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
              {staleFeeds.map((h) => (
                <li
                  key={h.feedId}
                  aria-label={`Feed status: stale - ${feedName(h.feedId)} - no new items in over 30 days`}
                >
                  {feedName(h.feedId)}: no new items in 30+ days
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

function Sidebar(props: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-sidebar border-r border-border bg-bg-secondary px-3 text-text-secondary">
      <SidebarContent {...props} />
    </aside>
  );
}

type MobileNavDrawerProps = SidebarProps & {
  isOpen: boolean;
  onClose: () => void;
};

function MobileNavDrawer({ isOpen, onClose, ...contentProps }: MobileNavDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex lg:hidden">
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="relative flex flex-col w-sidebar max-w-[80vw] h-full border-r border-border bg-bg-secondary px-3 text-text-secondary shadow-lg"
      >
        <div className="flex items-center justify-end pt-2">
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="flex items-center justify-center min-h-11 min-w-11 rounded-md hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <SidebarContent
          {...contentProps}
          onCategorySelect={(category) => {
            contentProps.onCategorySelect(category);
            onClose();
          }}
        />
      </div>
    </div>
  );
}

export default Sidebar;
export { MobileNavDrawer };
