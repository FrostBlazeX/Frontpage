import { RxTextAlignLeft } from "react-icons/rx";
import { BiRefresh } from "react-icons/bi";
import IconButtons from "./IconButtons";
import type { FeedLayout } from "../hooks/useLayoutPreference";
import type { AutoRefreshInterval } from "../hooks/useAutoRefreshInterval";
import { VALID_AUTO_REFRESH_INTERVALS } from "../hooks/useAutoRefreshInterval";

const INTERVAL_LABELS: Record<AutoRefreshInterval, string> = {
  off: "Manual only",
  "15m": "Every 15 min",
  "30m": "Every 30 min",
  "1h": "Every hour",
};

type FeedHeaderProps = {
  selectedCategory: string;
  unreadCount: number;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  layout: FeedLayout;
  onLayoutChange: (layout: FeedLayout) => void;
  autoRefreshInterval: AutoRefreshInterval;
  onAutoRefreshChange: (interval: AutoRefreshInterval) => void;
  lastUpdatedLabel: string | null;
};

function FeedHeader({
  selectedCategory,
  unreadCount,
  onRefresh,
  onMarkAllRead,
  layout,
  onLayoutChange,
  autoRefreshInterval,
  onAutoRefreshChange,
  lastUpdatedLabel,
}: FeedHeaderProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-between items-center px-4 sm:px-6 py-4 border-b border-border">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">
          {selectedCategory === "All" ? "All Items" : selectedCategory}
        </h1>
        <h2 className="text-sm text-text-secondary font-light">
          {unreadCount} unread
        </h2>
        {lastUpdatedLabel && (
          <span className="hidden text-xs text-text-tertiary sm:inline">· Updated {lastUpdatedLabel}</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <IconButtons layout={layout} onLayoutChange={onLayoutChange} />

        <button
          type="button"
          className="hidden sm:flex items-center gap-1 rounded-md border border-border text-text-primary px-3 py-1.5 font-semibold transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="relative -top-1">
            <RxTextAlignLeft className="h-4 w-4" />
          </span>
          <span>Newest</span>
        </button>

        <label htmlFor="auto-refresh-interval" className="sr-only">
          Auto-refresh interval
        </label>
        <select
          id="auto-refresh-interval"
          value={autoRefreshInterval}
          onChange={(event) => onAutoRefreshChange(event.target.value as AutoRefreshInterval)}
          className="rounded-md border border-border bg-bg-primary px-2 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {VALID_AUTO_REFRESH_INTERVALS.map((interval) => (
            <option key={interval} value={interval}>
              {INTERVAL_LABELS[interval]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh feeds"
          className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 font-semibold transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <BiRefresh />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 font-semibold transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}
export default FeedHeader;
