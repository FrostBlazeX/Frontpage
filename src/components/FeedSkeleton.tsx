import type { FeedLayout } from "../hooks/useLayoutPreference";

type FeedSkeletonProps = {
  layout: FeedLayout;
};

const PLACEHOLDER_COUNT = 8;

// Shown only for the very first load (FeedPage.tsx), matching each layout's
// real shape so nothing shifts once actual content replaces it — avoids the
// layout-shift a bare "Loading…" message would cause.
function FeedSkeleton({ layout }: FeedSkeletonProps) {
  const placeholders = Array.from({ length: PLACEHOLDER_COUNT });

  if (layout === "grid") {
    return (
      <div
        role="status"
        aria-label="Loading your feeds"
        className="grid w-full grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {placeholders.map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-lg border border-border-subtle">
            <div className="aspect-video w-full bg-bg-tertiary" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-4 w-3/4 rounded bg-bg-tertiary" />
              <div className="h-3 w-1/2 rounded bg-bg-tertiary" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div role="status" aria-label="Loading your feeds" className="w-full divide-y divide-border-subtle p-4">
        {placeholders.map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-2 px-2 py-2">
            <div className="h-6 w-6 shrink-0 rounded-full bg-bg-tertiary" />
            <div className="h-4 w-1/2 rounded bg-bg-tertiary" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div role="status" aria-label="Loading your feeds" className="w-full divide-y divide-border-subtle p-4">
      {placeholders.map((_, i) => (
        <div key={i} className="flex animate-pulse items-start gap-3 px-2 py-4">
          <div className="h-6 w-6 shrink-0 rounded-full bg-bg-tertiary" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-2/3 rounded bg-bg-tertiary" />
            <div className="h-3 w-1/3 rounded bg-bg-tertiary" />
            <div className="h-3 w-full rounded bg-bg-tertiary" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeedSkeleton;
