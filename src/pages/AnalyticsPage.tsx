import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useReadingAnalytics } from "../hooks/useReadingAnalytics";
import { useCategoriesRemote } from "../hooks/useCategoriesRemote";
import { useUserFeedsRemote } from "../hooks/useUserFeedsRemote";
import StatTile from "../components/analytics/StatTile";
import ChartCard from "../components/analytics/ChartCard";
import DailyReadsChart, { DailyReadsTable } from "../components/analytics/DailyReadsChart";
import RankedBarList, { RankedBarTable } from "../components/analytics/RankedBarList";
import ActivityHeatmap, { ActivityHeatmapTable } from "../components/analytics/ActivityHeatmap";

const RANGE_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function PageHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-page items-center gap-4 px-6 py-4">
        <Link
          to="/app"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Link>
        <span className="text-xl font-bold">Frontpage</span>
      </div>
    </header>
  );
}

function SignInPrompt() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="mx-auto flex w-full max-w-content flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Reading analytics needs an account</h1>
        <p className="mt-3 text-text-secondary">
          Your reading history is tracked per account, so this page is only available when
          you're signed in.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/signup"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Sign up
          </Link>
          <Link
            to="/signin"
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}

function AnalyticsContent({ userId }: { userId: string }) {
  const analytics = useReadingAnalytics(userId);
  const categoriesApi = useCategoriesRemote(userId);
  const userFeedsApi = useUserFeedsRemote(userId);
  const [rangeDays, setRangeDays] = useState(30);

  const feedNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const feed of [...userFeedsApi.feeds, ...userFeedsApi.hiddenCuratedFeeds]) map.set(feed.id, feed.name);
    return map;
  }, [userFeedsApi.feeds, userFeedsApi.hiddenCuratedFeeds]);

  const categoryRows = useMemo(
    () =>
      analytics.categoryCounts.map((row) => ({
        key: row.key,
        label: categoriesApi.categoryNameById(row.key),
        count: row.count,
      })),
    [analytics.categoryCounts, categoriesApi],
  );

  const feedRows = useMemo(
    () =>
      analytics.feedCounts.map((row) => ({
        key: row.key,
        label: feedNameById.get(row.key) ?? "Removed feed",
        count: row.count,
      })),
    [analytics.feedCounts, feedNameById],
  );

  const dailySlice = analytics.dailyCounts.slice(-rangeDays);

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="mx-auto w-full max-w-page flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold">Reading analytics</h1>
        <p className="mt-1 text-text-secondary">A look at what you've been reading and how often.</p>

        {analytics.loading ? (
          <p className="mt-8 text-text-secondary">Loading your reading history…</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile label="Total articles read" value={analytics.totalReads.toLocaleString()} />
              <StatTile
                label="Current streak"
                value={`${analytics.currentStreak} day${analytics.currentStreak === 1 ? "" : "s"}`}
                hint={
                  analytics.currentStreak === 0
                    ? "Read something today to start one"
                    : `Best: ${analytics.longestStreak} day${analytics.longestStreak === 1 ? "" : "s"}`
                }
              />
              <StatTile
                label={`Read in last ${rangeDays} days`}
                value={dailySlice.reduce((sum, day) => sum + day.count, 0).toLocaleString()}
              />
            </div>

            <div className="mt-8">
              <ChartCard
                title="Activity"
                caption="Last 90 days"
                chart={<ActivityHeatmap data={analytics.dailyCounts} />}
                table={<ActivityHeatmapTable data={analytics.dailyCounts} />}
              />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-end gap-1" role="group" aria-label="Date range">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.days}
                    type="button"
                    onClick={() => setRangeDays(option.days)}
                    aria-pressed={rangeDays === option.days}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      rangeDays === option.days
                        ? "border-accent bg-accent-subtle text-accent"
                        : "border-border hover:bg-bg-tertiary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <ChartCard
                title="Articles read per day"
                chart={<DailyReadsChart data={dailySlice} />}
                table={<DailyReadsTable data={dailySlice} />}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard
                title="Top categories"
                chart={
                  <RankedBarList rows={categoryRows} emptyMessage="No categorized reads yet — read a few articles to see this." />
                }
                table={
                  <RankedBarTable rows={categoryRows} emptyMessage="No categorized reads yet — read a few articles to see this." />
                }
              />
              <ChartCard
                title="Top sources"
                chart={<RankedBarList rows={feedRows} emptyMessage="No attributed reads yet — read a few articles to see this." />}
                table={
                  <RankedBarTable rows={feedRows} emptyMessage="No attributed reads yet — read a few articles to see this." />
                }
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function AnalyticsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center">
        Loading…
      </div>
    );
  }

  return user ? <AnalyticsContent key={user.id} userId={user.id} /> : <SignInPrompt />;
}

export default AnalyticsPage;
