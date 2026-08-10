import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { X, ChevronLeft, ChevronRight, ExternalLink, Bookmark } from "lucide-react";
import type { FeedItem } from "../types/feed";
import { formatDate } from "../utils/formatDate";
import { calculateReadingTime } from "../utils/calculateReadingTime";
import { getFaviconUrl } from "../utils/favicon";

// Article bodies can carry many images; lazy-loading them (rather than
// letting the browser fetch every one the instant the reader opens) keeps
// initial render fast regardless of article length.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "IMG") node.setAttribute("loading", "lazy");
});

type ReaderViewProps = {
  item: FeedItem;
  categoryLabel: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
};

// Parent mounts one instance per open article (key={item.id}), so switching
// articles via next/prev naturally re-runs this mount-only effect — no need
// to track "which article" separately from the component's own lifecycle.
function ReaderView({
  item,
  categoryLabel,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isBookmarked,
  onToggleBookmark,
}: ReaderViewProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    contentRef.current?.scrollTo(0, 0);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight" && hasNext) {
        onNext();
      } else if (event.key === "ArrowLeft" && hasPrev) {
        onPrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // Re-run only per article mount (see component comment above), not on
    // every hasNext/hasPrev/onNext/onPrev identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasFullContent = item.content.trim().length > 0;
  const sanitizedContent = hasFullContent ? DOMPurify.sanitize(item.content) : "";
  const siteHostname = (() => {
    try {
      return new URL(item.siteUrl).hostname.replace(/^www\./, "");
    } catch {
      return item.siteUrl;
    }
  })();

  return (
    <div
      ref={contentRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
    >
      <button
        type="button"
        aria-label="Close reader"
        onClick={onClose}
        className="fixed inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-heading"
        className="reader-panel relative my-4 w-full max-w-content rounded-lg border border-border bg-surface shadow-lg"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-lg border-b border-border bg-surface px-4 py-3 sm:px-6">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Previous article"
              className="flex items-center justify-center min-h-9 min-w-9 rounded-md transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next article"
              className="flex items-center justify-center min-h-9 min-w-9 rounded-md transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleBookmark(item.id)}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? "Remove bookmark" : "Save for later"}
              className={`flex items-center justify-center min-h-9 min-w-9 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isBookmarked ? "text-accent hover:bg-accent-subtle" : "hover:bg-bg-tertiary"
              }`}
            >
              <Bookmark className="h-5 w-5" aria-hidden="true" fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close reader"
              className="flex items-center justify-center min-h-9 min-w-9 rounded-md transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-8 sm:py-8">
          <p className="mb-2 text-sm text-text-tertiary">{categoryLabel}</p>
          <h1 id="reader-heading" className="mb-3 text-2xl font-bold leading-tight">
            {item.title}
          </h1>
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-text-tertiary">
            <img
              src={getFaviconUrl(item.siteUrl)}
              alt=""
              aria-hidden="true"
              className="h-5 w-5 rounded-sm bg-bg-tertiary object-contain"
            />
            <span className="font-medium" style={{ color: item.color }}>
              {item.author}
            </span>
            <span aria-hidden="true">·</span>
            <span>{item.publishedAt ? formatDate(item.publishedAt) : "Unknown date"}</span>
            <span aria-hidden="true">·</span>
            <span>{calculateReadingTime(item.content || item.excerpt)}</span>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-accent transition-colors hover:bg-accent-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              View original
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </div>

          {hasFullContent ? (
            <div className="reader-content" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          ) : (
            <div className="reader-content">
              <p>{item.excerpt}</p>
              <p className="text-text-tertiary">
                This feed only provides a summary.{" "}
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  Read the full article on {siteHostname}
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReaderView;
