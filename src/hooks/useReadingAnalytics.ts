import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export interface DailyCount {
  date: string; // YYYY-MM-DD, local time
  count: number;
}

export interface KeyCount {
  key: string;
  count: number;
}

export interface UseReadingAnalyticsResult {
  loading: boolean;
  totalReads: number;
  currentStreak: number;
  longestStreak: number;
  // Last 90 days, ascending, zero-filled — the daily chart and the heatmap
  // both slice from the end of this rather than triggering their own fetch.
  dailyCounts: DailyCount[];
  // All-time, descending. Only rows with a resolvable feed/category are
  // counted — reads recorded before this feature's migration (or for an item
  // whose feed couldn't be resolved) simply don't attribute to a source.
  categoryCounts: KeyCount[];
  feedCounts: KeyCount[];
}

const HISTORY_DAYS = 90;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreaks(dateKeys: Set<string>): { current: number; longest: number } {
  const cursor = new Date();
  if (!dateKeys.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (dateKeys.has(toDateKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sortedKeys = Array.from(dateKeys).sort();
  let longest = 0;
  let run = 0;
  let prevDate: Date | null = null;
  for (const key of sortedKeys) {
    const date = new Date(`${key}T00:00:00`);
    const diffDays = prevDate ? Math.round((date.getTime() - prevDate.getTime()) / 86_400_000) : null;
    run = diffDays === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prevDate = date;
  }

  return { current, longest };
}

function rankCounts(counts: Map<string, number>): KeyCount[] {
  return Array.from(counts, ([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

interface ReadEventRow {
  read_at: string;
  feed_id: string | null;
  category_key: string | null;
}

// Signed-in only — built on `read_events`, which only exists for accounts,
// not guest localStorage state. See spec/differentiators.md's Reading
// Analytics section and 0001_init.sql's read_events table.
export function useReadingAnalytics(userId: string): UseReadingAnalyticsResult {
  const [rows, setRows] = useState<ReadEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("read_events")
        .select("read_at, feed_id, category_key")
        .eq("user_id", userId);
      if (cancelled) return;
      setRows(data ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return useMemo(() => {
    const byDay = new Map<string, number>();
    const categoryTotals = new Map<string, number>();
    const feedTotals = new Map<string, number>();

    for (const row of rows) {
      const dateKey = toDateKey(new Date(row.read_at));
      byDay.set(dateKey, (byDay.get(dateKey) ?? 0) + 1);
      if (row.category_key) categoryTotals.set(row.category_key, (categoryTotals.get(row.category_key) ?? 0) + 1);
      if (row.feed_id) feedTotals.set(row.feed_id, (feedTotals.get(row.feed_id) ?? 0) + 1);
    }

    const dailyCounts: DailyCount[] = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - (HISTORY_DAYS - 1));
    for (let i = 0; i < HISTORY_DAYS; i++) {
      const key = toDateKey(cursor);
      dailyCounts.push({ date: key, count: byDay.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const { current, longest } = computeStreaks(new Set(byDay.keys()));

    return {
      loading,
      totalReads: rows.length,
      currentStreak: current,
      longestStreak: longest,
      dailyCounts,
      categoryCounts: rankCounts(categoryTotals),
      feedCounts: rankCounts(feedTotals),
    };
  }, [rows, loading]);
}
