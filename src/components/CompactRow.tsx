import { BookOpen, Bookmark } from "lucide-react";
import type { FeedCardProps } from "../types/feed";
import { formatDate } from "../utils/formatDate";
import { highlightMatch } from "../utils/highlightMatch";

function CompactRow({
  item,
  isRead,
  onRead,
  onToggleRead,
  onOpenReader,
  isBookmarked,
  onToggleBookmark,
  searchQuery,
  domId,
  isFocused,
}: FeedCardProps) {
  return (
    <li
      id={domId}
      className={`group flex items-center gap-2 px-2 py-1 ${isFocused ? "ring-2 ring-inset ring-accent" : ""}`}
    >
      <button
        type="button"
        onClick={() => onToggleRead(item.id)}
        aria-pressed={!isRead}
        aria-label={isRead ? "Mark as unread" : "Mark as read"}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${isRead ? "border border-border-subtle" : "bg-unread"}`}
        />
      </button>

      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onRead(item.id)}
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 hover:bg-bg-tertiary ${isRead ? "opacity-70" : ""}`}
      >
        {!isRead && <span className="sr-only">Unread.</span>}
        <span className="truncate font-medium">{highlightMatch(item.title, searchQuery)}</span>
        <span className="shrink-0 text-xs text-text-tertiary" style={{ color: item.color }}>
          {item.author}
        </span>
        <span className="ml-auto shrink-0 text-xs text-text-tertiary">
          {item.publishedAt ? formatDate(item.publishedAt) : "Unknown date"}
        </span>
        <span className="sr-only">(opens in new tab)</span>
      </a>

      <button
        type="button"
        onClick={() => onToggleBookmark(item.id)}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? "Remove bookmark" : "Save for later"}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          isBookmarked
            ? "text-accent hover:bg-accent-subtle"
            : "text-text-tertiary opacity-0 hover:bg-bg-tertiary hover:text-accent focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
        }`}
      >
        <Bookmark className="h-3.5 w-3.5" aria-hidden="true" fill={isBookmarked ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={() => onOpenReader(item.id)}
        aria-label={`Read "${item.title}" in app`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-tertiary opacity-0 transition-colors hover:bg-bg-tertiary hover:text-accent focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </li>
  );
}

export default CompactRow;
