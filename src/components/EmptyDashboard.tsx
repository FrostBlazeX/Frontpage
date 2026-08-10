import { Rss, Plus } from "lucide-react";
import type { BlogFeed } from "../types/feed";
import AuthorAvatar from "./AuthorAvatar";
import { getFaviconUrl } from "../utils/favicon";

type EmptyDashboardProps = {
  hiddenCuratedFeeds: BlogFeed[];
  onAddFeedClick: () => void;
  onRestoreFeed: (feedId: string) => void;
};

// The only real cold-start in this frontend-only app: everyone starts with
// the curated 19 feeds pre-loaded, so this only renders if someone has
// removed every single one (curated + user-added).
function EmptyDashboard({ hiddenCuratedFeeds, onAddFeedClick, onRestoreFeed }: EmptyDashboardProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle text-accent">
        <Rss className="h-8 w-8" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">Your dashboard is empty</h1>
        <p className="max-w-md text-text-secondary">
          You've removed every feed. Add one by URL, or bring back any of the curated feeds below.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddFeedClick}
        className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add a feed
      </button>

      {hiddenCuratedFeeds.length > 0 && (
        <div className="mt-4 w-full max-w-lg text-left">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            Or bring back a curated feed
          </h2>
          <ul className="divide-y divide-border-subtle rounded-md border border-border-subtle">
            {hiddenCuratedFeeds.map((feed) => (
              <li key={feed.id} className="flex items-center gap-2 px-3 py-2">
                <AuthorAvatar
                  name={feed.name}
                  backgroundColor={feed.color}
                  faviconUrl={getFaviconUrl(feed.siteUrl)}
                />
                <span className="flex-1 truncate text-sm">{feed.name}</span>
                <button
                  type="button"
                  onClick={() => onRestoreFeed(feed.id)}
                  className="rounded-md border border-border px-2.5 py-1 text-sm font-medium transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Add back
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default EmptyDashboard;
