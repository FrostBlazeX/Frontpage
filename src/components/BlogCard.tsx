import { BookOpen, Bookmark } from "lucide-react";
import type { FeedCardProps } from "../types/feed";
import AuthorAvatar from "./AuthorAvatar";
import { formatDate } from "../utils/formatDate";
import { calculateReadingTime } from "../utils/calculateReadingTime";
import { getFaviconUrl } from "../utils/favicon";
import { highlightMatch } from "../utils/highlightMatch";

function BlogCard({
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
      className={`flex items-start gap-3 px-2 ${isFocused ? "ring-2 ring-inset ring-accent" : ""}`}
    >
      <div className="pt-5 w-6 flex justify-center">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            onToggleRead(item.id);
          }}
          aria-pressed={!isRead}
          aria-label={isRead ? "Mark as unread" : "Mark as read"}
          className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isRead ? "hover:bg-bg-tertiary" : "hover:bg-accent-subtle"
          }`}
        >
          <span
            aria-hidden="true"
            className={`w-2.5 h-2.5 rounded-full ${isRead ? "border border-border-subtle" : "bg-unread"}`}
          />
        </button>
      </div>
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onRead(item.id)}
        className={`flex-1 flex gap-2 py-4 hover:bg-bg-tertiary cursor-pointer ${isRead ? "opacity-70" : ""}`}
      >
        <div className="flex flex-col flex-1 gap-2">
          {!isRead && <span className="sr-only">Unread.</span>}

          <h3 className="text-lg font-bold leading-tight">{highlightMatch(item.title, searchQuery)}</h3>

          <div className="flex items-center gap-2 text-sm text-text-tertiary">
            <AuthorAvatar
              name={item.author}
              backgroundColor={item.color}
              faviconUrl={getFaviconUrl(item.siteUrl)}
            />

            <span className="font-medium" style={{ color: item.color }}>
              {item.author}
            </span>

            <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />

            <span>{item.publishedAt ? formatDate(item.publishedAt) : "Unknown date"}</span>

            <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />

            <span>{calculateReadingTime(item.content)}</span>
          </div>

          <p className="pb-1 text-sm leading-6 tracking-wide text-text-secondary line-clamp-2">
            {highlightMatch(item.excerpt, searchQuery)}
          </p>

          <div className="flex items-center justify-between">
            <span className="rounded-full border border-border-subtle bg-bg-tertiary px-3 py-1 text-sm text-text-secondary">
              {categoryLabel}
            </span>
          </div>

          <span className="sr-only">(opens in new tab)</span>
        </div>
      </a>
      <div className="pt-5 shrink-0 flex gap-1">
        <button
          type="button"
          onClick={() => onToggleBookmark(item.id)}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? "Remove bookmark" : "Save for later"}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isBookmarked ? "text-accent hover:bg-accent-subtle" : "text-text-tertiary hover:bg-bg-tertiary hover:text-accent"
          }`}
        >
          <Bookmark className="h-4 w-4" aria-hidden="true" fill={isBookmarked ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={() => onOpenReader(item.id)}
          aria-label={`Read "${item.title}" in app`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export default BlogCard;
