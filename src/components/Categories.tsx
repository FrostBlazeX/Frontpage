import { useState } from "react";
import { CheckCheck, ChevronUp, ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import type { BlogFeed, FeedHealth, FeedItem } from "../types/feed";
import type { Category } from "../hooks/useCategories";
import AuthorAvatar from "./AuthorAvatar";
import { getFaviconUrl } from "../utils/favicon";
import { formatDate } from "../utils/formatDate";
import { formatCount } from "../utils/formatCount";

type CategoriesProps = {
  items: FeedItem[];
  feeds: BlogFeed[];
  readIds: Record<string, boolean>;
  health: Record<string, FeedHealth>;
  categories: Category[];
  allCategories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  onMarkFeedRead: (items: FeedItem[]) => void;
  resolveCategoryId: (feedId: string, defaultCategoryName: string) => string;
  onAddCategory: (name: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onMoveCategory: (id: string, direction: "up" | "down") => void;
  onAssignFeedCategory: (feedId: string, categoryId: string) => void;
  onRenameFeed: (feedId: string, name: string) => void;
  onRemoveFeed: (feedId: string) => void;
};

// Any category name (including custom/renamed ones) gets a stable, distinct
// dot color derived from its id — no manual per-name mapping to maintain.
const DOT_COLOR_PALETTE = [
  "bg-blue-600",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-amber-600",
  "bg-rose-500",
  "bg-cyan-600",
  "bg-lime-600",
];

function dotColorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (Math.imul(hash, 31) + id.charCodeAt(i)) | 0;
  return DOT_COLOR_PALETTE[Math.abs(hash) % DOT_COLOR_PALETTE.length];
}

const ColorDot = ({ color }: { color: string }) => (
  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
);

const iconButtonClass =
  "rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30 disabled:pointer-events-none";

type CategoryRowProps = {
  category: Category;
  count: number;
  active: boolean;
  editable: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

const CategoryRow = ({
  category,
  count,
  active,
  editable,
  isFirst,
  isLast,
  onSelect,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CategoryRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(category.name);

  if (isEditing) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onRename(draftName);
          setIsEditing(false);
        }}
        className="flex items-center gap-2 px-2 py-1"
      >
        <label htmlFor={`rename-${category.id}`} className="sr-only">
          Rename category {category.name}
        </label>
        <input
          id={`rename-${category.id}`}
          autoFocus
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setDraftName(category.name);
              setIsEditing(false);
            }
          }}
          onBlur={() => {
            onRename(draftName);
            setIsEditing(false);
          }}
          className="flex-1 min-w-0 rounded-md border border-border bg-surface px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </form>
    );
  }

  return (
    <div className="group flex items-center gap-1">
      <button
        type="button"
        aria-current={active ? "true" : undefined}
        onClick={onSelect}
        className={`
  flex flex-1 min-w-0 items-center gap-2 rounded-md px-2 py-2
  transition-colors text-left
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
  ${
    active
      ? "bg-accent-subtle text-accent font-semibold"
      : "bg-bg-tertiary text-text-secondary hover:bg-accent-subtle hover:text-accent"
  }
`}
      >
        <ColorDot color={dotColorForId(category.id)} />
        <span className="flex-1 truncate">{category.name}</span>
        <span className="text-text-tertiary w-8 text-right">{formatCount(count)}</span>
      </button>

      {editable && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={`Move ${category.name} up`}
            className={iconButtonClass}
          >
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={`Move ${category.name} down`}
            className={iconButtonClass}
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label={`Rename ${category.name}`}
            className={iconButtonClass}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${category.name}`}
            className={iconButtonClass}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

type FeedRowProps = {
  feedId: string;
  name: string;
  color: string;
  siteUrl: string;
  count: number;
  lastFetchedAt?: string;
  categoryId: string;
  allCategories: Category[];
  onMarkRead: () => void;
  onAssignCategory: (categoryId: string) => void;
  onRename: (name: string) => void;
  onRemove: () => void;
};

const FeedRow = ({
  feedId,
  name,
  color,
  siteUrl,
  count,
  lastFetchedAt,
  categoryId,
  allCategories,
  onMarkRead,
  onAssignCategory,
  onRename,
  onRemove,
}: FeedRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);

  if (isEditing) {
    return (
      <li className="px-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onRename(draftName);
            setIsEditing(false);
          }}
          className="flex items-center gap-2 py-1"
        >
          <label htmlFor={`feed-rename-${feedId}`} className="sr-only">
            Rename feed {name}
          </label>
          <input
            id={`feed-rename-${feedId}`}
            autoFocus
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setDraftName(name);
                setIsEditing(false);
              }
            }}
            onBlur={() => {
              onRename(draftName);
              setIsEditing(false);
            }}
            className="flex-1 min-w-0 rounded-md border border-border bg-surface px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </form>
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-2 px-2 rounded-md hover:bg-bg-tertiary">
      <AuthorAvatar name={name} backgroundColor={color} faviconUrl={getFaviconUrl(siteUrl)} />
      <span
        className="flex-1 text-md truncate"
        title={lastFetchedAt ? `Last fetched: ${formatDate(lastFetchedAt)}` : undefined}
      >
        {name}
      </span>
      <span className="text-sm text-text-tertiary">{formatCount(count)}</span>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <label className="sr-only" htmlFor={`category-${feedId}`}>
          Category for {name}
        </label>
        <select
          id={`category-${feedId}`}
          value={categoryId}
          onChange={(event) => onAssignCategory(event.target.value)}
          aria-label={`Category for ${name}`}
          className="rounded-md border border-border bg-surface px-1 py-0.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onMarkRead}
          aria-label={`Mark all ${name} items as read`}
          className={iconButtonClass}
        >
          <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label={`Rename ${name}`}
          className={iconButtonClass}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className={iconButtonClass}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
};

const AddCategoryForm = ({ onAdd }: { onAdd: (name: string) => void }) => {
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        onAdd(name);
        setName("");
      }}
      className="flex items-center gap-1 px-2 pt-1"
    >
      <label htmlFor="new-category-name" className="sr-only">
        New category name
      </label>
      <input
        id="new-category-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New category…"
        className="flex-1 min-w-0 rounded-md border border-border bg-surface px-2 py-1 text-sm placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      <button
        type="submit"
        aria-label="Add category"
        disabled={!name.trim()}
        className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30 disabled:pointer-events-none"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
};

function Categories({
  items,
  feeds,
  readIds,
  health,
  categories,
  allCategories,
  selectedCategory,
  onCategorySelect,
  onMarkFeedRead,
  resolveCategoryId,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onMoveCategory,
  onAssignFeedCategory,
  onRenameFeed,
  onRemoveFeed,
}: CategoriesProps) {
  return (
    <div className="space-y-2">
      {allCategories.map((category, index) => {
        const editable = index < categories.length; // Uncategorized (the trailing entry) isn't editable
        const categoryFeeds = feeds.filter(
          (feed) => resolveCategoryId(feed.id, feed.category) === category.id,
        );
        const count = items.filter(
          (item) => resolveCategoryId(item.feedId, item.category) === category.id && !readIds[item.id],
        ).length;

        return (
          <div key={category.id}>
            <CategoryRow
              category={category}
              count={count}
              active={selectedCategory === category.id}
              editable={editable}
              isFirst={index === 0}
              isLast={index === categories.length - 1}
              onSelect={() => onCategorySelect(category.id)}
              onRename={(name) => onRenameCategory(category.id, name)}
              onDelete={() => {
                if (window.confirm(`Delete "${category.name}"? Its feeds will move to Uncategorized.`)) {
                  onDeleteCategory(category.id);
                }
              }}
              onMoveUp={() => onMoveCategory(category.id, "up")}
              onMoveDown={() => onMoveCategory(category.id, "down")}
            />
            {categoryFeeds.length > 0 && (
              <ul className="ml-4 space-y-2 mt-1">
                {categoryFeeds.map((feed) => {
                  const feedItems = items.filter((item) => item.feedId === feed.id);
                  const unreadCount = feedItems.filter((item) => !readIds[item.id]).length;

                  return (
                    <FeedRow
                      key={feed.id}
                      feedId={feed.id}
                      name={feed.name}
                      color={feed.color}
                      siteUrl={feed.siteUrl}
                      count={unreadCount}
                      lastFetchedAt={health[feed.id]?.fetchedAt}
                      categoryId={category.id}
                      allCategories={allCategories}
                      onMarkRead={() => onMarkFeedRead(feedItems)}
                      onAssignCategory={(categoryId) => onAssignFeedCategory(feed.id, categoryId)}
                      onRename={(name) => onRenameFeed(feed.id, name)}
                      onRemove={() => {
                        if (window.confirm(`Remove "${feed.name}"? Its items will no longer appear.`)) {
                          onRemoveFeed(feed.id);
                        }
                      }}
                    />
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      <AddCategoryForm onAdd={onAddCategory} />
    </div>
  );
}
export default Categories;
