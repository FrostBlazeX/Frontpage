import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar, { MobileNavDrawer } from "../components/Sidebar";
import Homepage from "./Homepage";
import { SAVED_CATEGORY } from "./Homepage";
import DigestView from "./DigestView";
import AddFeedDialog from "../components/AddFeedDialog";
import EmptyDashboard from "../components/EmptyDashboard";
import CommandPalette from "../components/CommandPalette";
import type { CommandAction } from "../components/CommandPalette";
import KeyboardShortcutsDialog from "../components/KeyboardShortcutsDialog";
import type { BlogFeed, FeedHealth, FeedItem } from "../types/feed";
import type { UseCategoriesResult } from "../hooks/useCategories";
import type { NewFeedInput } from "../hooks/useUserFeeds";
import { VALID_LAYOUTS } from "../hooks/useLayoutPreference";
import type { FeedLayout } from "../hooks/useLayoutPreference";
import type { AutoRefreshInterval } from "../hooks/useAutoRefreshInterval";
import { useLastVisit } from "../hooks/useLastVisit";

function isTypingElement(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

type DashboardViewProps = {
  feeds: BlogFeed[];
  hiddenCuratedFeeds: BlogFeed[];
  addFeed: (input: NewFeedInput) => void;
  renameFeed: (feedId: string, name: string) => void;
  removeFeed: (feedId: string) => void;
  restoreFeed: (feedId: string) => void;
  items: FeedItem[];
  health: Record<string, FeedHealth>;
  loading: boolean;
  refresh: () => Promise<void>;
  retryFeed: (feedId: string) => Promise<void>;
  readIds: Record<string, boolean>;
  markRead: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllRead: (items: FeedItem[]) => void;
  categoriesApi: UseCategoriesResult;
  layout: FeedLayout;
  onLayoutChange: (layout: FeedLayout) => void;
  bookmarkedIds: Record<string, boolean>;
  bookmarkedAt: Record<string, number>;
  toggleBookmark: (id: string) => void;
  autoRefreshInterval: AutoRefreshInterval;
  onAutoRefreshChange: (interval: AutoRefreshInterval) => void;
  newItemsCount: number;
  onDismissNewItems: () => void;
};

// Pure presentation: everything here is identical for guest and signed-in
// users. Dashboard.tsx picks which hooks feed these props from (localStorage
// vs Supabase) — this component doesn't know or care which.
function DashboardView({
  feeds,
  hiddenCuratedFeeds,
  addFeed,
  renameFeed,
  removeFeed,
  restoreFeed,
  items,
  health,
  loading,
  refresh,
  retryFeed,
  readIds,
  markRead,
  toggleRead,
  markAllRead,
  categoriesApi,
  layout,
  onLayoutChange,
  bookmarkedIds,
  bookmarkedAt,
  toggleBookmark,
  autoRefreshInterval,
  onAutoRefreshChange,
  newItemsCount,
  onDismissNewItems,
}: DashboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [view, setView] = useState<"feed" | "digest">("feed");
  const navigate = useNavigate();
  const lastVisitAt = useLastVisit();

  // If the currently-selected category gets deleted, fall back to "All"
  // rather than silently filtering everything out.
  const sidebarCategoriesApi = {
    ...categoriesApi,
    deleteCategory: (id: string) => {
      categoriesApi.deleteCategory(id);
      setSelectedCategory((prev) => (prev === id ? "All" : prev));
    },
  };

  // Keyboard Navigation: Cmd/Ctrl+K (command palette, works even mid-typing —
  // it's a modifier combo, not organic text input) and "?" (shortcuts help,
  // guarded like every other bare-key shortcut so it doesn't fire while typing).
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      if (event.key === "?" && !isTypingElement(event.target)) {
        event.preventDefault();
        setIsShortcutsHelpOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const LAYOUT_LABELS: Record<FeedLayout, string> = { list: "List", grid: "Grid", compact: "Compact" };
  const commandActions: CommandAction[] = [
    {
      id: "go-all",
      label: "Go to All Items",
      run: () => {
        setView("feed");
        setSelectedCategory("All");
      },
    },
    {
      id: "go-saved",
      label: "Go to Saved",
      run: () => {
        setView("feed");
        setSelectedCategory(SAVED_CATEGORY);
      },
    },
    { id: "go-digest", label: "Go to Digest", run: () => setView("digest") },
    ...categoriesApi.categories.map((category) => ({
      id: `go-category-${category.id}`,
      label: `Go to category: ${category.name}`,
      run: () => {
        setView("feed");
        setSelectedCategory(category.id);
      },
    })),
    ...VALID_LAYOUTS.map((option) => ({
      id: `layout-${option}`,
      label: `Switch to ${LAYOUT_LABELS[option]} layout`,
      hint: layout === option ? "current" : undefined,
      run: () => onLayoutChange(option),
    })),
    { id: "mark-all-read", label: "Mark all items as read", run: () => markAllRead(items) },
    { id: "add-feed", label: "Add a feed", run: () => setIsAddFeedOpen(true) },
    { id: "go-analytics", label: "Go to Reading Analytics", run: () => navigate("/analytics") },
    { id: "go-accessibility", label: "Go to Accessibility statement", run: () => navigate("/accessibility") },
    { id: "show-shortcuts", label: "Show keyboard shortcuts", run: () => setIsShortcutsHelpOpen(true) },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header
        onMenuClick={() => setIsMobileNavOpen(true)}
        onAddFeedClick={() => setIsAddFeedOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={view}
        onViewChange={setView}
      />

      <div className="flex flex-1">
        <Sidebar
          items={items}
          feeds={feeds}
          health={health}
          readIds={readIds}
          bookmarkedIds={bookmarkedIds}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onMarkFeedRead={markAllRead}
          categoriesApi={sidebarCategoriesApi}
          onRenameFeed={renameFeed}
          onRemoveFeed={removeFeed}
          onRetryFeed={retryFeed}
        />

        <MobileNavDrawer
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          items={items}
          feeds={feeds}
          health={health}
          readIds={readIds}
          bookmarkedIds={bookmarkedIds}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onMarkFeedRead={markAllRead}
          categoriesApi={sidebarCategoriesApi}
          onRenameFeed={renameFeed}
          onRemoveFeed={removeFeed}
          onRetryFeed={retryFeed}
        />

        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto flex flex-col">
          {feeds.length === 0 ? (
            <EmptyDashboard
              hiddenCuratedFeeds={hiddenCuratedFeeds}
              onAddFeedClick={() => setIsAddFeedOpen(true)}
              onRestoreFeed={restoreFeed}
            />
          ) : view === "digest" ? (
            <DigestView
              items={items}
              lastVisitAt={lastVisitAt}
              categories={categoriesApi.categories}
              resolveCategoryId={categoriesApi.resolveCategoryId}
              resolveCategoryName={categoriesApi.resolveCategoryName}
              readIds={readIds}
              onRead={markRead}
              onToggleRead={toggleRead}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
              onViewAllCategory={(categoryId) => {
                setView("feed");
                setSelectedCategory(categoryId);
              }}
            />
          ) : (
            <Homepage
              items={items}
              loading={loading}
              selectedCategory={selectedCategory}
              onRefresh={refresh}
              readIds={readIds}
              onRead={markRead}
              onToggleRead={toggleRead}
              onMarkAllRead={markAllRead}
              resolveCategoryId={categoriesApi.resolveCategoryId}
              resolveCategoryName={categoriesApi.resolveCategoryName}
              categoryNameById={categoriesApi.categoryNameById}
              layout={layout}
              onLayoutChange={onLayoutChange}
              bookmarkedIds={bookmarkedIds}
              bookmarkedAt={bookmarkedAt}
              onToggleBookmark={toggleBookmark}
              searchQuery={searchQuery}
              health={health}
              autoRefreshInterval={autoRefreshInterval}
              onAutoRefreshChange={onAutoRefreshChange}
              newItemsCount={newItemsCount}
              onDismissNewItems={onDismissNewItems}
              lastVisitAt={lastVisitAt}
            />
          )}
        </main>
      </div>

      {isAddFeedOpen && (
        <AddFeedDialog
          onClose={() => setIsAddFeedOpen(false)}
          categories={categoriesApi.allCategories}
          onAddFeed={addFeed}
          hiddenCuratedFeeds={hiddenCuratedFeeds}
          onRestoreFeed={restoreFeed}
          existingFeeds={feeds}
          categoryOrder={categoriesApi.categories.map((c) => c.name)}
        />
      )}

      {isCommandPaletteOpen && (
        <CommandPalette actions={commandActions} onClose={() => setIsCommandPaletteOpen(false)} />
      )}

      {isShortcutsHelpOpen && <KeyboardShortcutsDialog onClose={() => setIsShortcutsHelpOpen(false)} />}
    </div>
  );
}

export default DashboardView;
