export interface BlogFeed {
  id: string;
  name: string;
  url: string;
  siteUrl: string;
  category: string;
  color: string;
}

export interface FeedItem {
  id: string;
  feedId: string;
  category: string;
  color: string;
  siteUrl: string;
  title: string;
  link: string;
  author: string;
  publishedAt: string | null;
  excerpt: string;
  content: string;
  imageUrl: string | null;
}

// Shared prop contract for the per-layout card components (BlogCard/GridCard/
// CompactRow) so FeedPage can swap which one it renders without each variant
// inventing its own prop names.
export interface FeedCardProps {
  item: FeedItem;
  isRead: boolean;
  onRead: (id: string) => void;
  onToggleRead: (id: string) => void;
  categoryLabel: string;
  onOpenReader: (id: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  searchQuery?: string;
  // Keyboard Navigation (j/k) — which item currently has "list focus", and
  // the DOM id FeedPage uses to scroll it into view. Optional since not
  // every consumer of these cards needs keyboard nav (none do today besides
  // FeedPage, but this keeps the props non-breaking for any other caller).
  domId?: string;
  isFocused?: boolean;
}

export type FeedStatus = "healthy" | "stale" | "error";

export interface FeedHealth {
  feedId: string;
  status: FeedStatus;
  error?: string;
  fetchedAt: string;
  // Consecutive failed fetches in a row (resets to 0 on success). Used to
  // distinguish a likely-temporary error from a likely-dead feed.
  consecutiveFailures: number;
}

// Wire contract returned by /api/feed — kept separate from FeedItem so the UI's
// domain type isn't coupled to the API response shape.
export interface ApiFeedItem {
  id: string;
  title: string;
  link: string;
  author: string;
  publishedAt: string | null;
  excerpt: string;
  content: string;
  imageUrl: string | null;
}

export type ApiFeedResponse =
  | { ok: true; items: ApiFeedItem[]; fetchedAt: string }
  | { ok: false; error: string; fetchedAt: string };

// Wire contract returned by /api/validateFeed.
export type ApiValidateFeedResponse =
  | { ok: true; feedTitle: string; feedDescription: string; siteUrl: string; itemCount: number }
  | { ok: false; error: string };
