import { BookOpen, Bookmark } from "lucide-react";
import type { FeedCardProps } from "../types/feed";
import { formatDate } from "../utils/formatDate";
import { highlightMatch } from "../utils/highlightMatch";

function GridCard({
  item,
  isRead,
  onRead,
  onToggleRead,
  categoryLabel,
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
      className={`flex flex-col rounded-lg border border-border-subtle overflow-hidden ${isRead ? "opacity-70" : ""} ${isFocused ? "ring-2 ring-accent" : ""}`}
    >
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onRead(item.id)}
        className="block hover:bg-bg-tertiary"
      >
        <div className="aspect-video w-full bg-bg-tertiary">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-3xl font-bold text-white"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            >
              {item.author.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 p-3">
          {!isRead && <span className="sr-only">Unread.</span>}
          <h3 className="font-bold leading-tight line-clamp-2">{highlightMatch(item.title, searchQuery)}</h3>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <span className="font-medium" style={{ color: item.color }}>
              {item.author}
            </span>
            <span aria-hidden="true">·</span>
            <span>{item.publishedAt ? formatDate(item.publishedAt) : "Unknown date"}</span>
          </div>
          <span className="sr-only">(opens in new tab)</span>
        </div>
      </a>

      <div className="flex items-center justify-between px-3 pb-3">
        <span className="rounded-full border border-border-subtle bg-bg-tertiary px-2.5 py-0.5 text-xs text-text-secondary">
          {categoryLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleRead(item.id)}
            aria-pressed={!isRead}
            aria-label={isRead ? "Mark as unread" : "Mark as read"}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${isRead ? "border border-border-subtle" : "bg-unread"}`}
            />
          </button>
          <button
            type="button"
            onClick={() => onToggleBookmark(item.id)}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? "Remove bookmark" : "Save for later"}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isBookmarked ? "text-accent hover:bg-accent-subtle" : "text-text-tertiary hover:bg-bg-tertiary hover:text-accent"
            }`}
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => onOpenReader(item.id)}
            aria-label={`Read "${item.title}" in app`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default GridCard;
